import rateLimit from 'express-rate-limit';

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Limit each IP to 10000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
  skip: (req) => {
    // Exclude background workers
    const internalToken = req.headers["x-internal-worker-token"];
    return !!(internalToken && internalToken === (process.env.INTERNAL_WORKER_SECRET || 'dev-internal-secret'));
  }
});

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 login attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later.' },
  skip: (req) => {
    const internalToken = req.headers["x-internal-worker-token"];
    return !!(internalToken && internalToken === (process.env.INTERNAL_WORKER_SECRET || 'dev-internal-secret'));
  }
});
