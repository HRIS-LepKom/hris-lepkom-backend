import { Router } from 'express';
import { calasAuth }              from '../../../middlewares/auth.middleware.js';
import { createUploadMiddleware } from '../../../middlewares/upload.middleware.js';
import * as ctrl                  from './jawaban.controller.js';

const router = Router();
const uploadFile = createUploadMiddleware('jawaban', 10);

router.use(calasAuth);

router.patch('/praktek',  uploadFile.single('file'), ctrl.uploadJawabanPraktek);
router.delete('/praktek', ctrl.deleteJawabanPraktek);

router.patch('/project',  uploadFile.single('file'), ctrl.uploadJawabanProject);
router.delete('/project', ctrl.deleteJawabanProject);

export default router;
