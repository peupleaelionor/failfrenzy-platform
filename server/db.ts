import { and, desc, eq, gte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  achievements,
  dailyChallenges,
  type InsertPurchase,
  type InsertScore,
  type InsertUserStats,
  purchases,
  referrals,
  scores,
  skins,
  tokenTransactions,
  userAchievements,
  userChallenges,
  users,
  userSkins,
  userStats,
} from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER (Supabase Auth) ============

export async function upsertUserFromSupabase(user: {
  supabaseId: string;
  email?: string | null;
  name?: string | null;
}): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.supabaseId, user.supabaseId))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(users).values({
        supabaseId: user.supabaseId,
        email: user.email ?? null,
        name: user.name ?? null,
        lastSignedIn: new Date(),
      });
    } else {
      const updateSet: Record<string, unknown> = {
        lastSignedIn: new Date(),
      };
      if (user.email !== undefined) updateSet.email = user.email;
      if (user.name !== undefined) updateSet.name = user.name;

      await db
        .update(users)
        .set(updateSet)
        .where(eq(users.supabaseId, user.supabaseId));
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserBySupabaseId(supabaseId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.supabaseId, supabaseId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ SCORES ============

export async function insertScore(score: InsertScore) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(scores).values(score);
}

export async function getUserScores(userId: number, mode?: string, limit = 10) {
  const db = await getDb();
  if (!db) return [];

  const conditions = mode
    ? and(eq(scores.userId, userId), eq(scores.mode, mode as any))
    : eq(scores.userId, userId);

  return db.select().from(scores).where(conditions).orderBy(desc(scores.score)).limit(limit);
}

export async function getGlobalLeaderboard(mode?: string, limit = 100) {
  const db = await getDb();
  if (!db) return [];

  const conditions = mode ? eq(scores.mode, mode as any) : undefined;

  return db
    .select({
      userId: scores.userId,
      userName: users.name,
      score: scores.score,
      mode: scores.mode,
      createdAt: scores.createdAt,
    })
    .from(scores)
    .leftJoin(users, eq(scores.userId, users.id))
    .where(conditions)
    .orderBy(desc(scores.score))
    .limit(limit);
}

export async function getUserHighScore(userId: number, mode?: string) {
  const db = await getDb();
  if (!db) return 0;

  const conditions = mode
    ? and(eq(scores.userId, userId), eq(scores.mode, mode as any))
    : eq(scores.userId, userId);

  const result = await db
    .select({ score: scores.score })
    .from(scores)
    .where(conditions)
    .orderBy(desc(scores.score))
    .limit(1);

  return result.length > 0 ? result[0]!.score : 0;
}

// ============ TOKENS ============

export async function addTokens(
  userId: number,
  amount: number,
  type: string,
  description?: string,
  relatedId?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.transaction(async (tx) => {
    await tx.insert(tokenTransactions).values({
      userId,
      amount,
      type: type as any,
      description,
      relatedId,
    });

    await tx
      .update(users)
      .set({ tokens: sql`${users.tokens} + ${amount}` })
      .where(eq(users.id, userId));
  });
}

export async function spendTokens(
  userId: number,
  amount: number,
  description?: string,
  relatedId?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const user = await db
    .select({ tokens: users.tokens })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user.length || user[0]!.tokens < amount) {
    throw new Error("Insufficient tokens");
  }

  await db.transaction(async (tx) => {
    await tx.insert(tokenTransactions).values({
      userId,
      amount: -amount,
      type: "spend",
      description,
      relatedId,
    });

    await tx
      .update(users)
      .set({ tokens: sql`${users.tokens} - ${amount}` })
      .where(eq(users.id, userId));
  });
}

export async function getTokenBalance(userId: number) {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select({ tokens: users.tokens })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result.length > 0 ? result[0]!.tokens : 0;
}

export async function getTokenTransactions(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(tokenTransactions)
    .where(eq(tokenTransactions.userId, userId))
    .orderBy(desc(tokenTransactions.createdAt))
    .limit(limit);
}

// ============ ACHIEVEMENTS ============

export async function getUserAchievements(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: achievements.id,
      name: achievements.name,
      description: achievements.description,
      tier: achievements.tier,
      rewardTokens: achievements.rewardTokens,
      icon: achievements.icon,
      unlockedAt: userAchievements.unlockedAt,
    })
    .from(userAchievements)
    .leftJoin(achievements, eq(userAchievements.achievementId, achievements.id))
    .where(eq(userAchievements.userId, userId));
}

export async function unlockAchievement(userId: number, achievementId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(userAchievements)
    .where(
      and(
        eq(userAchievements.userId, userId),
        eq(userAchievements.achievementId, achievementId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return { alreadyUnlocked: true };
  }

  const achievement = await db
    .select()
    .from(achievements)
    .where(eq(achievements.id, achievementId))
    .limit(1);

  if (!achievement.length) {
    throw new Error("Achievement not found");
  }

  const reward = achievement[0]!.rewardTokens;

  await db.transaction(async (tx) => {
    await tx.insert(userAchievements).values({ userId, achievementId });

    if (reward > 0) {
      await addTokens(userId, reward, "reward", `Achievement: ${achievement[0]!.name}`);
    }
  });

  return { alreadyUnlocked: false, reward };
}

// ============ SKINS ============

export async function getAllSkins() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(skins).orderBy(skins.rarity, desc(skins.priceTokens));
}

export async function getUserSkins(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: skins.id,
      name: skins.name,
      description: skins.description,
      rarity: skins.rarity,
      imageUrl: skins.imageUrl,
      unlockedAt: userSkins.unlockedAt,
    })
    .from(userSkins)
    .leftJoin(skins, eq(userSkins.skinId, skins.id))
    .where(eq(userSkins.userId, userId));
}

export async function purchaseSkin(userId: number, skinId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(userSkins)
    .where(and(eq(userSkins.userId, userId), eq(userSkins.skinId, skinId)))
    .limit(1);

  if (existing.length > 0) throw new Error("Skin already owned");

  const skin = await db.select().from(skins).where(eq(skins.id, skinId)).limit(1);
  if (!skin.length) throw new Error("Skin not found");

  const price = skin[0]!.priceTokens;

  await db.transaction(async (tx) => {
    await spendTokens(userId, price, `Purchased skin: ${skin[0]!.name}`, undefined);
    await tx.insert(userSkins).values({ userId, skinId });
  });

  return { success: true };
}

// ============ DAILY CHALLENGES ============

export async function getTodayChallenges() {
  const db = await getDb();
  if (!db) return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return db.select().from(dailyChallenges).where(gte(dailyChallenges.date, today)).limit(3);
}

export async function completeChallenge(userId: number, challengeId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(userChallenges)
    .where(and(eq(userChallenges.userId, userId), eq(userChallenges.challengeId, challengeId)))
    .limit(1);

  if (existing.length > 0) return { alreadyCompleted: true };

  const challenge = await db
    .select()
    .from(dailyChallenges)
    .where(eq(dailyChallenges.id, challengeId))
    .limit(1);

  if (!challenge.length) throw new Error("Challenge not found");

  const reward = challenge[0]!.rewardTokens;

  await db.transaction(async (tx) => {
    await tx.insert(userChallenges).values({ userId, challengeId });
    if (reward > 0) {
      await addTokens(userId, reward, "daily", "Daily challenge completed");
    }
  });

  return { alreadyCompleted: false, reward };
}

// ============ REFERRALS ============

export async function generateReferralCode(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(referrals).where(eq(referrals.referrerId, userId)).limit(1);
  if (existing.length > 0) return existing[0]!.code;

  const code = `FF${userId}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  await db.insert(referrals).values({ referrerId: userId, code });
  return code;
}

export async function applyReferralCode(userId: number, code: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const referral = await db.select().from(referrals).where(eq(referrals.code, code)).limit(1);
  if (!referral.length) throw new Error("Invalid referral code");

  const referrerId = referral[0]!.referrerId;
  if (referrerId === userId) throw new Error("Cannot use your own referral code");

  const existingReferral = await db.select().from(referrals).where(eq(referrals.referredId, userId)).limit(1);
  if (existingReferral.length > 0) throw new Error("You have already used a referral code");

  await db.transaction(async (tx) => {
    await tx.update(referrals).set({ referredId: userId, rewardClaimed: 1 }).where(eq(referrals.code, code));
    await addTokens(referrerId, 100, "referral", `Referral bonus for inviting user ${userId}`);
    await addTokens(userId, 50, "referral", `Welcome bonus from referral code ${code}`);
  });

  return { success: true };
}

// ============ USER STATS ============

export async function getUserStats(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(userStats).where(eq(userStats.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateUserStats(userId: number, stats: Partial<InsertUserStats>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(userStats).where(eq(userStats.userId, userId)).limit(1);

  if (existing.length === 0) {
    await db.insert(userStats).values({ userId, ...stats });
  } else {
    await db.update(userStats).set(stats).where(eq(userStats.userId, userId));
  }
}

// ============ PREMIUM ============

export async function setPremiumStatus(
  userId: number,
  isPremium: boolean,
  expiresAt?: Date,
  stripeCustomerId?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(users)
    .set({
      isPremium: isPremium ? 1 : 0,
      premiumExpiresAt: expiresAt,
      stripeCustomerId,
    })
    .where(eq(users.id, userId));
}

export async function checkPremiumStatus(userId: number) {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select({ isPremium: users.isPremium, premiumExpiresAt: users.premiumExpiresAt })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!result.length) return false;

  const user = result[0]!;
  if (user.isPremium === 1) {
    if (!user.premiumExpiresAt || user.premiumExpiresAt > new Date()) {
      return true;
    }
  }
  return false;
}

// ============ PURCHASES ============

export async function createPurchase(purchase: InsertPurchase) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(purchases).values(purchase);
}

export async function updatePurchaseStatus(purchaseId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(purchases).set({ status: status as any }).where(eq(purchases.id, purchaseId));
}

export async function getUserPurchases(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(purchases).where(eq(purchases.userId, userId)).orderBy(desc(purchases.createdAt)).limit(limit);
}
