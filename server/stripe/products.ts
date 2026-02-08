/**
 * Stripe Products Configuration
 * Centralized product and price definitions for Fail Frenzy: Echoes of the Void
 */

export const STRIPE_PRODUCTS = {
  // Premium Subscriptions - "Commandeur de Xylos"
  PREMIUM_MONTHLY: {
    name: "Engagement Tactique (Mensuel)",
    description: "Statut de Commandeur : Vols illimités, Espace de vol dégagé (pas de pubs), Accès à toutes les galaxies, Prototypes classifiés déverrouillés.",
    price: 4.99,
    currency: "EUR",
    interval: "month" as const,
    priceId: process.env.STRIPE_PRICE_PREMIUM_MONTHLY || "",
  },
  PREMIUM_YEARLY: {
    name: "Engagement Stratégique (Annuel)",
    description: "Statut de Commandeur Suprême : Tous les avantages tactiques avec un engagement à long terme pour la survie de Xylos. (Économisez 33%)",
    price: 39.99,
    currency: "EUR",
    interval: "year" as const,
    priceId: process.env.STRIPE_PRICE_PREMIUM_YEARLY || "",
  },

  // Token Packs - "Énergie de Xylos"
  TOKENS_100: {
    name: "Pack Énergie : 100 Tokens",
    description: "Petite recharge d'énergie pour acquérir de nouveaux prototypes de vaisseaux.",
    price: 0.99,
    currency: "EUR",
    tokens: 100,
    priceId: process.env.STRIPE_PRICE_TOKENS_100 || "",
  },
  TOKENS_500: {
    name: "Pack Énergie : 500 Tokens",
    description: "Recharge d'énergie moyenne. Recommandé par le Haut Commandement pour les pilotes actifs.",
    price: 3.99,
    currency: "EUR",
    tokens: 500,
    priceId: process.env.STRIPE_PRICE_TOKENS_500 || "",
  },
  TOKENS_1000: {
    name: "Pack Énergie : 1000 Tokens",
    description: "Grande réserve d'énergie. Pour les Écho-Pilotes d'élite souhaitant collectionner tous les vaisseaux.",
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
