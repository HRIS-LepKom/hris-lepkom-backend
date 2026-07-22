import rateLimit from 'express-rate-limit';

export const createRateLimiter = ({ windowMs, max, message }) =>
  rateLimit({
    windowMs,
    limit:           max,
    standardHeaders: true,
    legacyHeaders:   false,
    skip:            () => process.env.NODE_ENV !== 'production',
    message: {
      errorStatus: true,
      errorType:   'TooManyRequests',
      errors:      [{ message, code: 429 }],
    },
  });
