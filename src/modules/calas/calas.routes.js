import { Router }                    from 'express';
import multer                        from 'multer';
import { validate }                  from '../../middlewares/validate.middleware.js';
import { asistenAuth, calasAuth }    from '../../middlewares/auth.middleware.js';
import { requireRole }               from '../../middlewares/role.middleware.js';
import { requireRecruitmentActive }  from '../../middlewares/requireRecruitmentActive.middleware.js';
import * as schema                   from './calas.schema.js';
import * as ctrl                     from './calas.controller.js';

const router = Router();

// Endpoint untuk dashboard calas (tidak perlu asistenAuth)
router.get('/me', calasAuth, ctrl.getMe);

// Sisa route butuh login sebagai asisten
router.use(asistenAuth);

// Middleware upload file import — terima CSV dan Excel (max 5 MB)
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

// ─── Read — semua asisten bisa akses ──────────────────────────────────────────
router.get('/',                   ctrl.getAll);
router.get('/template-import',    ctrl.downloadTemplate);
router.get('/:id',                ctrl.getOne);

// ─── Write — hanya super admin ────────────────────────────────────────────────
router.post('/',                  requireRole('super_admin'), validate(schema.createSchema),        ctrl.create);
router.post('/import',            requireRole('super_admin'), uploadImport.single('file'),          ctrl.importFile);

router.patch('/:id',              requireRole('super_admin'), validate(schema.updateSchema),        ctrl.update);
router.patch('/:id/ban',          requireRole('super_admin'),                                       ctrl.ban);
router.patch('/:id/unban',        requireRole('super_admin'),                                       ctrl.unban);

router.delete('/:id',             requireRole('super_admin'), validate(schema.deleteSchema),        ctrl.hardDelete);

// ─── Rekrutmen Aktif Only — super admin ───────────────────────────────────────
router.patch('/:id/timeline',     requireRole('super_admin'), requireRecruitmentActive, validate(schema.updateTimelineSchema), ctrl.updateTimeline);
router.patch('/:id/reset-proses', requireRole('super_admin'), requireRecruitmentActive,                                        ctrl.resetProses);

export default router;
