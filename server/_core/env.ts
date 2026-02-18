export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};

/**
 * Validates required environment variables and logs warnings for missing optional ones
 */
export function validateEnvironment(): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required environment variables
  if (!ENV.databaseUrl) {
    errors.push("DATABASE_URL is required");
  }
  if (!ENV.cookieSecret) {
    errors.push("JWT_SECRET is required");
  }

  // Important environment variables (warnings only)
  if (!ENV.oAuthServerUrl) {
    warnings.push("OAUTH_SERVER_URL is not configured. OAuth authentication may not work.");
  }
  if (!ENV.appId) {
    warnings.push("VITE_APP_ID is not configured. OAuth authentication may not work.");
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    warnings.push("STRIPE_SECRET_KEY is not configured. Payment functionality will be disabled.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

