import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import * as recruitmentService from './recruitment.service.js';

// ─── Controllers ─────────────────────────────────────────────────────────────

export const getStatus = asyncHandler(async (req, res) => {
  const setting = await recruitmentService.getStatus();
  sendSuccess(res, setting, 'Status rekrutmen berhasil diambil');
});

export const activate = asyncHandler(async (req, res) => {
  const setting = await recruitmentService.activate({
    activatedBy:   req.asisten._id,
    gelombangAktif: req.body.gelombangAktif,
  });
  sendSuccess(res, setting, 'Periode rekrutmen berhasil diaktifkan');
});

export const deactivate = asyncHandler(async (req, res) => {
  const setting = await recruitmentService.deactivate({
    deactivatedBy: req.asisten._id,
  });
  sendSuccess(res, setting, 'Periode rekrutmen berhasil dinonaktifkan');
});
