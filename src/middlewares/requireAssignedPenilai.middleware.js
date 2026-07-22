import { sendError } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import RoomPlacement from '../models/roomPlacement.model.js';

export const requireAssignedPenilai = asyncHandler(async (req, res, next) => {
  if (!req.asisten) {
    return sendError(res, 'Akun asisten tidak ditemukan pada request', 401);
  }

  const { calasRef, examSessionRef } = req.body;

  if (!calasRef || !examSessionRef) {
    return sendError(res, 'calasRef dan examSessionRef wajib diisi', 400);
  }

  const placement = await RoomPlacement.findOne({
    examSessionRef,
    calasList: calasRef,
    penilaiList: req.asisten._id,
  });

  if (!placement) {
    return sendError(
      res,
      'Anda tidak ter-assign untuk menilai calas ini pada sesi tersebut',
      403
    );
  }

  req.roomPlacement = placement;
  next();
});