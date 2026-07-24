import { Router }      from 'express';
import { validate }    from '../../middlewares/validate.middleware.js';
import { asistenAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import * as schema     from './recruitment.schema.js';
import * as ctrl       from './recruitment.controller.js';

const router = Router();

// Semua endpoint di module ini hanya bisa diakses super admin
router.use(asistenAuth, requireRole('super_admin'));

// GET  /api/recruitment/status — cek status toggle + info audit
router.get('/status', ctrl.getStatus);

// PATCH /api/recruitment/activate — aktifkan periode rekrutmen
router.patch('/activate', validate(schema.activateSchema), ctrl.activate);

// PATCH /api/recruitment/deactivate — nonaktifkan periode rekrutmen
router.patch('/deactivate', ctrl.deactivate);

export default router;
