import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  isPremium: int("is_premium").notNull().default(0), // 0 = false, 1 = true
  premiumExpiresAt: timestamp("premium_expires_at"),
  tokens: int("tokens").notNull().default(0),
  stripeCustomerId: varchar("stripe_customer_id", { length: 256 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Scores table - stores all game scores with detailed stats
 */
export const scores = mysqlTable("scores", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  mode: mysqlEnum("mode", ["classic", "time_trial", "infinite", "seeds"]).notNull(),
  score: int("score").notNull(),
  fails: int("fails").notNull().default(0),
  time: int("time").notNull(), // in seconds
  combo: int("combo").default(0),
  seed: varchar("seed", { length: 64 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Score = typeof scores.$inferSelect;
export type InsertScore = typeof scores.$inferInsert;

/**
 * Achievements table - defines all available achievements
 */
export const achievements = mysqlTable("achievements", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description").notNull(),
  tier: mysqlEnum("tier", ["bronze", "silver", "gold", "platinum"]).notNull(),
  rewardTokens: int("reward_tokens").notNull().default(0),
  icon: varchar("icon", { length: 256 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;

/**
 * User Achievements - tracks which achievements users have unlocked
 */
export const userAchievements = mysqlTable("user_achievements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  achievementId: varchar("achievement_id", { length: 64 }).notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
});

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;

/**
 * Skins table - all available skins in the shop
 */
export const skins = mysqlTable("skins", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  priceTokens: int("price_tokens").notNull(),
  rarity: mysqlEnum("rarity", ["common", "rare", "epic", "legendary"]).notNull(),
  imageUrl: varchar("image_url", { length: 512 }),
  isPremium: int("is_premium").notNull().default(0), // 0 = false, 1 = true
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Skin = typeof skins.$inferSelect;
export type InsertSkin = typeof skins.$inferInsert;

/**
 * User Skins - tracks which skins users have unlocked
 */
export const userSkins = mysqlTable("user_skins", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  skinId: varchar("skin_id", { length: 64 }).notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
});

export type UserSkin = typeof userSkins.$inferSelect;
export type InsertUserSkin = typeof userSkins.$inferInsert;

/**
 * Purchases table - tracks all user purchases (subscriptions, tokens, skins)
 */
export const purchases = mysqlTable("purchases", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  type: mysqlEnum("type", ["subscription", "tokens", "skin"]).notNull(),
  itemId: varchar("item_id", { length: 128 }), // skin_id or token_pack_id
  amount: int("amount").notNull(), // in cents for money, or token count
  currency: varchar("currency", { length: 3 }).default("EUR"),
  stripePaymentId: varchar("stripe_payment_id", { length: 256 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 256 }),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = typeof purchases.$inferInsert;

/**
 * Token Transactions - tracks all token additions and spending
 */
export const tokenTransactions = mysqlTable("token_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  amount: int("amount").notNull(), // positive for additions, negative for spending
  type: mysqlEnum("type", ["purchase", "reward", "referral", "daily", "ad", "spend"]).notNull(),
  description: text("description"),
  relatedId: int("related_id"), // purchase_id, achievement_id, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type TokenTransaction = typeof tokenTransactions.$inferSelect;
export type InsertTokenTransaction = typeof tokenTransactions.$inferInsert;

/**
 * Daily Challenges - defines daily challenges
 */
export const dailyChallenges = mysqlTable("daily_challenges", {
  id: int("id").autoincrement().primaryKey(),
  date: timestamp("date").notNull(),
  mode: mysqlEnum("mode", ["classic", "time_trial", "infinite", "seeds"]).notNull(),
  description: text("description").notNull(),
  targetScore: int("target_score"),
  targetTime: int("target_time"),
  rewardTokens: int("reward_tokens").notNull().default(50),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type DailyChallenge = typeof dailyChallenges.$inferSelect;
export type InsertDailyChallenge = typeof dailyChallenges.$inferInsert;

/**
 * User Challenges - tracks completed challenges
 */
export const userChallenges = mysqlTable("user_challenges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  challengeId: int("challenge_id").notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

export type UserChallenge = typeof userChallenges.$inferSelect;
export type InsertUserChallenge = typeof userChallenges.$inferInsert;

/**
 * Referrals - tracks referral codes and rewards
 */
export const referrals = mysqlTable("referrals", {
  id: int("id").autoincrement().primaryKey(),
  referrerId: int("referrer_id").notNull(),
  referredId: int("referred_id"),
  code: varchar("code", { length: 32 }).notNull().unique(),
  rewardClaimed: int("reward_claimed").notNull().default(0), // 0 = false, 1 = true
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;

/**
 * User Stats - aggregated statistics for each user
 */
export const userStats = mysqlTable("user_stats", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().unique(),
  totalGames: int("total_games").notNull().default(0),
  totalScore: int("total_score").notNull().default(0),
  highScore: int("high_score").notNull().default(0),
  totalPlayTime: int("total_play_time").notNull().default(0), // in seconds
  currentStreak: int("current_streak").notNull().default(0),
  longestStreak: int("longest_streak").notNull().default(0),
  lastPlayedAt: timestamp("last_played_at"),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type UserStats = typeof userStats.$inferSelect;
export type InsertUserStats = typeof userStats.$inferInsert;