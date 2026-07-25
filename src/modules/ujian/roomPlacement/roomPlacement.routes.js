import { Router } from 'express';
import { asistenAuth }  from '../../../middlewares/auth.middleware.js';
import { requireRole }  from '../../../middlewares/role.middleware.js';
import { validate }     from '../../../middlewares/validate.middleware.js';
import * as schema      from './roomPlacement.schema.js';
import * as ctrl        from './roomPlacement.controller.js';

const router = Router();

router.use(asistenAuth);

// ─── Read (semua asisten bisa akses) ─────────────────────────────────────────
router.get('/',    ctrl.getAll);
router.get('/:id', ctrl.getOne);

// Upload status — PJ, koordinator, super_admin
router.get('/:id/upload-status',
  requireRole('penanggung_jawab_ruangan', 'koordinator_lapangan'),
  ctrl.getUploadStatus
);

// ─── Create / Delete (koordinator + super_admin) ──────────────────────────────
router.post('/',     requireRole('koordinator_lapangan'), validate(schema.createRoomPlacementSchema), ctrl.create);
router.delete('/:id', requireRole('koordinator_lapangan'), ctrl.remove);

// ─── Kelola Calas (koordinator + super_admin + PJ ruangan sendiri) ────────────
router.patch('/:id/add-calas',
  requireRole('penanggung_jawab_ruangan', 'koordinator_lapangan'),
  validate(schema.addCalasSchema),
  ctrl.addCalas
);
router.delete('/:id/remove-calas/:calasId',
  requireRole('penanggung_jawab_ruangan', 'koordinator_lapangan'),
  ctrl.removeCalas
);

// ─── Kelola Penilai (koordinator + super_admin + PJ ruangan sendiri) ──────────
router.patch('/:id/add-penilai',
  requireRole('penanggung_jawab_ruangan', 'koordinator_lapangan'),
  validate(schema.addPenilaiSchema),
  ctrl.addPenilai
);
router.delete('/:id/remove-penilai/:asistenId',
  requireRole('penanggung_jawab_ruangan', 'koordinator_lapangan'),
  ctrl.removePenilai
);

export default router;
