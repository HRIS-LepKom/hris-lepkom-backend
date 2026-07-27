import { Router } from 'express';
import { asistenAuth, calasAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import * as ctrl       from './dashboard.controller.js';

const router = Router();

// Endpoint admin (asisten) dashboard
router.get('/admin', asistenAuth, requireRole('super_admin'), ctrl.getAdminStats);

// Endpoint koordinator
router.get('/koordinator', asistenAuth, requireRole('koordinator_lapangan', 'penanggung_jawab_ruangan', 'pj_soal_materi'), ctrl.getKoordinatorStats);

// Endpoint penilai
router.get('/penilai', asistenAuth, requireRole('asisten_penilai'), ctrl.getPenilaiStats);

// Endpoint calas
router.get('/calas', calasAuth, ctrl.getCalasStats);

export default router;
