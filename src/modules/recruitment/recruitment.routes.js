import { Router }      from 'express';
import { validate }    from '../../middlewares/validate.middleware.js';
import { asistenAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import * as schema     from './recruitment.schema.js';
import * as ctrl       from './recruitment.controller.js';

const router = Router();

// Semua endpoint di module ini hanya bisa diakses super admin
router.use(asistenAuth, requireRole('super_admin'));

// GET  /api/recruitment
router.get('/', ctrl.getAll);

// GET  /api/recruitment/:id
router.get('/:id', ctrl.getOne);

// POST /api/recruitment
router.post('/', validate(schema.createSchema), ctrl.create);

// PUT  /api/recruitment/:id
router.put('/:id', validate(schema.updateSchema), ctrl.update);

// PATCH /api/recruitment/:id/activate
router.patch('/:id/activate', ctrl.activate);

// PATCH /api/recruitment/:id/deactivate
router.patch('/:id/deactivate', ctrl.deactivate);

// DELETE /api/recruitment/:id
router.delete('/:id', ctrl.hardDelete);

export default router;
