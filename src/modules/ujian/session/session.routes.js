import { Router } from 'express';
import { asistenAuth }   from '../../../middlewares/auth.middleware.js';
import { requireRole }   from '../../../middlewares/role.middleware.js';
import { validate }      from '../../../middlewares/validate.middleware.js';
import * as schema       from './session.schema.js';
import * as ctrl         from './session.controller.js';

const router = Router();

router.use(asistenAuth);

// Read: semua asisten bisa melihat sesi ujian
router.get('/',    ctrl.getAll);
router.get('/:id', ctrl.getOne);

// Write: hanya koordinator_lapangan (super_admin sudah auto-lolos di requireRole)
router.post('/',    requireRole('koordinator_lapangan'), validate(schema.createSessionSchema), ctrl.create);
router.patch('/:id', requireRole('koordinator_lapangan'), validate(schema.updateSessionSchema), ctrl.update);
router.delete('/:id', requireRole('koordinator_lapangan'), ctrl.remove);

export default router;
