import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import * as dashboardService from './dashboard.service.js';

export const getAdminStats = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getAdminStats(req.query);
  sendSuccess(res, stats, 'Statistik dashboard berhasil diambil');
});

export const getKoordinatorStats = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getKoordinatorStats(req.query);
  sendSuccess(res, stats, 'Statistik koordinator berhasil diambil');
});

export const getPenilaiStats = asyncHandler(async (req, res) => {
  // Use asisten id from auth middleware
  const asistenId = req.asisten._id;
  const stats = await dashboardService.getPenilaiStats(asistenId);
  sendSuccess(res, stats, 'Statistik penilai berhasil diambil');
});

export const getCalasStats = asyncHandler(async (req, res) => {
  const calasId = req.calas._id;
  const stats = await dashboardService.getCalasStats(calasId);
  sendSuccess(res, stats, 'Statistik calas berhasil diambil');
});
