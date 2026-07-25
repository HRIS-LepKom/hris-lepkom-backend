import { Router } from 'express';
import { asistenAuth }  from '../../../middlewares/auth.middleware.js';
import { requireRole }  from '../../../middlewares/role.middleware.js';
import { validate }     from '../../../middlewares/validate.middleware.js';
import * as schema      from './roomAssignment.schema.js';
import * as ctrl        from './roomAssignment.controller.js';

const router = Router();

router.use(asistenAuth);

// Read: semua asisten bisa lihat
router.get('/',    ctrl.getAll);
router.get('/:id', ctrl.getOne);

// Write: hanya koordinator_lapangan (super_admin auto-lolos)
router.post('/',     requireRole('koordinator_lapangan'), validate(schema.createRoomAssignmentSchema), ctrl.create);
router.patch('/:id', requireRole('koordinator_lapangan'), validate(schema.updateRoomAssignmentSchema), ctrl.update);
router.delete('/:id',requireRole('koordinator_lapangan'), ctrl.remove);

export default router;
