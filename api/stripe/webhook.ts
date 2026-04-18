/**
 * Vercel Serverless Stripe Webhook handler
 * Receives Stripe events with raw body for signature verification.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import * as db from "../../server/db";
import { getProductByPriceId, isPremiumProduct, isTokenProduct, STRIPE_PRODUCTS } from "../../server/stripe/products";

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    _stripe = new Stripe(key);
  }
  return _stripe;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sig = req.headers["stripe-signature"];
  if (!sig) {
    return res.status(400).json({ error: "Missing stripe-signature header" });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET not configured");
    return res.status(500).json({ error: "Webhook secret not configured" });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await getRawBody(req);
    event = getStripe().webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Stripe Webhook] Signature verification failed:", message);
    return res.status(400).json({ error: `Webhook Error: ${message}` });
  }

  console.log(`[Stripe Webhook] Received: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      default:
        console.log(`[Stripe Webhook] Unhandled event: ${event.type}`);
    }

    return res.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Processing error:", error);
    return res.status(500).json({ error: "Webhook handler failed" });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = parseInt(session.metadata?.user_id || "0");
  if (!userId) return;

  if (session.mode === "subscription") {
    const subscriptionId = session.subscription as string;
    const customerId = session.customer as string;
    const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
    const priceId = subscription.items?.data?.[0]?.price?.id;
    if (!priceId) return;

    const productKey = getProductByPriceId(priceId);
    if (!productKey || !isPremiumProduct(productKey)) return;

    const expiresAt = new Date(subscription.current_period_end * 1000);
    await db.setPremiumStatus(userId, true, expiresAt, customerId);
    await db.createPurchase({
      userId,
      type: "subscription",
      itemId: productKey,
      amount: session.amount_total || 0,
      currency: session.currency?.toUpperCase() || "EUR",
      stripePaymentId: session.payment_intent as string,
      stripeSubscriptionId: subscriptionId,
      status: "completed",
    });
  } else if (session.mode === "payment") {
    const lineItems = await getStripe().checkout.sessions.listLineItems(session.id);
    const priceId = lineItems.data[0]?.price?.id;
    if (!priceId) return;

    const productKey = getProductByPriceId(priceId);
    if (!productKey || !isTokenProduct(productKey)) return;

    const product = STRIPE_PRODUCTS[productKey];
    const tokens = "tokens" in product ? product.tokens : 0;
    await db.addTokens(userId, tokens, "purchase", `Purchased ${tokens} tokens`);
    await db.createPurchase({
      userId,
      type: "tokens",
      itemId: productKey,
      amount: session.amount_total || 0,
      currency: session.currency?.toUpperCase() || "EUR",
      stripePaymentId: session.payment_intent as string,
      status: "completed",
    });
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const dbInstance = await db.getDb();
  if (!dbInstance) return;

  const { users: usersTable } = await import("../../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  const usersResult = await dbInstance.select().from(usersTable).where(eq(usersTable.stripeCustomerId, customerId));
  if (usersResult.length === 0) return;

  const userId = usersResult[0]!.id;
  if (subscription.status === "active") {
    const expiresAt = new Date(subscription.current_period_end * 1000);
    await db.setPremiumStatus(userId, true, expiresAt, customerId);
  } else {
    await db.setPremiumStatus(userId, false, undefined, customerId);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const dbInstance = await db.getDb();
  if (!dbInstance) return;

  const { users: usersTable } = await import("../../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  const usersResult = await dbInstance.select().from(usersTable).where(eq(usersTable.stripeCustomerId, customerId));
  if (usersResult.length === 0) return;

  await db.setPremiumStatus(usersResult[0]!.id, false, undefined, customerId);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId) return;

  const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
  const dbInstance = await db.getDb();
  if (!dbInstance) return;

  const { users: usersTable } = await import("../../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  const usersResult = await dbInstance.select().from(usersTable).where(eq(usersTable.stripeCustomerId, customerId));
  if (usersResult.length === 0) return;

  const userId = usersResult[0]!.id;
  const expiresAt = new Date(subscription.current_period_end * 1000);
  await db.setPremiumStatus(userId, true, expiresAt, customerId);
}
