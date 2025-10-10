import rateLimit from 'express-rate-limit';

export const guestRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.GUEST_RATE_LIMIT || '10'),
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_LIMIT || '100'),
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.headers.authorization !== undefined;
  },
});
