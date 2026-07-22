import asyncHandler from '../utils/asyncHandler.js';
import { sendError } from '../utils/apiResponse.js';
import RecruitmentSetting from '../models/recruitmentSetting.model.js';

export const requireRecruitmentActive = asyncHandler(async (req, res, next) => {
  const setting = await RecruitmentSetting.findOne();

  if (!setting?.isActive) {
    return sendError(
      res,
      'Fitur ini hanya bisa diakses saat periode rekrutmen sedang aktif',
      403
    );
  }

  req.recruitmentSetting = setting;
  next();
});