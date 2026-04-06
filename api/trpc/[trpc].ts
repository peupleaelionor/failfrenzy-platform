/**
 * Vercel Serverless tRPC handler
 * Validates Supabase JWT from Authorization header and passes user into tRPC context.
 */
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createClient } from "@supabase/supabase-js";
import { appRouter } from "../../server/routers";
import type { TrpcContext } from "../../server/_core/context";
import * as db from "../../server/db";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

async function createContext(req: Request): Promise<TrpcContext> {
  let user = null;

  try {
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const {
        data: { user: supabaseUser },
        error,
      } = await supabase.auth.getUser(token);

      if (supabaseUser && !error) {
        // Look up or create user in our database
        let dbUser = await db.getUserBySupabaseId(supabaseUser.id);
        if (!dbUser) {
          await db.upsertUserFromSupabase({
            supabaseId: supabaseUser.id,
            email: supabaseUser.email ?? null,
            name: supabaseUser.user_metadata?.username ?? supabaseUser.user_metadata?.full_name ?? null,
          });
          dbUser = await db.getUserBySupabaseId(supabaseUser.id);
        }
        user = dbUser ?? null;
      }
    }
  } catch (error) {
    console.warn("[Auth] Failed to authenticate:", error);
    user = null;
  }

  return { user } as TrpcContext;
}

export default async function handler(req: Request) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
    onError({ error, path }) {
      console.error(`[tRPC] Error on ${path}:`, error.message);
    },
  });
}

export const config = {
  runtime: "nodejs",
};
