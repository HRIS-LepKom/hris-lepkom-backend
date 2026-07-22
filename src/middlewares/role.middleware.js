import { sendError } from '../utils/apiResponse.js';
import { ASISTEN_ROLES } from '../models/asisten.model.js';

export const requireRole = (...allowedRoles) => {
  // sanity check waktu development — nangkep typo nama role sedini mungkin
  if (process.env.NODE_ENV !== 'production') {
    const invalid = allowedRoles.filter((r) => !ASISTEN_ROLES.includes(r));
    if (invalid.length) {
      console.warn(`[requireRole] role tidak dikenal: ${invalid.join(', ')}`);
    }
  }

  return (req, res, next) => {
    const asisten = req.asisten;

    if (!asisten) {
      return sendError(res, 'Akun asisten tidak ditemukan pada request', 401);
    }

    if (!asisten.role) {
      return sendError(res, 'Akun Anda belum memiliki role, hubungi super admin', 403);
    }

    if (asisten.role === 'super_admin' || allowedRoles.includes(asisten.role)) {
      return next();
    }

    return sendError(res, 'Anda tidak memiliki akses untuk melakukan aksi ini', 403);
  };
};