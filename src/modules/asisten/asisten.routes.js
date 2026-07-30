import { Router }                    from 'express';
import multer                        from 'multer';
import { validate }                  from '../../middlewares/validate.middleware.js';
import { asistenAuth }               from '../../middlewares/auth.middleware.js';
import { requireRole }               from '../../middlewares/role.middleware.js';
// requireRecruitmentActive is no longer needed here
import * as schema                   from './asisten.schema.js';
import * as ctrl                     from './asisten.controller.js';

const router = Router();

// Semua route butuh login sebagai asisten
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

// ─── Read — semua role asisten bisa akses ─────────────────────────────────────
router.get('/',                   ctrl.getAll);
router.get('/filters',            ctrl.getFilters);
router.get('/me',                 ctrl.getMe);
router.get('/template-import',    ctrl.downloadTemplate);
router.get('/export',             requireRole('super_admin'),                                      ctrl.exportData);
router.get('/:id',                ctrl.getOne);
router.get('/:id/penilaian',      ctrl.getHistoryPenilaian);

// ─── Self Update (Asisten diri sendiri) ───────────────────────────────────────
router.patch('/me',               validate(schema.updateMeSchema), ctrl.updateMe);

// ─── Write — hanya super admin ────────────────────────────────────────────────
router.post('/',                  requireRole('super_admin'), validate(schema.createSchema),        ctrl.create);
router.post('/import',            requireRole('super_admin'), uploadImport.single('file'),          ctrl.importFile);
router.post('/:calasId/convert-calas', requireRole('super_admin'), validate(schema.convertCalasSchema), ctrl.convertFromCalas);

router.patch('/:id',              requireRole('super_admin'), validate(schema.updateSchema),        ctrl.update);
router.patch('/:id/role',         requireRole('super_admin'), validate(schema.updateRoleSchema), ctrl.updateRole);
router.patch('/:id/toggle-active', requireRole('super_admin'),                                     ctrl.toggleActive);
router.patch('/:id/reset-password', requireRole('super_admin'),                                    ctrl.resetPassword);

router.delete('/:id',             requireRole('super_admin'),                                      ctrl.hardDelete);

export default router;
