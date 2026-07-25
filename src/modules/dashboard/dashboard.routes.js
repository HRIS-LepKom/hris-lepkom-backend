import { Router } from 'express';
import { asistenAuth } from '../../middlewares/auth.middleware.js';
import * as ctrl       from './dashboard.controller.js';

const router = Router();

// Endpoint admin (asisten) dashboard
router.get('/admin', asistenAuth, ctrl.getAdminStats);

export default router;
