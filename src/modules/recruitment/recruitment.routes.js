import { Router }      from 'express';
import { validate }    from '../../middlewares/validate.middleware.js';
import { asistenAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import * as schema     from './recruitment.schema.js';
import * as ctrl       from './recruitment.controller.js';

const router = Router();

// Kita butuh asisten biasa bisa melihat data rekrutmen (misal untuk cek status aktif)
router.use(asistenAuth);

// GET  /api/recruitment (Bisa diakses semua asisten)
router.get('/', ctrl.getAll);

// GET  /api/recruitment/:id (Bisa diakses semua asisten)
router.get('/:id', ctrl.getOne);

// Endpoint di bawah ini hanya bisa diakses super admin
const onlySuperAdmin = requireRole('super_admin');

// POST /api/recruitment
router.post('/', onlySuperAdmin, validate(schema.createSchema), ctrl.create);

// PUT  /api/recruitment/:id
router.put('/:id', onlySuperAdmin, validate(schema.updateSchema), ctrl.update);

// PATCH /api/recruitment/:id/activate
router.patch('/:id/activate', onlySuperAdmin, ctrl.activate);

// PATCH /api/recruitment/:id/deactivate
router.patch('/:id/deactivate', onlySuperAdmin, ctrl.deactivate);

// DELETE /api/recruitment/:id
router.delete('/:id', onlySuperAdmin, ctrl.hardDelete);

export default router;
