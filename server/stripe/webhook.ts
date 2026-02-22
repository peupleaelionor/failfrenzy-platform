import { eq } from "drizzle-orm";
import { Request, Response } from "express";
import type Stripe from "stripe";
import { users } from "../../drizzle/schema";
import * as db from "../db";
import { getStripeClient } from "./client";
import { getProductByPriceId, isPremiumProduct, isTokenProduct, STRIPE_PRODUCTS } from "./products";

async function findUserByStripeCustomerId(customerId: string) {
  const dbInstance = await db.getDb();
  if (!dbInstance) return null;

  const result = await dbInstance
    .select()
    .from(users)
    .where(eq(users.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function handleStripeWebhook(req: Request, res: Response) {
  const stripe = getStripeClient();
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    console.error("[Stripe Webhook] Missing signature");
    return res.status(400).send("Missing signature");
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || "");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Stripe Webhook] Signature verification failed:", message);
    return res.status(400).send("Webhook signature verification failed");
  }

  // Handle test events
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    return res.json({
      verified: true,
    });
  }

  console.log(`[Stripe Webhook] Received event: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Error processing event:", error);
    res.status(500).send("Webhook handler failed");
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const stripe = getStripeClient();
  console.log("[Stripe] Checkout completed:", session.id);

  const userId = parseInt(session.metadata?.user_id || "0");
  if (!userId) {
    console.error("[Stripe] No user_id in session metadata");
    return;
  }

  const mode = session.mode;

  if (mode === "subscription") {
    const subscriptionId = session.subscription as string;
    const customerId = session.customer as string;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = subscription.items?.data?.[0]?.price?.id;

    if (!priceId) {
      console.error("[Stripe] No price ID found in subscription");
      return;
    }

    const productKey = getProductByPriceId(priceId);

    if (!productKey || !isPremiumProduct(productKey)) {
      console.error("[Stripe] Invalid premium product");
      return;
    }

    const periodEnd = (subscription as unknown as Record<string, unknown>).current_period_end;
    const expiresAt = new Date((periodEnd as number) * 1000);

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

    console.log(`[Stripe] Premium activated for user ${userId} until ${expiresAt}`);
  } else if (mode === "payment") {
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    const priceId = lineItems.data[0]?.price?.id;

    if (!priceId) {
      console.error("[Stripe] No price ID found in line items");
      return;
    }

    const productKey = getProductByPriceId(priceId);

    if (!productKey || !isTokenProduct(productKey)) {
      console.error("[Stripe] Invalid token product");
      return;
    }

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

    console.log(`[Stripe] Added ${tokens} tokens to user ${userId}`);
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const stripe = getStripeClient();
  console.log("[Stripe] Invoice paid:", invoice.id);

  const customerId = invoice.customer as string;
  const subscriptionId = (invoice as unknown as Record<string, unknown>).subscription as string;

  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const user = await findUserByStripeCustomerId(customerId);
  if (!user) {
    console.error("[Stripe] No user found for customer:", customerId);
    return;
  }

  const periodEnd = (subscription as unknown as Record<string, unknown>).current_period_end;
  const expiresAt = new Date((periodEnd as number) * 1000);

  await db.setPremiumStatus(user.id, true, expiresAt, customerId);

  console.log(`[Stripe] Premium renewed for user ${user.id} until ${expiresAt}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log("[Stripe] Subscription updated:", subscription.id);

  const customerId = subscription.customer as string;

  const user = await findUserByStripeCustomerId(customerId);
  if (!user) return;

  if (subscription.status === "active") {
    const periodEnd = (subscription as unknown as Record<string, unknown>).current_period_end;
    const expiresAt = new Date((periodEnd as number) * 1000);
    await db.setPremiumStatus(user.id, true, expiresAt, customerId);
  } else {
    await db.setPremiumStatus(user.id, false, undefined, customerId);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log("[Stripe] Subscription deleted:", subscription.id);

  const customerId = subscription.customer as string;

  const user = await findUserByStripeCustomerId(customerId);
  if (!user) return;

  await db.setPremiumStatus(user.id, false, undefined, customerId);

  console.log(`[Stripe] Premium removed for user ${user.id}`);
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log("[Stripe] Payment succeeded:", paymentIntent.id);
}
