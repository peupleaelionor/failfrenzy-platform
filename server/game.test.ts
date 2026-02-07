import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `user${userId}@test.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    isPremium: 0,
    premiumExpiresAt: null,
    tokens: 100,
    stripeCustomerId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: { origin: "https://test.manus.space" },
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Game Router", () => {
  it("should return user stats", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const stats = await caller.game.getMyStats();
    
    // Stats can be null for new users
    expect(stats === null || typeof stats === "object").toBe(true);
  });

  it("should return user high score", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const highScore = await caller.game.getMyHighScore({ mode: "classic" });
    
    expect(typeof highScore).toBe("number");
    expect(highScore).toBeGreaterThanOrEqual(0);
  });
});

describe("Leaderboard Router", () => {
  it("should return global leaderboard", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const leaderboard = await caller.leaderboard.getGlobal({ limit: 10 });
    
    expect(Array.isArray(leaderboard)).toBe(true);
  });

  it("should filter leaderboard by mode", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const leaderboard = await caller.leaderboard.getGlobal({ 
      mode: "classic",
      limit: 10 
    });
    
    expect(Array.isArray(leaderboard)).toBe(true);
  });
});

describe("Tokens Router", () => {
  it("should return token balance", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const balance = await caller.tokens.getBalance();
    
    expect(typeof balance).toBe("number");
    expect(balance).toBeGreaterThanOrEqual(0);
  });

  it("should return token transactions", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const transactions = await caller.tokens.getTransactions({ limit: 10 });
    
    expect(Array.isArray(transactions)).toBe(true);
  });
});

describe("Shop Router", () => {
  it("should return all skins", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const skins = await caller.shop.getSkins();
    
    expect(Array.isArray(skins)).toBe(true);
  });

  it("should return user skins", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const userSkins = await caller.shop.getMySkins();
    
    expect(Array.isArray(userSkins)).toBe(true);
  });
});

describe("Premium Router", () => {
  it("should return premium features", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const features = await caller.premium.getFeatures();
    
    expect(features).toHaveProperty("free");
    expect(features).toHaveProperty("premium");
    expect(features.premium.price.monthly).toBe(4.99);
    expect(features.premium.price.yearly).toBe(39.99);
  });

  it("should check premium status", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const isPremium = await caller.premium.checkStatus();
    
    expect(typeof isPremium).toBe("boolean");
  });
});

describe("Referral Router", () => {
  it("should generate referral code", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const code = await caller.referral.getMyCode();
    
    expect(typeof code).toBe("string");
    expect(code.length).toBeGreaterThan(0);
  });
});

describe("Challenges Router", () => {
  it("should return today's challenges", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const challenges = await caller.challenges.getToday();
    
    expect(Array.isArray(challenges)).toBe(true);
  });
});

describe("Achievements Router", () => {
  it("should return user achievements", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const achievements = await caller.achievements.getMy();
    
    expect(Array.isArray(achievements)).toBe(true);
  });
});
