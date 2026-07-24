import asyncHandler from '../../../utils/asyncHandler.js';
import { sendSuccess } from '../../../utils/apiResponse.js';
import { setRefreshCookie, clearRefreshCookie, getAllCookieValues } from '../../../utils/authHelpers.js';
import * as calasAuthService from './calasAuth.service.js';

const COOKIE_CALAS_NAME = 'lepkom_calas_refresh';

// ─── Controllers ─────────────────────────────────────────────────────────────

export const login = asyncHandler(async (req, res) => {
  const { accessToken, rawRefreshToken, calas } = await calasAuthService.login(req.body);
  setRefreshCookie(res, rawRefreshToken, req, COOKIE_CALAS_NAME);
  sendSuccess(res, { accessToken, calas }, 'Login berhasil');
});

export const refresh = asyncHandler(async (req, res) => {
  const candidates = getAllCookieValues(req, COOKIE_CALAS_NAME);
  const { accessToken, rawRefreshToken, calas } = await calasAuthService.refreshAccessToken(candidates);
  setRefreshCookie(res, rawRefreshToken, req, COOKIE_CALAS_NAME);
  sendSuccess(res, { accessToken, calas }, 'Token berhasil diperbarui');
});

export const logout = asyncHandler(async (req, res) => {
  await calasAuthService.logout(getAllCookieValues(req, COOKIE_CALAS_NAME));
  clearRefreshCookie(res, req, COOKIE_CALAS_NAME);
  sendSuccess(res, null, 'Logout berhasil');
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await calasAuthService.forgotPassword(req.body);
  sendSuccess(
    res,
    null,
    'Jika akun Anda terdaftar, link reset password telah dikirim ke email Anda'
  );
});

export const resetPassword = asyncHandler(async (req, res) => {
  await calasAuthService.resetPassword({
    token:       req.params.token,
    newPassword: req.body.newPassword,
  });
  sendSuccess(res, null, 'Password berhasil direset, silakan login dengan password baru Anda');
});

export const changePassword = asyncHandler(async (req, res) => {
  const result = await calasAuthService.changePassword({
    calasId:     req.calas._id,
    newPassword: req.body.newPassword,
  });
  clearRefreshCookie(res, req, COOKIE_CALAS_NAME);
  sendSuccess(res, result, 'Password berhasil diubah, silakan login kembali');
});
