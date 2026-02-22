import { and, desc, eq, gte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  achievements,
  dailyChallenges,
  InsertPurchase,
  InsertReferral,
  InsertScore,
  InsertSkin,
  InsertTokenTransaction,
  InsertUser,
  InsertUserAchievement,
  InsertUserChallenge,
  InsertUserSkin,
  InsertUserStats,
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
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ SCORES ============

export async function insertScore(score: InsertScore) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(scores).values(score);
  return result;
}

export async function getUserScores(userId: number, mode?: string, limit = 10) {
  const db = await getDb();
  if (!db) return [];

  const conditions = mode ? and(eq(scores.userId, userId), eq(scores.mode, mode as any)) : eq(scores.userId, userId);

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

  const conditions = mode ? and(eq(scores.userId, userId), eq(scores.mode, mode as any)) : eq(scores.userId, userId);

  const result = await db.select({ score: scores.score }).from(scores).where(conditions).orderBy(desc(scores.score)).limit(1);

  return result.length > 0 ? result[0]!.score : 0;
}

// ============ TOKENS ============

export async function addTokens(userId: number, amount: number, type: string, description?: string, relatedId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.transaction(async (tx) => {
    // Add transaction record
    await tx.insert(tokenTransactions).values({
      userId,
      amount,
      type: type as any,
      description,
      relatedId,
    });

    // Update user balance
    await tx
      .update(users)
      .set({ tokens: sql`${users.tokens} + ${amount}` })
      .where(eq(users.id, userId));
  });
}

export async function spendTokens(userId: number, amount: number, description?: string, relatedId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.transaction(async (tx) => {
    const user = await tx.select({ tokens: users.tokens }).from(users).where(eq(users.id, userId)).limit(1);

    if (!user.length || user[0]!.tokens < amount) {
      throw new Error("Insufficient tokens");
    }

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

  const result = await db.select({ tokens: users.tokens }).from(users).where(eq(users.id, userId)).limit(1);

  return result.length > 0 ? result[0]!.tokens : 0;
}

export async function getTokenTransactions(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(tokenTransactions).where(eq(tokenTransactions.userId, userId)).orderBy(desc(tokenTransactions.createdAt)).limit(limit);
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

  // Check if already unlocked
  const existing = await db
    .select()
    .from(userAchievements)
    .where(and(eq(userAchievements.userId, userId), eq(userAchievements.achievementId, achievementId)))
    .limit(1);

  if (existing.length > 0) {
    return { alreadyUnlocked: true };
  }

  // Get achievement details
  const achievement = await db.select().from(achievements).where(eq(achievements.id, achievementId)).limit(1);

  if (!achievement.length) {
    throw new Error("Achievement not found");
  }

  const reward = achievement[0]!.rewardTokens;

  await db.transaction(async (tx) => {
    // Unlock achievement
    await tx.insert(userAchievements).values({
      userId,
      achievementId,
    });

    // Award tokens
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

  // Check if already owned
  const existing = await db.select().from(userSkins).where(and(eq(userSkins.userId, userId), eq(userSkins.skinId, skinId))).limit(1);

  if (existing.length > 0) {
    throw new Error("Skin already owned");
  }

  // Get skin details
  const skin = await db.select().from(skins).where(eq(skins.id, skinId)).limit(1);

  if (!skin.length) {
    throw new Error("Skin not found");
  }

  const price = skin[0]!.priceTokens;

  if (price < 0) {
    throw new Error("Invalid skin price");
  }

  await db.transaction(async (tx) => {
    // Check balance inside the transaction to avoid race conditions
    const user = await tx.select({ tokens: users.tokens }).from(users).where(eq(users.id, userId)).limit(1);

    if (!user.length || user[0]!.tokens < price) {
      throw new Error("Insufficient tokens");
    }

    // Record token transaction
    await tx.insert(tokenTransactions).values({
      userId,
      amount: -price,
      type: "spend",
      description: `Purchased skin: ${skin[0]!.name}`,
    });

    // Deduct tokens
    await tx
      .update(users)
      .set({ tokens: sql`${users.tokens} - ${price}` })
      .where(eq(users.id, userId));

    // Unlock skin
    await tx.insert(userSkins).values({
      userId,
      skinId,
    });
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

  // Check if already completed
  const existing = await db
    .select()
    .from(userChallenges)
    .where(and(eq(userChallenges.userId, userId), eq(userChallenges.challengeId, challengeId)))
    .limit(1);

  if (existing.length > 0) {
    return { alreadyCompleted: true };
  }

  // Get challenge details
  const challenge = await db.select().from(dailyChallenges).where(eq(dailyChallenges.id, challengeId)).limit(1);

  if (!challenge.length) {
    throw new Error("Challenge not found");
  }

  const reward = challenge[0]!.rewardTokens;

  await db.transaction(async (tx) => {
    // Mark as completed
    await tx.insert(userChallenges).values({
      userId,
      challengeId,
    });

    // Award tokens
    if (reward > 0) {
      await addTokens(userId, reward, "daily", `Daily challenge completed`);
    }
  });

  return { alreadyCompleted: false, reward };
}

// ============ REFERRALS ============

export async function generateReferralCode(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if user already has a code
  const existing = await db.select().from(referrals).where(eq(referrals.referrerId, userId)).limit(1);

  if (existing.length > 0) {
    return existing[0]!.code;
  }

  // Generate unique code
  const code = `FF${userId}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  await db.insert(referrals).values({
    referrerId: userId,
    code,
  });

  return code;
}

export async function applyReferralCode(userId: number, code: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Find referral
  const referral = await db.select().from(referrals).where(eq(referrals.code, code)).limit(1);

  if (!referral.length) {
    throw new Error("Invalid referral code");
  }

  const referrerId = referral[0]!.referrerId;

  if (referrerId === userId) {
    throw new Error("Cannot use your own referral code");
  }

  // Check if already used a referral
  const existingReferral = await db.select().from(referrals).where(eq(referrals.referredId, userId)).limit(1);

  if (existingReferral.length > 0) {
    throw new Error("You have already used a referral code");
  }

  await db.transaction(async (tx) => {
    // Update referral
    await tx.update(referrals).set({ referredId: userId, rewardClaimed: 1 }).where(eq(referrals.code, code));

    // Award tokens to referrer
    await addTokens(referrerId, 100, "referral", `Referral bonus for inviting user ${userId}`);

    // Award tokens to referred
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
    // Create new stats
    await db.insert(userStats).values({
      userId,
      ...stats,
    });
  } else {
    // Update existing stats
    await db.update(userStats).set(stats).where(eq(userStats.userId, userId));
  }
}

// ============ PREMIUM ============

export async function setPremiumStatus(userId: number, isPremium: boolean, expiresAt?: Date, stripeCustomerId?: string) {
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

  const result = await db.select({ isPremium: users.isPremium, premiumExpiresAt: users.premiumExpiresAt }).from(users).where(eq(users.id, userId)).limit(1);

  if (!result.length) return false;

  const user = result[0]!;

  // Check if premium and not expired
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

  const result = await db.insert(purchases).values(purchase);
  return result;
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
