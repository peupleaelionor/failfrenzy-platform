import { Request, Response } from "express";
import Stripe from "stripe";
import * as db from "../db";
import { getProductByPriceId, isPremiumProduct, isTokenProduct, STRIPE_PRODUCTS } from "./products";
import { getStripe } from "./config";

export async function handleStripeWebhook(req: Request, res: Response) {
  const stripe = getStripe();
  
  if (!stripe) {
    console.error("[Stripe Webhook] Stripe is not configured");
    return res.status(503).send("Stripe is not configured");
  }

  const sig = req.headers["stripe-signature"];

  if (!sig) {
    console.error("[Stripe Webhook] Missing signature");
    return res.status(400).send("Missing signature");
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || "");
  } catch (err: any) {
    console.error("[Stripe Webhook] Signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
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
        await handleCheckoutCompleted(stripe, event.data.object as Stripe.Checkout.Session);
        break;

      case "invoice.paid":
        await handleInvoicePaid(stripe, event.data.object as Stripe.Invoice);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(stripe, event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(stripe, event.data.object as Stripe.Subscription);
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

async function handleCheckoutCompleted(stripe: Stripe, session: Stripe.Checkout.Session) {
  console.log("[Stripe] Checkout completed:", session.id);

  const userId = parseInt(session.metadata?.user_id || "0");
  if (!userId) {
    console.error("[Stripe] No user_id in session metadata");
    return;
  }

  const mode = session.mode;

  if (mode === "subscription") {
    // Premium subscription
    const subscriptionId = session.subscription as string;
    const customerId = session.customer as string;

    // Get subscription details
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

    // Calculate expiration date
    const expiresAt = new Date((subscription as any).current_period_end * 1000);

    // Update user premium status
    await db.setPremiumStatus(userId, true, expiresAt, customerId);

    // Record purchase
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
    // One-time payment (tokens)
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

    // Add tokens to user
    await db.addTokens(userId, tokens, "purchase", `Purchased ${tokens} tokens`);

    // Record purchase
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

async function handleInvoicePaid(stripe: Stripe, invoice: Stripe.Invoice) {
  console.log("[Stripe] Invoice paid:", invoice.id);

  const customerId = invoice.customer as string;
  const subscriptionId = (invoice as any).subscription as string;

  if (!subscriptionId) return;

  // Get subscription
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Find user by customer ID
  const db_instance = await db.getDb();
  if (!db_instance) return;

  const { users: usersTable } = await import("../../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  const users = await db_instance.select().from(usersTable).where(eq(usersTable.stripeCustomerId, customerId));

  if (users.length === 0) {
    console.error("[Stripe] No user found for customer:", customerId);
    return;
  }

  const userId = users[0]!.id;
  const expiresAt = new Date((subscription as any).current_period_end * 1000);

  // Renew premium
  await db.setPremiumStatus(userId, true, expiresAt, customerId);

  console.log(`[Stripe] Premium renewed for user ${userId} until ${expiresAt}`);
}

async function handleSubscriptionUpdated(stripe: Stripe, subscription: Stripe.Subscription) {
  console.log("[Stripe] Subscription updated:", subscription.id);

  const customerId = subscription.customer as string;

  // Find user
  const db_instance = await db.getDb();
  if (!db_instance) return;

  const { users: usersTable } = await import("../../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  const users = await db_instance.select().from(usersTable).where(eq(usersTable.stripeCustomerId, customerId));

  if (users.length === 0) return;

  const userId = users[0]!.id;

  if (subscription.status === "active") {
    const expiresAt = new Date((subscription as any).current_period_end * 1000);
    await db.setPremiumStatus(userId, true, expiresAt, customerId);
  } else {
    // Subscription paused or past_due
    await db.setPremiumStatus(userId, false, undefined, customerId);
  }
}

async function handleSubscriptionDeleted(stripe: Stripe, subscription: Stripe.Subscription) {
  console.log("[Stripe] Subscription deleted:", subscription.id);

  const customerId = subscription.customer as string;

  // Find user
  const db_instance = await db.getDb();
  if (!db_instance) return;

  const { users: usersTable } = await import("../../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  const users = await db_instance.select().from(usersTable).where(eq(usersTable.stripeCustomerId, customerId));

  if (users.length === 0) return;

  const userId = users[0]!.id;

  // Remove premium
  await db.setPremiumStatus(userId, false, undefined, customerId);

  console.log(`[Stripe] Premium removed for user ${userId}`);
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log("[Stripe] Payment succeeded:", paymentIntent.id);
  // Additional logic if needed
}
