import { integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

/**
 * Enums for PostgreSQL
 */
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const gameModeEnum = pgEnum("game_mode", ["classic", "time_trial", "infinite", "seeds"]);
export const achievementTierEnum = pgEnum("achievement_tier", ["bronze", "silver", "gold", "platinum"]);
export const skinRarityEnum = pgEnum("skin_rarity", ["common", "rare", "epic", "legendary"]);
export const purchaseTypeEnum = pgEnum("purchase_type", ["subscription", "tokens", "skin"]);
export const purchaseStatusEnum = pgEnum("purchase_status", ["pending", "completed", "failed", "refunded"]);
export const tokenTxTypeEnum = pgEnum("token_tx_type", ["purchase", "reward", "referral", "daily", "ad", "spend"]);

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  /** Supabase Auth user ID (UUID). Unique per user. */
  supabaseId: varchar("supabase_id", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  role: roleEnum("role").default("user").notNull(),
  isPremium: integer("is_premium").notNull().default(0),
  premiumExpiresAt: timestamp("premium_expires_at"),
  tokens: integer("tokens").notNull().default(0),
  stripeCustomerId: varchar("stripe_customer_id", { length: 256 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Scores table - stores all game scores with detailed stats
 */
export const scores = pgTable("scores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  mode: gameModeEnum("mode").notNull(),
  score: integer("score").notNull(),
  fails: integer("fails").notNull().default(0),
  time: integer("time").notNull(),
  combo: integer("combo").default(0),
  seed: varchar("seed", { length: 64 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Score = typeof scores.$inferSelect;
export type InsertScore = typeof scores.$inferInsert;

/**
 * Achievements table - defines all available achievements
 */
export const achievements = pgTable("achievements", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description").notNull(),
  tier: achievementTierEnum("tier").notNull(),
  rewardTokens: integer("reward_tokens").notNull().default(0),
  icon: varchar("icon", { length: 256 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;

/**
 * User Achievements - tracks which achievements users have unlocked
 */
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  achievementId: varchar("achievement_id", { length: 64 }).notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
});

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;

/**
 * Skins table - all available skins in the shop
 */
export const skins = pgTable("skins", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  priceTokens: integer("price_tokens").notNull(),
  rarity: skinRarityEnum("rarity").notNull(),
  imageUrl: varchar("image_url", { length: 512 }),
  isPremium: integer("is_premium").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Skin = typeof skins.$inferSelect;
export type InsertSkin = typeof skins.$inferInsert;

/**
 * User Skins - tracks which skins users have unlocked
 */
export const userSkins = pgTable("user_skins", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  skinId: varchar("skin_id", { length: 64 }).notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
});

export type UserSkin = typeof userSkins.$inferSelect;
export type InsertUserSkin = typeof userSkins.$inferInsert;

/**
 * Purchases table - tracks all user purchases (subscriptions, tokens, skins)
 */
export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: purchaseTypeEnum("type").notNull(),
  itemId: varchar("item_id", { length: 128 }),
  amount: integer("amount").notNull(),
  currency: varchar("currency", { length: 3 }).default("EUR"),
  stripePaymentId: varchar("stripe_payment_id", { length: 256 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 256 }),
  status: purchaseStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = typeof purchases.$inferInsert;

/**
 * Token Transactions - tracks all token additions and spending
 */
export const tokenTransactions = pgTable("token_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: integer("amount").notNull(),
  type: tokenTxTypeEnum("type").notNull(),
  description: text("description"),
  relatedId: integer("related_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type TokenTransaction = typeof tokenTransactions.$inferSelect;
export type InsertTokenTransaction = typeof tokenTransactions.$inferInsert;

/**
 * Daily Challenges - defines daily challenges
 */
export const dailyChallenges = pgTable("daily_challenges", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  mode: gameModeEnum("mode").notNull(),
  description: text("description").notNull(),
  targetScore: integer("target_score"),
  targetTime: integer("target_time"),
  rewardTokens: integer("reward_tokens").notNull().default(50),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type DailyChallenge = typeof dailyChallenges.$inferSelect;
export type InsertDailyChallenge = typeof dailyChallenges.$inferInsert;

/**
 * User Challenges - tracks completed challenges
 */
export const userChallenges = pgTable("user_challenges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  challengeId: integer("challenge_id").notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

export type UserChallenge = typeof userChallenges.$inferSelect;
export type InsertUserChallenge = typeof userChallenges.$inferInsert;

/**
 * Referrals - tracks referral codes and rewards
 */
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").notNull(),
  referredId: integer("referred_id"),
  code: varchar("code", { length: 32 }).notNull().unique(),
  rewardClaimed: integer("reward_claimed").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;

/**
 * User Stats - aggregated statistics for each user
 */
export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  totalGames: integer("total_games").notNull().default(0),
  totalScore: integer("total_score").notNull().default(0),
  highScore: integer("high_score").notNull().default(0),
  totalPlayTime: integer("total_play_time").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastPlayedAt: timestamp("last_played_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type UserStats = typeof userStats.$inferSelect;
export type InsertUserStats = typeof userStats.$inferInsert;

/**
 * Replays – stores serialised recordings for spectator mode
 */
export const replays = pgTable("replays", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  mode: gameModeEnum("mode").notNull(),
  score: integer("score").notNull(),
  /** Duration in ms */
  durationMs: integer("duration_ms").notNull(),
  seed: varchar("seed", { length: 64 }),
  /** Base64-encoded JSON of RecordingData (inputs + snapshots) */
  replayData: text("replay_data").notNull(),
  /** Anti-cheat analysis result: 0 = clean, 1 = flagged */
  flagged: integer("flagged").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Replay = typeof replays.$inferSelect;
export type InsertReplay = typeof replays.$inferInsert;