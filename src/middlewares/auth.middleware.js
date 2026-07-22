import { verifyToken }  from '../utils/jwtHelper.js';
import { sendError }    from '../utils/apiResponse.js';
import asyncHandler     from '../utils/asyncHandler.js';
import Asisten          from '../models/asisten.model.js';
import Calas            from '../models/calas.model.js'


export const asistenAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Token tidak ditemukan', 401);
  }

  const token                      = authHeader.split(' ')[1];
  const { valid, decoded, errorName } = verifyToken(token);

  if (!valid) {
    const message = errorName === 'TokenExpiredError'
      ? 'Access token sudah expired, silakan refresh token'
      : 'Token tidak valid atau telah dirusak';
    return sendError(res, message, 401);
  }

  const asisten = await Asisten.findById(decoded.id).select('-password');

  if (!asisten) {
    return sendError(res, 'Akun tidak ditemukan', 401);
  }

  req.asisten = asisten;
  next();
});

export const calasAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Token tidak ditemukan', 401);
  }

  const token                      = authHeader.split(' ')[1];
  const { valid, decoded, errorName } = verifyToken(token);

  if (!valid) {
    const message = errorName === 'TokenExpiredError'
      ? 'Access token sudah expired, silakan refresh token'
      : 'Token tidak valid atau telah dirusak';
    return sendError(res, message, 401);
  }

  const calas = await Calas.findById(decoded.id).select('-password');

  if (calas.isBanned) return sendError(res, 'Akun Anda telah diblokir', 403);
  
  if (!asisten.isActive) return sendError(res, 'Akun tidak aktif', 403);

  if (!calas) {
    return sendError(res, 'Akun tidak ditemukan', 401);
  }

  req.calas = calas;
  next();
});