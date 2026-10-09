import { Request, Response, NextFunction } from 'express';

/**
 * Standard Security Headers Middleware (equivalent to Helmet essentials)
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
}

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  /**
   * Optional server-side bypass predicate (e.g. for internal health check endpoints).
   * Untrusted client HTTP headers are strictly prohibited from bypassing rate limiting.
   */
  skip?: (req: Request) => boolean;
}

interface ClientRecord {
  count: number;
  resetTime: number;
}

/**
 * In-memory sliding-window IP rate limiter
 */
export function createRateLimiter(options: RateLimitOptions) {
  const clients = new Map<string, ClientRecord>();

  // Periodic cleanup every 2 minutes
  const interval = setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of clients.entries()) {
      if (now > record.resetTime) {
        clients.delete(ip);
      }
    }
  }, 120_000);

  // Unref interval to allow clean node process shutdown
  if (interval.unref) interval.unref();

  const limiter = (req: Request, res: Response, next: NextFunction): void => {
    // Strictly evaluate configured server-side skip predicate; client headers cannot bypass
    if (options.skip && options.skip(req)) {
      return next();
    }

    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();
    let record = clients.get(ip);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + options.windowMs,
      };
      clients.set(ip, record);
    } else {
      record.count++;
    }

    res.setHeader('X-RateLimit-Limit', options.max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, options.max - record.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > options.max) {
      res.status(429).json({
        error: 'Too Many Requests',
        message: options.message || 'Rate limit exceeded. Please wait before submitting additional requests.',
        retry_after_seconds: Math.ceil((record.resetTime - now) / 1000),
      });
      return;
    }

    next();
  };

  limiter._reset = () => {
    clients.clear();
  };

  return limiter;
}

// Pre-configured rate limiters
export const analysisRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30,             // 30 document analyses per minute
  message: 'Document analysis rate limit exceeded. Please wait a moment before uploading another policy.',
});

export const draftRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 40,             // 40 draft generation requests per minute
  message: 'Draft generation rate limit exceeded. Please wait before generating additional communications.',
});

/**
 * Normalizes the ALLOWED_ORIGINS environment variable:
 * - Splits on commas
 * - Trims whitespace
 * - Removes trailing slashes
 * - Filters out empty strings
 * Returns '*' if raw string is undefined, empty, or whitespace.
 */
export function normalizeAllowedOrigins(raw?: string): string[] | '*' {
  if (!raw || !raw.trim()) {
    return '*';
  }
  const origins = raw
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  return origins.length > 0 ? origins : '*';
}
