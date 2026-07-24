import { Router } from 'express';
import { validate }                 from '../../middlewares/validate.middleware.js';
import { asistenAuth }              from '../../middlewares/auth.middleware.js';
import { requireRole }              from '../../middlewares/role.middleware.js';
import { createUploadMiddleware }   from '../../middlewares/upload.middleware.js';
import * as schema                  from './soal.schema.js';
import * as ctrl                    from './soal.controller.js';

const router     = Router();

// Gunakan middleware upload yang sudah ada — tipe 'soal', max 2 MB
const uploadSoal = createUploadMiddleware('soal', 2);

// Semua route butuh login sebagai asisten
router.use(asistenAuth);

// ─── Read & Download ──────────────────────────────────────────────────────────
// Akses dikontrol di dalam service berdasarkan isViewed dan role requester
router.get('/',              ctrl.getAll);
router.get('/:id',           ctrl.getOne);
router.get('/:id/download',  ctrl.downloadFile);

// ─── Write (metadata soal) — pj_soal_materi & super_admin ────────────────────
// requireRole sudah otomatis mengizinkan super_admin
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

router.patch('/:id/toggle-view',
  requireRole('pj_soal_materi'),
  ctrl.toggleView
);

// ─── File Operations — pj_soal_materi & super_admin ──────────────────────────
router.patch('/:id/file',
  requireRole('pj_soal_materi'),
  uploadSoal.single('file'),
  ctrl.uploadFile
);

router.delete('/:id/file',
  requireRole('pj_soal_materi'),
  ctrl.deleteFile
);

// ─── Hard Delete soal + file ──────────────────────────────────────────────────
router.delete('/:id',
  requireRole('pj_soal_materi'),
  ctrl.hardDelete
);

export default router;
