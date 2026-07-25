import { Router } from 'express';
import { asistenAuth, calasAuth } from '../../middlewares/auth.middleware.js';
import { requireRole }            from '../../middlewares/role.middleware.js';
import { validate }               from '../../middlewares/validate.middleware.js';
import * as schema                from './announcement.schema.js';
import * as ctrl                  from './announcement.controller.js';

const router = Router();

// ─── Calas Routes ─────────────────────────────────────────────────────────────
router.get('/feed', calasAuth, ctrl.getFeedForCalas);

// ─── Admin Routes ─────────────────────────────────────────────────────────────
router.use('/admin', asistenAuth, requireRole('koordinator_lapangan', 'super_admin'));

router.post('/admin', validate(schema.createAnnouncementSchema), ctrl.create);
router.get('/admin', ctrl.getAll);
router.get('/admin/:id', ctrl.getOne);
router.patch('/admin/:id', validate(schema.updateAnnouncementSchema), ctrl.update);
router.delete('/admin/:id', ctrl.remove);

export default router;
