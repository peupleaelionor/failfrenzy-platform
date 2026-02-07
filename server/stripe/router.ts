import { TRPCError } from "@trpc/server";
import Stripe from "stripe";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { STRIPE_PRODUCTS } from "./products";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-01-28.clover",
});

export const stripeRouter = router({
  createCheckout: protectedProcedure
    .input(
      z.object({
        productKey: z.enum([
          "PREMIUM_MONTHLY",
          "PREMIUM_YEARLY",
          "TOKENS_100",
          "TOKENS_500",
          "TOKENS_1000",
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const product = STRIPE_PRODUCTS[input.productKey];
      const user = ctx.user;
      const origin = ctx.req.headers.origin || "http://localhost:3000";

      // Determine mode
      const mode = input.productKey.startsWith("PREMIUM") ? "subscription" : "payment";

      try {
        const session = await stripe.checkout.sessions.create({
          mode,
          customer_email: user.email || undefined,
          client_reference_id: user.id.toString(),
          metadata: {
            user_id: user.id.toString(),
            customer_email: user.email || "",
            customer_name: user.name || "",
            product_key: input.productKey,
          },
          line_items: [
            {
              price: product.priceId,
              quantity: 1,
            },
          ],
          success_url: `${origin}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/premium`,
          allow_promotion_codes: true,
        });

        return {
          url: session.url,
          sessionId: session.id,
        };
      } catch (error: any) {
        console.error("[Stripe] Error creating checkout session:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to create checkout session",
        });
      }
    }),

  getCustomerPortalUrl: protectedProcedure.mutation(async ({ ctx }) => {
    const user = ctx.user;
    const origin = ctx.req.headers.origin || "http://localhost:3000";

    if (!user.stripeCustomerId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No Stripe customer found",
      });
    }

    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${origin}/premium`,
      });

      return {
        url: session.url,
      };
    } catch (error: any) {
      console.error("[Stripe] Error creating portal session:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message || "Failed to create portal session",
      });
    }
  }),
});
