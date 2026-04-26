import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { stripeRouter } from "./stripe/router";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(() => {
      // With Supabase Auth, logout is handled client-side via supabase.auth.signOut()
      return { success: true } as const;
    }),
  }),

  // ============ GAME ============
  game: router({
    submitScore: protectedProcedure
      .input(
        z.object({
          mode: z.enum(["classic", "time_trial", "infinite", "seeds"]),
          score: z.number().int().min(0).max(10_000_000),
          fails: z.number().int().min(0).max(10_000).default(0),
          time: z.number().int().min(0),
          combo: z.number().int().min(0).optional(),
          seed: z.string().max(64).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user.id;

        // ── Server-side sanity checks ─────────────────────────────────────────
        // A non-zero score requires a non-zero play time.
        if (input.score > 0 && input.time === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid score: score > 0 requires time > 0",
          });
        }
        // `time` is in seconds (GameState.time accumulates delta in seconds).
        // Max observable: godlike combo (×7) × fastest event rate (~5/s) × best base pts (1000) ≈ 35 000 pts/s.
        // We apply a 3× safety margin to avoid false positives on legitimate burst combos.
        const MAX_SCORE_PER_SECOND = 15_000;
        if (input.time > 0 && input.score > input.time * MAX_SCORE_PER_SECOND) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Score exceeds theoretical maximum for the given play time",
          });
        }

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

    // ── Replay / Spectator ────────────────────────────────────────────────────

    submitReplay: protectedProcedure
      .input(
        z.object({
          mode: z.enum(["classic", "time_trial", "infinite", "seeds"]),
          score: z.number().int().min(0).max(10_000_000),
          durationMs: z.number().int().min(0),
          seed: z.string().max(64).optional(),
          /**
           * Base64-encoded JSON of RecordingData from GameRecorder.
           * Max 256 KB (≈ 30 min of dense input).
           */
          replayData: z.string().max(256 * 1024),
          /** Anti-cheat analysis result from client-side InputAnalyzer. */
          suspicious: z.boolean().optional(),
          antiCheatReasons: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user.id;

        // Flag replays the client itself flagged as suspicious
        const flagged = input.suspicious ? 1 : 0;

        if (input.suspicious && input.antiCheatReasons?.length) {
          console.warn(
            `[AntiCheat] Replay from user ${userId} flagged: ${input.antiCheatReasons.join(", ")}`
          );
        }

        const id = await db.saveReplay({
          userId,
          mode: input.mode,
          score: input.score,
          durationMs: input.durationMs,
          seed: input.seed,
          replayData: input.replayData,
          flagged,
        });

        return { id };
      }),

    getReplay: publicProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ input }) => {
        const replay = await db.getReplayById(input.id);
        if (!replay) throw new TRPCError({ code: "NOT_FOUND", message: "Replay not found" });
        if (replay.flagged) throw new TRPCError({ code: "FORBIDDEN", message: "Replay flagged for review" });
        return replay;
      }),

    getMyReplays: protectedProcedure
      .input(z.object({ limit: z.number().int().min(1).max(50).default(20) }))
      .query(async ({ ctx, input }) => {
        return db.getUserReplays(ctx.user.id, input.limit);
      }),

    getTopReplays: publicProcedure
      .input(
        z.object({
          mode: z.enum(["classic", "time_trial", "infinite", "seeds"]).optional(),
          limit: z.number().int().min(1).max(20).default(10),
        })
      )
      .query(async ({ input }) => {
        return db.getTopReplays(input.mode, input.limit);
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
    addTokens: protectedProcedure
      .input(
        z.object({
          userId: z.number().int(),
          amount: z.number().int().min(1),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

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
