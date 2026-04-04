import type { Context } from "https://edge.netlify.com";

/**
 * Netlify Edge Function – API Proxy
 *
 * Proxies /api/* requests to the backend server defined by the
 * BACKEND_URL environment variable while preserving headers,
 * method, and body. Adds CORS headers for the frontend origin.
 */
export default async function handler(
  request: Request,
  context: Context,
): Promise<Response> {
  const backendUrl = Deno.env.get("BACKEND_URL");

  if (!backendUrl) {
    return new Response(
      JSON.stringify({ error: "Backend URL not configured" }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  // Build the target URL – keep the /api/* path intact
  const url = new URL(request.url);
  const target = new URL(url.pathname + url.search, backendUrl);

  // Forward the request to the backend
  const headers = new Headers(request.headers);
  headers.set("X-Forwarded-Host", url.hostname);
  headers.set("X-Forwarded-Proto", url.protocol.replace(":", ""));
  headers.set("X-Netlify-Edge", "true");

  // Geo context provided by Netlify Edge
  if (context.geo?.country?.code) {
    headers.set("X-Country", context.geo.country.code);
  }
  if (context.geo?.city) {
    headers.set("X-City", context.geo.city);
  }

  const backendResponse = await fetch(target.toString(), {
    method: request.method,
    headers,
    body:
      request.method !== "GET" && request.method !== "HEAD"
        ? request.body
        : undefined,
    redirect: "manual",
  });

  // Build response with CORS headers
  const responseHeaders = new Headers(backendResponse.headers);

  const allowedOrigin =
    Deno.env.get("SITE_URL") || url.origin;
  responseHeaders.set("Access-Control-Allow-Origin", allowedOrigin);
  responseHeaders.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  );
  responseHeaders.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With",
  );
  responseHeaders.set("Access-Control-Allow-Credentials", "true");
  responseHeaders.set("Access-Control-Max-Age", "86400");

  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: responseHeaders });
  }

  return new Response(backendResponse.body, {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
    headers: responseHeaders,
  });
}

export const config = {
  path: "/api/*",
};
