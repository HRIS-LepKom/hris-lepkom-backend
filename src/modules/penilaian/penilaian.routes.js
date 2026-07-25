import { Router } from 'express';
import { asistenAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { validate }    from '../../middlewares/validate.middleware.js';
import * as schema     from './penilaian.schema.js';
import * as ctrl       from './penilaian.controller.js';

const router = Router();

router.use(asistenAuth);

// Penilai melihat riwayat mereka sendiri
router.get('/me/history', requireRole('asisten_penilai'), ctrl.getMyHistory);

// Penilai submit nilai
router.post('/praktek', requireRole('asisten_penilai'), validate(schema.submitPenilaianPraktekSchema), ctrl.submitPraktek);
router.post('/project', requireRole('asisten_penilai'), validate(schema.submitPenilaianProjectSchema), ctrl.submitProject);

export default router;
