/**
 * Simple in-memory rate limiter for auth endpoints.
 *
 * NOTE: In production with serverless/edge functions, use Redis or
 * a distributed rate limiting service (e.g., Upstash, Redis, Vercel KV).
 * This implementation works for single-instance deployments.
 */

interface RateLimitEntry {
  count: number;
  firstAttempt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpiredEntries(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup > CLEANUP_INTERVAL) {
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now - entry.firstAttempt > windowMs) {
        rateLimitStore.delete(key);
      }
    }
    lastCleanup = now;
  }
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetIn: number; // seconds until reset
}

/**
 * Check rate limit for a given identifier (usually IP or email)
 * @param identifier - Unique identifier for the request (IP, email, etc.)
 * @param maxAttempts - Maximum attempts allowed in the window
 * @param windowMs - Time window in milliseconds
 */
export function checkRateLimit(
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes default
): RateLimitResult {
  cleanupExpiredEntries(windowMs);

  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry) {
    // First attempt
    rateLimitStore.set(identifier, {
      count: 1,
      firstAttempt: now,
    });
    return {
      success: true,
      remaining: maxAttempts - 1,
      resetIn: Math.ceil(windowMs / 1000),
    };
  }

  // Check if window has expired
  if (now - entry.firstAttempt > windowMs) {
    // Reset the window
    rateLimitStore.set(identifier, {
      count: 1,
      firstAttempt: now,
    });
    return {
      success: true,
      remaining: maxAttempts - 1,
      resetIn: Math.ceil(windowMs / 1000),
    };
  }

  // Within window - check count
  if (entry.count >= maxAttempts) {
    const resetIn = Math.ceil((windowMs - (now - entry.firstAttempt)) / 1000);
    return {
      success: false,
      remaining: 0,
      resetIn,
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(identifier, entry);

  return {
    success: true,
    remaining: maxAttempts - entry.count,
    resetIn: Math.ceil((windowMs - (now - entry.firstAttempt)) / 1000),
  };
}

/**
 * Reset rate limit for a given identifier (e.g., after successful login)
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Get rate limit key for login attempts
 */
export function getLoginKey(email: string, ip?: string): string {
  // Use both email and IP for better protection
  return `login:${email.toLowerCase()}:${ip || "unknown"}`;
}

/**
 * Get rate limit key for registration attempts
 */
export function getRegistrationKey(ip: string): string {
  return `register:${ip}`;
}
