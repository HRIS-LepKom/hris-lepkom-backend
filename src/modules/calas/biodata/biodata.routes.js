import { Router } from 'express';
import { validate }              from '../../../middlewares/validate.middleware.js';
import { requireCalasStage }     from '../../../middlewares/requireCalasStage.middleware.js';
import { createUploadMiddleware } from '../../../middlewares/upload.middleware.js';
import * as schema               from './biodata.schema.js';
import * as ctrl                 from './biodata.controller.js';

const router = Router();
const uploadDokumen = createUploadMiddleware('dokumen', 2); // Maks 2MB

// Semua route di sini aktif pada tahap registrasi, screening, dan biodata_dokumen
router.use(requireCalasStage('registrasi', 'screening', 'biodata_dokumen'));

router.patch('/', validate(schema.updateBiodataSchema), ctrl.updateBiodata);

// Temporary File Upload (State terpisah dari DB)
router.post('/dokumen/:jenisDokumen/temp', uploadDokumen.single('file'), ctrl.uploadTempFile);
router.delete('/dokumen/temp', ctrl.deleteTempFile);

// Permanent Delete & Download (Tersimpan di DB)
router.patch('/dokumen/cv',              uploadDokumen.single('file'), ctrl.uploadCv);
router.delete('/dokumen/cv',             ctrl.deleteCv);
router.get('/dokumen/cv/download',       ctrl.downloadCv);

router.patch('/dokumen/krs',             uploadDokumen.single('file'), ctrl.uploadKrs);
router.delete('/dokumen/krs',            ctrl.deleteKrs);
router.get('/dokumen/krs/download',      ctrl.downloadKrs);

router.patch('/dokumen/rangkuman-nilai', uploadDokumen.single('file'), ctrl.uploadRangkumanNilai);
router.delete('/dokumen/rangkuman-nilai', ctrl.deleteRangkumanNilai);
router.get('/dokumen/rangkuman-nilai/download', ctrl.downloadRangkumanNilai);

export default router;
