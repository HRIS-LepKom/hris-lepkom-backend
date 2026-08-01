import { Router } from 'express';
import multer from 'multer';
import { validate }                  from '../../../middlewares/validate.middleware.js';
import { asistenAuth, calasAuth }    from '../../../middlewares/auth.middleware.js';
import { requireRole }               from '../../../middlewares/role.middleware.js';
import { requireRecruitmentActive }  from '../../../middlewares/requireRecruitmentActive.middleware.js';
import * as schema                   from './management.schema.js';
import * as ctrl                     from './management.controller.js';
import biodataRoutes                 from '../biodata/biodata.routes.js';

const router = Router();

// ─── Middleware upload untuk import file (CSV/Excel) ─────────────────────────
const IMPORT_MIMES = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];
const uploadImport = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!IMPORT_MIMES.includes(file.mimetype)) {
      return cb(new Error('Format file tidak didukung. Gunakan CSV atau Excel (.xlsx)'));
    }
    cb(null, true);
  },
});

// ─── Calas Self Routes ────────────────────────────────────────────────────────
router.get('/me', calasAuth, ctrl.getMe);
router.use('/me/biodata', calasAuth, biodataRoutes);

// ─── Admin / Asisten Routes ───────────────────────────────────────────────────
router.use(asistenAuth);

// Read — semua asisten bisa akses
router.get('/',                 ctrl.getAll);
router.get('/export',           ctrl.exportToExcel);
router.get('/filters',          ctrl.getFilters);
router.get('/template-import',  ctrl.downloadTemplate);
router.get('/:id',              ctrl.getOne);

// Write — hanya super_admin
router.post('/',      requireRole('super_admin'), validate(schema.createSchema),        ctrl.create);
router.post('/import',requireRole('super_admin'), uploadImport.single('file'),          ctrl.importFile);

router.patch('/:id',        requireRole('super_admin'), validate(schema.updateSchema),  ctrl.update);
router.patch('/:id/ban',    requireRole('super_admin'),                                  ctrl.ban);
router.patch('/:id/unban',  requireRole('super_admin'),                                  ctrl.unban);

router.delete('/:id', requireRole('super_admin'), validate(schema.deleteSchema),        ctrl.hardDelete);

// Rekrutmen Aktif Only — super_admin
router.patch('/:id/timeline',     requireRole('super_admin'), requireRecruitmentActive, validate(schema.updateTimelineSchema), ctrl.updateTimeline);
router.patch('/:id/reset-proses', requireRole('super_admin'), requireRecruitmentActive,                                        ctrl.resetProses);
router.patch('/:id/accept',       requireRole('super_admin'), requireRecruitmentActive,                                        ctrl.acceptCalas);
router.patch('/:id/reject',       requireRole('super_admin'), requireRecruitmentActive, validate(schema.rejectSchema),         ctrl.rejectCalas);

// Actions — super_admin
router.patch('/:id/reset-password',    requireRole('super_admin'), ctrl.resetPassword);
router.post('/:id/send-biodata-email', requireRole('super_admin'), ctrl.sendBiodataEmail);

export default router;
