import { Router }      from 'express';
import { validate }    from '../../../middlewares/validate.middleware.js';
import { asistenAuth } from '../../../middlewares/auth.middleware.js';
import { requireRole } from '../../../middlewares/role.middleware.js';
import * as schema     from './jadwalKosong.schema.js';
import * as ctrl       from './jadwalKosong.controller.js';

const router = Router();

// Semua route di sini butuh login sebagai asisten
router.use(asistenAuth);

// ─── Dashboard ─────────────────────────────────────────────────────────────
// Semua role asisten bisa melihat daftar jadwal kosong
router.get('/', ctrl.getAll);

// Hanya super_admin yang bisa membuat jadwal kosong baru
router.post(
  '/',
  requireRole('super_admin'),
  validate(schema.createSchema),
  ctrl.create
);

// Hanya super_admin yang bisa mengubah judul jadwal kosong
router.patch(
  '/:id',
  requireRole('super_admin'),
  validate(schema.updateJudulSchema),
  ctrl.updateJudul
);

// ─── Detail Jadwal Kosong ───────────────────────────────────────────────────
// Semua role asisten bisa melihat detail dan list entri
router.get('/:id', ctrl.getDetail);

// Semua role asisten bisa melihat entri spesifik (default value modal)
router.get('/:id/asisten/:asistenId', ctrl.getEntriAsisten);

// ─── Update Field Entri (hanya asisten yang bersangkutan, dicek di service) ──

// Update kursus lepkom yang pernah diikuti
router.patch(
  '/:id/asisten/:asistenId/kursus',
  validate(schema.updateKursusSchema),
  ctrl.updateKursus
);

// Update jadwal kosong (hari + sesi)
router.patch(
  '/:id/asisten/:asistenId/jadwal',
  validate(schema.updateJadwalSchema),
  ctrl.updateJadwal
);

// Update jadwal & materi LEPKOM (khusus mahasiswa aktif / bukan NON CLASS)
router.patch(
  '/:id/asisten/:asistenId/jadwal-materi',
  validate(schema.updateJadwalMateriSchema),
  ctrl.updateJadwalMateri
);

// ─── Export ─────────────────────────────────────────────────────────────────
// Hanya super_admin yang bisa export data ke Excel
router.get(
  '/:id/export',
  requireRole('super_admin'),
  ctrl.exportExcel
);

export default router;
