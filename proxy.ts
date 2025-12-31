import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// In-memory rate limiting store
// Note: This resets on server restart. For production, use Redis/Upstash
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limit configuration per route pattern
const RATE_LIMITS: Record<string, { requests: number; windowMs: number }> = {
  "/api/checkout": { requests: 10, windowMs: 60 * 1000 }, // 10 per minute
  "/api/search": { requests: 30, windowMs: 60 * 1000 }, // 30 per minute
  "/api/products": { requests: 60, windowMs: 60 * 1000 }, // 60 per minute
  "/api/categories": { requests: 60, windowMs: 60 * 1000 }, // 60 per minute
  "/api/auth": { requests: 10, windowMs: 60 * 1000 }, // 10 per minute
  "/api": { requests: 100, windowMs: 60 * 1000 }, // Default: 100 per minute
};

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  return forwarded?.split(",")[0]?.trim() || realIP || "unknown";
}

function getRateLimitConfig(pathname: string): { requests: number; windowMs: number } {
  // Find most specific matching route
  for (const [route, config] of Object.entries(RATE_LIMITS)) {
    if (route !== "/api" && pathname.startsWith(route)) {
      return config;
    }
  }
  return RATE_LIMITS["/api"];
}

function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  // Clean up expired entries periodically
  if (rateLimitStore.size > 10000) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetTime < now) {
        rateLimitStore.delete(k);
      }
    }
  }

  if (!record || record.resetTime < now) {
    // New window
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs };
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: record.resetTime - now,
    };
  }

  record.count++;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetIn: record.resetTime - now,
  };
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply rate limiting to API routes
  if (pathname.startsWith("/api")) {
    const ip = getClientIP(request);
    const config = getRateLimitConfig(pathname);
    const key = `${ip}:${pathname.split("/").slice(0, 3).join("/")}`;

    const result = checkRateLimit(key, config.requests, config.windowMs);

    if (!result.allowed) {
      return new NextResponse(
        JSON.stringify({
          error: "Too many requests",
          retryAfter: Math.ceil(result.resetIn / 1000),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil(result.resetIn / 1000)),
            "X-RateLimit-Limit": String(config.requests),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(result.resetIn / 1000)),
          },
        }
      );
    }

    // Add rate limit headers to successful responses
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", String(config.requests));
    response.headers.set("X-RateLimit-Remaining", String(result.remaining));
    response.headers.set("X-RateLimit-Reset", String(Math.ceil(result.resetIn / 1000)));

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all API routes
    "/api/:path*",
  ],
};
