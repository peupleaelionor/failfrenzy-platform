import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { stripeRouter } from "./stripe/router";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    verifyAdmin: publicProcedure
      .input(z.object({ password: z.string() }))
      .mutation(({ input }) => {
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminPassword) {
          return { success: false } as const;
        }
        return { success: input.password === adminPassword } as const;
      }),
  }),

  // ============ GAME ============
  game: router({
    submitScore: protectedProcedure
      .input(
        z.object({
          mode: z.enum(["classic", "time_trial", "infinite", "seeds"]),
          score: z.number().int().min(0),
          fails: z.number().int().min(0).default(0),
          time: z.number().int().min(0),
          combo: z.number().int().min(0).optional(),
          seed: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user.id;

        // Insert score
        await db.insertScore({
          userId,
          mode: input.mode,
          score: input.score,
          fails: input.fails,
          time: input.time,
          combo: input.combo,
          seed: input.seed,
        });

        // Update user stats
        const stats = await db.getUserStats(userId);
        const newTotalGames = (stats?.totalGames || 0) + 1;
        const newTotalScore = (stats?.totalScore || 0) + input.score;
        const newHighScore = Math.max(stats?.highScore || 0, input.score);
        const newTotalPlayTime = (stats?.totalPlayTime || 0) + input.time;

        await db.updateUserStats(userId, {
          totalGames: newTotalGames,
          totalScore: newTotalScore,
          highScore: newHighScore,
          totalPlayTime: newTotalPlayTime,
          lastPlayedAt: new Date(),
        });

        return { success: true };
      }),

    getMyScores: protectedProcedure
      .input(
        z.object({
          mode: z.enum(["classic", "time_trial", "infinite", "seeds"]).optional(),
          limit: z.number().int().min(1).max(100).default(10),
        })
      )
      .query(async ({ ctx, input }) => {
        return db.getUserScores(ctx.user.id, input.mode, input.limit);
      }),

    getMyStats: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserStats(ctx.user.id);
    }),

    getMyHighScore: protectedProcedure
      .input(
        z.object({
          mode: z.enum(["classic", "time_trial", "infinite", "seeds"]).optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        return db.getUserHighScore(ctx.user.id, input.mode);
      }),
  }),

  // ============ LEADERBOARD ============
  leaderboard: router({
    getGlobal: publicProcedure
      .input(
        z.object({
          mode: z.enum(["classic", "time_trial", "infinite", "seeds"]).optional(),
          limit: z.number().int().min(1).max(100).default(100),
        })
      )
      .query(async ({ input }) => {
        return db.getGlobalLeaderboard(input.mode, input.limit);
      }),
  }),

  // ============ TOKENS ============
  tokens: router({
    getBalance: protectedProcedure.query(async ({ ctx }) => {
      return db.getTokenBalance(ctx.user.id);
    }),

    getTransactions: protectedProcedure
      .input(
        z.object({
          limit: z.number().int().min(1).max(100).default(50),
        })
      )
      .query(async ({ ctx, input }) => {
        return db.getTokenTransactions(ctx.user.id, input.limit);
      }),

    // Admin only: add tokens manually
    addTokens: adminProcedure
      .input(
        z.object({
          userId: z.number().int(),
          amount: z.number().int().min(1),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await db.addTokens(input.userId, input.amount, "reward", input.description);
        return { success: true };
      }),
  }),

  // ============ ACHIEVEMENTS ============
  achievements: router({
    getMy: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserAchievements(ctx.user.id);
    }),

    unlock: protectedProcedure
      .input(
        z.object({
          achievementId: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return db.unlockAchievement(ctx.user.id, input.achievementId);
      }),
  }),

  // ============ SHOP ============
  shop: router({
    getSkins: publicProcedure.query(async () => {
      return db.getAllSkins();
    }),

    getMySkins: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserSkins(ctx.user.id);
    }),

    purchaseSkin: protectedProcedure
      .input(
        z.object({
          skinId: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return db.purchaseSkin(ctx.user.id, input.skinId);
      }),
  }),

  // ============ DAILY CHALLENGES ============
  challenges: router({
    getToday: publicProcedure.query(async () => {
      return db.getTodayChallenges();
    }),

    complete: protectedProcedure
      .input(
        z.object({
          challengeId: z.number().int(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return db.completeChallenge(ctx.user.id, input.challengeId);
      }),
  }),

  // ============ REFERRAL ============
  referral: router({
    getMyCode: protectedProcedure.query(async ({ ctx }) => {
      return db.generateReferralCode(ctx.user.id);
    }),

    applyCode: protectedProcedure
      .input(
        z.object({
          code: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return db.applyReferralCode(ctx.user.id, input.code);
      }),
  }),

  // ============ PREMIUM ============
  premium: router({
    checkStatus: protectedProcedure.query(async ({ ctx }) => {
      return db.checkPremiumStatus(ctx.user.id);
    }),

    getFeatures: publicProcedure.query(() => {
      return {
        free: {
          modes: ["classic"],
          dailyGames: 5,
          ads: true,
          leaderboard: "local",
          skins: 2,
        },
        premium: {
          modes: ["classic", "time_trial", "infinite", "seeds"],
          dailyGames: -1, // unlimited
          ads: false,
          leaderboard: "global",
          skins: -1, // all
          price: {
            monthly: 4.99,
            yearly: 39.99,
          },
        },
      };
    }),
  }),

  // ============ STRIPE ============
  stripe: stripeRouter,

  // ============ PURCHASES ============
  purchases: router({
    getMy: protectedProcedure
      .input(
        z.object({
          limit: z.number().int().min(1).max(100).default(50),
        })
      )
      .query(async ({ ctx, input }) => {
        return db.getUserPurchases(ctx.user.id, input.limit);
      }),
  }),
});

export type AppRouter = typeof appRouter;
