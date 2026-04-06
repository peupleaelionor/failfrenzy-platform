import type { User } from "../../drizzle/schema";

/**
 * tRPC context type.
 * In serverless mode (Vercel), req/res are not available — user is injected from
 * the Supabase JWT in api/trpc/[trpc].ts.
 * In Express dev mode, req/res are available from the Express adapter.
 */
export type TrpcContext = {
  req?: any;
  res?: any;
  user: User | null;
};
