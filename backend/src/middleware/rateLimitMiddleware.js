/**
 * rateLimitMiddleware.js — Express rate limiters.
 *
 * Two tiers:
 *   apiLimiter  — general API endpoints: 100 req / 15 min per IP
 *   authLimiter — authentication endpoints: 15 req / 15 min per IP (stricter)
 *
 * Why: Protects against brute-force password attacks, credential stuffing,
 * and DoS via API abuse without needing an external proxy.
 *
 * Returns RFC-compliant 429 responses with Retry-After headers.
 */

import rateLimit from "express-rate-limit";

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/**
 * General API rate limiter.
 * Applied to all /api/* routes except auth.
 */
export const apiLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: 100,
  standardHeaders: true,   // Sends RateLimit-* headers (RFC 6585)
  legacyHeaders: false,     // Disable the deprecated X-RateLimit-* headers
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again after 15 minutes.",
  },
});

/**
 * Strict limiter for authentication routes.
 * Prevents brute-force login and registration spam.
 */
export const authLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again after 15 minutes.",
  },
  skipSuccessfulRequests: true, // Only failed/rejected requests count toward the limit
});
