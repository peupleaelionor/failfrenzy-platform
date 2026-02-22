import Stripe from "stripe";

let stripeInstance: Stripe | null = null;
let stripeConfigError: string | null = null;

/**
 * Get the Stripe instance. Returns null if Stripe is not configured.
 * Call this function to get the Stripe client and handle null appropriately.
 */
export function getStripe(): Stripe | null {
  if (stripeInstance) {
    return stripeInstance;
  }

  const apiKey = process.env.STRIPE_SECRET_KEY;
  
  if (!apiKey || apiKey.trim() === "") {
    if (!stripeConfigError) {
      stripeConfigError = "STRIPE_SECRET_KEY environment variable is not configured";
      console.warn(`[Stripe] WARNING: ${stripeConfigError}. Stripe functionality will be disabled.`);
    }
    return null;
  }

  try {
    stripeInstance = new Stripe(apiKey, {
      apiVersion: "2026-01-28.clover",
    });
    console.log("[Stripe] Successfully initialized");
    return stripeInstance;
  } catch (error: any) {
    stripeConfigError = error.message || "Failed to initialize Stripe";
    console.error(`[Stripe] ERROR: ${stripeConfigError}`);
    return null;
  }
}

/**
 * Check if Stripe is configured and ready to use
 */
export function isStripeConfigured(): boolean {
  return getStripe() !== null;
}
