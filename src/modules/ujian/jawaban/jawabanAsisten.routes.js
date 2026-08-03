import { Router } from 'express';
import { asistenAuth } from '../../../middlewares/auth.middleware.js';
import * as ctrl from './jawabanAsisten.controller.js';

const router = Router();

router.use(asistenAuth);

router.get('/list', ctrl.listJawabanCalas);
router.get('/download', ctrl.downloadJawabanCalas);

export default router;
