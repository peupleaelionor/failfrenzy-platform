import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { validateEnvironment } from "./_core/env";
import { getStripe, isStripeConfigured } from "./stripe/config";

describe("Environment Variable Handling", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe("validateEnvironment", () => {
    it("should report errors when required variables are missing", () => {
      delete process.env.DATABASE_URL;
      delete process.env.JWT_SECRET;

      const result = validateEnvironment();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("DATABASE_URL is required");
      expect(result.errors).toContain("JWT_SECRET is required");
    });

    it("should report warnings when optional variables are missing", () => {
      process.env.DATABASE_URL = "mysql://test";
      process.env.JWT_SECRET = "test-secret";
      delete process.env.OAUTH_SERVER_URL;
      delete process.env.STRIPE_SECRET_KEY;

      const result = validateEnvironment();

      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes("OAUTH_SERVER_URL"))).toBe(true);
      expect(result.warnings.some(w => w.includes("STRIPE_SECRET_KEY"))).toBe(true);
    });

    it("should pass validation when all required variables are set", () => {
      process.env.DATABASE_URL = "mysql://test";
      process.env.JWT_SECRET = "test-secret";
      process.env.OAUTH_SERVER_URL = "https://api.manus.im";
      process.env.STRIPE_SECRET_KEY = "sk_test_123";

      const result = validateEnvironment();

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("Stripe Configuration", () => {
    it("should return null when STRIPE_SECRET_KEY is not set", () => {
      delete process.env.STRIPE_SECRET_KEY;

      const stripe = getStripe();
      
      expect(stripe).toBeNull();
      expect(isStripeConfigured()).toBe(false);
    });

    it("should return null when STRIPE_SECRET_KEY is empty", () => {
      process.env.STRIPE_SECRET_KEY = "";

      const stripe = getStripe();
      
      expect(stripe).toBeNull();
      expect(isStripeConfigured()).toBe(false);
    });

    it("should return null when STRIPE_SECRET_KEY is whitespace", () => {
      process.env.STRIPE_SECRET_KEY = "   ";

      const stripe = getStripe();
      
      expect(stripe).toBeNull();
      expect(isStripeConfigured()).toBe(false);
    });
  });
});
