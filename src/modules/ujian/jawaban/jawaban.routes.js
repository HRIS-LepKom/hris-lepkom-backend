import { Router } from 'express';
import { calasAuth }              from '../../../middlewares/auth.middleware.js';
import { createUploadMiddleware } from '../../../middlewares/upload.middleware.js';
import * as ctrl                  from './jawaban.controller.js';

const router = Router();
const uploadPraktek = createUploadMiddleware('jawaban_praktek', 10);
const uploadProject = createUploadMiddleware('jawaban_project', 10);

router.use(calasAuth);

// Temp routes
router.post('/praktek/temp', uploadPraktek.single('file'), ctrl.uploadTempPraktek);
router.post('/project/temp', uploadProject.single('file'), ctrl.uploadTempProject);
router.delete('/temp', ctrl.deleteTempJawaban);

// Permanent routes
router.patch('/praktek', ctrl.saveJawabanPraktek);
router.delete('/praktek', ctrl.deleteJawabanPraktek);
router.get('/praktek/download', ctrl.downloadJawabanPraktek);

router.patch('/project', ctrl.saveJawabanProject);
router.delete('/project', ctrl.deleteJawabanProject);
router.get('/project/download', ctrl.downloadJawabanProject);

export default router;
