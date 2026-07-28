import asyncHandler from '../../../utils/asyncHandler.js';
import { sendSuccess } from '../../../utils/apiResponse.js';
import { setRefreshCookie, clearRefreshCookie, getAllCookieValues } from '../../../utils/authHelpers.js';
import * as asistenAuthService from './asistenAuth.service.js';

const COOKIE_ASISTEN_NAME = 'lepkom_asisten_refresh';

// ─── Controllers ─────────────────────────────────────────────────────────────

export const registerSuperAdmin = asyncHandler(async (req, res) => {
  const result = await asistenAuthService.registerSuperAdmin();
  sendSuccess(res, result, 'Super admin berhasil dibuat', 201);
});

export const login = asyncHandler(async (req, res) => {
  const { accessToken, rawRefreshToken, asisten } = await asistenAuthService.login(req.body);
  setRefreshCookie(res, rawRefreshToken, req, COOKIE_ASISTEN_NAME);
  sendSuccess(res, { accessToken, asisten }, 'Login berhasil');
});

export const refresh = asyncHandler(async (req, res) => {
  const candidates = getAllCookieValues(req, COOKIE_ASISTEN_NAME);
  const { accessToken, rawRefreshToken, asisten } = await asistenAuthService.refreshAccessToken(candidates);
  setRefreshCookie(res, rawRefreshToken, req, COOKIE_ASISTEN_NAME);
  sendSuccess(res, { accessToken, asisten }, 'Token berhasil diperbarui');
});

export const logout = asyncHandler(async (req, res) => {
  await asistenAuthService.logout(getAllCookieValues(req, COOKIE_ASISTEN_NAME));
  clearRefreshCookie(res, req, COOKIE_ASISTEN_NAME);
  sendSuccess(res, null, 'Logout berhasil');
});

export const requestHardReset = asyncHandler(async (req, res) => {
  const result = await asistenAuthService.requestHardReset(req.body);
  sendSuccess(res, result, 'Permintaan reset password berhasil dikirim ke super admin');
});

export const approveHardReset = asyncHandler(async (req, res) => {
  const result = await asistenAuthService.approveHardReset({
    requestId:  req.params.requestId,
    approvedBy: req.asisten._id,
  });
  sendSuccess(res, result, 'Permintaan hard reset berhasil disetujui');
});

export const rejectHardReset = asyncHandler(async (req, res) => {
  const result = await asistenAuthService.rejectHardReset({
    requestId:  req.params.requestId,
    rejectedBy: req.asisten._id,
  });
  sendSuccess(res, result, 'Permintaan hard reset berhasil ditolak');
});

export const changePassword = asyncHandler(async (req, res) => {
  const result = await asistenAuthService.changePassword({
    asistenId:   req.asisten._id,
    newPassword: req.body.newPassword,
  });
  sendSuccess(res, result, 'Password berhasil diubah');
});

export const getHardResetRequests = asyncHandler(async (req, res) => {
  const result = await asistenAuthService.getAllHardResetRequests(req.query);
  sendSuccess(res, result, 'Berhasil mendapatkan daftar request reset password');
});
