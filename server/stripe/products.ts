/**
 * Stripe Products Configuration
 * Centralized product and price definitions
 */

export const STRIPE_PRODUCTS = {
  // Premium Subscriptions
  PREMIUM_MONTHLY: {
    name: "Fail Frenzy Premium - Monthly",
    description: "Unlimited games, no ads, all skins, global leaderboards",
    price: 4.99,
    currency: "EUR",
    interval: "month" as const,
    priceId: process.env.STRIPE_PRICE_PREMIUM_MONTHLY || "",
  },
  PREMIUM_YEARLY: {
    name: "Fail Frenzy Premium - Yearly",
    description: "Unlimited games, no ads, all skins, global leaderboards (Save 33%)",
    price: 39.99,
    currency: "EUR",
    interval: "year" as const,
    priceId: process.env.STRIPE_PRICE_PREMIUM_YEARLY || "",
  },

  // Token Packs
  TOKENS_100: {
    name: "100 Tokens",
    description: "Small token pack",
    price: 0.99,
    currency: "EUR",
    tokens: 100,
    priceId: process.env.STRIPE_PRICE_TOKENS_100 || "",
  },
  TOKENS_500: {
    name: "500 Tokens",
    description: "Medium token pack (Best Value)",
    price: 3.99,
    currency: "EUR",
    tokens: 500,
    priceId: process.env.STRIPE_PRICE_TOKENS_500 || "",
  },
  TOKENS_1000: {
    name: "1000 Tokens",
    description: "Large token pack",
    price: 6.99,
    currency: "EUR",
    tokens: 1000,
    priceId: process.env.STRIPE_PRICE_TOKENS_1000 || "",
  },
} as const;

export type StripeProductKey = keyof typeof STRIPE_PRODUCTS;

export function getProductByPriceId(priceId: string): StripeProductKey | null {
  for (const [key, product] of Object.entries(STRIPE_PRODUCTS)) {
    if (product.priceId === priceId) {
      return key as StripeProductKey;
    }
  }
  return null;
}

export function isPremiumProduct(productKey: StripeProductKey): boolean {
  return productKey === "PREMIUM_MONTHLY" || productKey === "PREMIUM_YEARLY";
}

export function isTokenProduct(productKey: StripeProductKey): boolean {
  return productKey.startsWith("TOKENS_");
}
