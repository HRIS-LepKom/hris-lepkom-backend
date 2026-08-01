import { Router } from 'express';
import { calasOrPjAuth } from '../../middlewares/auth.middleware.js';
import * as ctrl from './soalCalas.controller.js';

const router = Router();

// Middleware ini akan mengizinkan Calas atau Asisten (super_admin & pj_soal_materi)
router.use(calasOrPjAuth);

// ─── Read & Download ──────────────────────────────────────────────────────────
router.get('/', ctrl.getSoalCalas);
router.get('/:id/download', ctrl.downloadSoalCalas);

export default router;
