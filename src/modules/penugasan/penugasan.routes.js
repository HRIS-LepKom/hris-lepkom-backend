import { Router } from 'express';
import { asistenAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import * as schema from './penugasan.schema.js';
import * as ctrl from './penugasan.controller.js';

const router = Router();

// Semua rute penugasan membutuhkan login asisten
router.use(asistenAuth);

// 1. Endpoint ketersediaan Asisten (Super Admin & Korlap)
router.get(
  '/asisten/available-pj',
  requireRole('super_admin', 'koordinator_lapangan'),
  validate(schema.availablePjSchema, 'query'),
  ctrl.getAvailablePj
);

router.get(
  '/asisten/available-penilai',
  requireRole('super_admin', 'koordinator_lapangan'),
  validate(schema.availablePenilaiSchema, 'query'),
  ctrl.getAvailablePenilai
);

// 2. CRUD Penempatan Ruangan Asisten (Super Admin & Korlap)
router.get(
  '/ruangan',
  requireRole('super_admin', 'koordinator_lapangan'),
  ctrl.getAllRoomPlacements
);

router.post(
  '/ruangan/asisten',
  requireRole('super_admin', 'koordinator_lapangan'),
  validate(schema.createAsistenPlacementSchema),
  ctrl.createAsistenPlacement
);

router.put(
  '/ruangan/:id/asisten',
  requireRole('super_admin', 'koordinator_lapangan'),
  validate(schema.updateAsistenPlacementSchema),
  ctrl.updateAsistenPlacement
);

router.delete(
  '/ruangan/:id',
  requireRole('super_admin', 'koordinator_lapangan'),
  ctrl.deletePlacement
);

// 3. Endpoint ketersediaan Calas (Super Admin & Korlap)
router.get(
  '/calas/available',
  requireRole('super_admin', 'koordinator_lapangan'),
  validate(schema.availableCalasSchema, 'query'),
  ctrl.getAvailableCalas
);

// 4. Update Penempatan Calas (Super Admin & Korlap)
router.put(
  '/ruangan/:id/calas',
  requireRole('super_admin', 'koordinator_lapangan'),
  validate(schema.updateCalasPlacementSchema),
  ctrl.updateCalasPlacement
);

export default router;
