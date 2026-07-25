import { Router }       from 'express';
import { validate }     from '../../middlewares/validate.middleware.js';
import { asistenAuth }  from '../../middlewares/auth.middleware.js';
import { requireRole }  from '../../middlewares/role.middleware.js';
import * as schema      from './questionCard.schema.js';
import * as ctrl        from './questionCard.controller.js';

const router = Router();

// Semua route butuh login sebagai asisten
router.use(asistenAuth);

// ─── Read — semua role asisten dapat mengakses ────────────────────────────────
router.get('/',    ctrl.getAll);
router.get('/:id', ctrl.getOne);

// ─── Write — hanya pj_soal_materi & super_admin ──────────────────────────────
router.post('/',
  requireRole('pj_soal_materi'),
  validate(schema.createSchema),
  ctrl.create
);

router.patch('/:id',
  requireRole('pj_soal_materi'),
  validate(schema.updateSchema),
  ctrl.update
);

router.delete('/:id',
  requireRole('pj_soal_materi'),
  ctrl.hardDelete
);

export default router;
