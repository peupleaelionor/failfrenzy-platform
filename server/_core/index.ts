import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import type { TrpcContext } from "./context";
import { createClient } from "@supabase/supabase-js";
import * as db from "../db";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function createContext({ req }: { req: express.Request; res: express.Response }): Promise<TrpcContext> {
  let user = null;

  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const supabaseUrl = process.env.SUPABASE_URL || "";
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);
        if (supabaseUser && !error) {
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
    }
  } catch (error) {
    user = null;
  }

  return { user } as TrpcContext;
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // CORS
  const allowedOrigins = process.env.CORS_ORIGINS?.split(",") || ["http://localhost:5173", "http://localhost:3000"];
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    }
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
  
  // Stripe webhook MUST be registered BEFORE express.json() for signature verification
  const { handleStripeWebhook } = await import("../stripe/webhook");
  app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);
  
  // Configure body parser
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
