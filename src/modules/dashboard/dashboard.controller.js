import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import * as dashboardService from './dashboard.service.js';

export const getAdminStats = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getAdminStats(req.query);
  sendSuccess(res, stats, 'Statistik dashboard berhasil diambil');
});
