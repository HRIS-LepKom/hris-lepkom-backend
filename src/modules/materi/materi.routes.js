import { Router }      from 'express';
import { validate }    from '../../middlewares/validate.middleware.js';
import { asistenAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import * as schema     from './materi.schema.js';
import * as ctrl       from './materi.controller.js';

const router = Router();

// Semua route di sini butuh login asisten
router.use(asistenAuth);

// ─── Read (Bisa diakses oleh semua asisten) ───────────────────────────
router.get('/',        ctrl.getAll);
router.get('/authors', ctrl.getAuthors);
router.get('/names',   ctrl.getNames);
router.get('/:id',     ctrl.getOne);

// ─── Write (Hanya super_admin & pj_soal_materi) ───────────────────────
const authorizedRoles = requireRole('super_admin', 'pj_soal_materi');

router.post('/',       authorizedRoles, validate(schema.createSchema), ctrl.create);
router.patch('/:id',   authorizedRoles, validate(schema.updateSchema), ctrl.update);
router.delete('/:id',  authorizedRoles, ctrl.hardDelete);

export default router;
