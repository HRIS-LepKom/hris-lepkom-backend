import { Router }            from 'express';
import { createRateLimiter } from '../../../middlewares/rateLimiter.middleware.js';
import { validate }          from '../../../middlewares/validate.middleware.js';
import { asistenAuth }       from '../../../middlewares/auth.middleware.js';
import { requireRole }       from '../../../middlewares/role.middleware.js';
import * as schema           from './asistenAuth.schema.js';
import * as ctrl             from './asistenAuth.controller.js';

const router = Router();

// Max 30 request gagal per 15 menit per IP — proteksi brute-force login & hard reset.
// Toleransi untuk jaringan bersama / Wi-Fi kampus (NAT). Request berhasil tidak dihitung.
const authLimiter = createRateLimiter({
  windowMs:               15 * 60 * 1000,
  max:                    30,
  skipSuccessfulRequests: true,
  message:                'Terlalu banyak percobaan login gagal. Silakan coba lagi setelah 15 menit.',
});

// POST /api/auth/asisten/register — bootstrap super admin (sekali pakai)
router.post('/register', ctrl.registerSuperAdmin);

// POST /api/auth/asisten/login
router.post('/login', authLimiter, validate(schema.loginSchema), ctrl.login);

// POST /api/auth/asisten/refresh — tukar refresh token (cookie) → access token baru
router.post('/refresh', ctrl.refresh);

// POST /api/auth/asisten/logout
router.post('/logout', ctrl.logout);

// POST /api/auth/asisten/request-hard-reset — asisten ajukan reset password ke super admin
router.post('/request-hard-reset', authLimiter, validate(schema.requestHardResetSchema), ctrl.requestHardReset);

// GET /api/auth/asisten/hard-reset-requests — super admin lihat daftar request
router.get('/hard-reset-requests', asistenAuth, requireRole('super_admin'), ctrl.getHardResetRequests);

// POST /api/auth/asisten/approve-hard-reset/:requestId — super admin setujui
router.post('/approve-hard-reset/:requestId', asistenAuth, requireRole('super_admin'), ctrl.approveHardReset);

// POST /api/auth/asisten/reject-hard-reset/:requestId — super admin tolak
router.post('/reject-hard-reset/:requestId', asistenAuth, requireRole('super_admin'), ctrl.rejectHardReset);

// POST /api/auth/asisten/change-password — ganti password (wajib setelah hard reset)
router.post('/change-password', asistenAuth, validate(schema.changePasswordSchema), ctrl.changePassword);

export default router;
