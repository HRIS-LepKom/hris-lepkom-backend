import { Router } from 'express';
import { validate }              from '../../../middlewares/validate.middleware.js';
import { requireCalasStage }     from '../../../middlewares/requireCalasStage.middleware.js';
import { createUploadMiddleware } from '../../../middlewares/upload.middleware.js';
import * as schema               from './biodata.schema.js';
import * as ctrl                 from './biodata.controller.js';

const router = Router();
const uploadDokumen = createUploadMiddleware('dokumen', 2); // Maks 2MB

// Semua route di sini hanya aktif saat tahap biodata_dokumen
router.use(requireCalasStage('biodata_dokumen'));

router.patch('/', validate(schema.updateBiodataSchema), ctrl.updateBiodata);

router.patch('/dokumen/cv',              uploadDokumen.single('file'), ctrl.uploadCv);
router.delete('/dokumen/cv',             ctrl.deleteCv);

router.patch('/dokumen/krs',             uploadDokumen.single('file'), ctrl.uploadKrs);
router.delete('/dokumen/krs',            ctrl.deleteKrs);

router.patch('/dokumen/rangkuman-nilai', uploadDokumen.single('file'), ctrl.uploadRangkumanNilai);
router.delete('/dokumen/rangkuman-nilai', ctrl.deleteRangkumanNilai);

export default router;
