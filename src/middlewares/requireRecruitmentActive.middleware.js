import asyncHandler from '../utils/asyncHandler.js';
import { sendError } from '../utils/apiResponse.js';
import Recruitment from '../models/recruitment.model.js';

export const requireRecruitmentActive = asyncHandler(async (req, res, next) => {
  const activeRecruitment = await Recruitment.findOne({ isActive: true });

  if (!activeRecruitment) {
    return sendError(
      res,
      'Fitur ini hanya bisa diakses saat periode rekrutmen sedang aktif',
      403
    );
  }

  req.recruitmentSetting = activeRecruitment;
  next();
});