import rateLimit from 'express-rate-limit';

export const createRateLimiter = ({
  windowMs,
  max,
  message,
  skipSuccessfulRequests = true,
}) =>
  rateLimit({
    windowMs,
    limit:                  max,
    standardHeaders:        true,
    legacyHeaders:          false,
    skipSuccessfulRequests, // Request berhasil (2xx/3xx) tidak mengurangi kuota
    skip:                   () => process.env.NODE_ENV !== 'production',
    message: {
      errorStatus: true,
      errorType:   'TooManyRequests',
      errors:      [{ message, code: 429 }],
    },
  });
