import { verifyToken } from '../utils/jwtHelper.js';
import { sendError } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import Asisten from '../models/asisten.model.js';
import Calas from '../models/calas.model.js';

const createAuthMiddleware = ({ Model, reqKey, statusCheck }) =>
  asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Token tidak ditemukan', 401);
    }

    const token = authHeader.split(' ')[1];
    const { valid, decoded, errorName } = verifyToken(token);

    if (!valid) {
      const message = errorName === 'TokenExpiredError'
        ? 'Access token sudah expired, silakan refresh token'
        : 'Token tidak valid atau telah dirusak';
      return sendError(res, message, 401);
    }

    const user = await Model.findById(decoded.id).select('-password');

    if (!user) {
      return sendError(res, 'Akun tidak ditemukan', 401);
    }

    if (statusCheck && !statusCheck.isAllowed(user)) {
      return sendError(res, statusCheck.message, 403);
    }

    req[reqKey] = user;
    next();
  });

export const asistenAuth = createAuthMiddleware({
  Model: Asisten,
  reqKey: 'asisten',
  statusCheck: {
    isAllowed: (asisten) => asisten.isActive,
    message: 'Akun tidak aktif',
  },
});

export const calasAuth = createAuthMiddleware({
  Model: Calas,
  reqKey: 'calas',
  statusCheck: {
    isAllowed: (calas) => !calas.isBanned,
    message: 'Akun Anda telah diblokir',
  },
});