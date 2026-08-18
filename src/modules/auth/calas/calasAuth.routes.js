import { Router }            from 'express';
import { createRateLimiter } from '../../../middlewares/rateLimiter.middleware.js';
import { validate }          from '../../../middlewares/validate.middleware.js';
import { calasAuth }         from '../../../middlewares/auth.middleware.js';
import * as schema           from './calasAuth.schema.js';
import * as ctrl             from './calasAuth.controller.js';

const router = Router();

// Max 30 request gagal per 15 menit per IP — proteksi brute-force login & forgot password.
// Toleransi untuk jaringan bersama / Wi-Fi kampus (NAT). Request berhasil tidak dihitung.
const authLimiter = createRateLimiter({
  windowMs:               15 * 60 * 1000,
  max:                    30,
  skipSuccessfulRequests: true,
  message:                'Terlalu banyak percobaan login gagal. Silakan coba lagi setelah 15 menit.',
});

// POST /api/auth/calas/login
router.post('/login', authLimiter, validate(schema.loginSchema), ctrl.login);

// POST /api/auth/calas/refresh — tukar refresh token (cookie) → access token baru
router.post('/refresh', ctrl.refresh);

// POST /api/auth/calas/logout
router.post('/logout', ctrl.logout);

// POST /api/auth/calas/forgot-password — kirim link reset ke email calas
router.post('/forgot-password', authLimiter, validate(schema.forgotPasswordSchema), ctrl.forgotPassword);

// POST /api/auth/calas/reset-password/:token — reset password via token dari email
router.post('/reset-password/:token', validate(schema.resetPasswordSchema), ctrl.resetPassword);

// POST /api/auth/calas/change-password — ganti password wajib (pertama login via asisten)
router.post('/change-password', calasAuth, validate(schema.changePasswordSchema), ctrl.changePassword);

export default router;
