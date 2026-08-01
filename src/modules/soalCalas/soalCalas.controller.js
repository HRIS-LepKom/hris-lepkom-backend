import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import * as soalService from '../soal/soal.service.js';
import * as soalFileService from '../soal/soal.file.service.js';

export const getSoalCalas = asyncHandler(async (req, res) => {
  // Pass 'calas' as requesterRole so soalService forces isViewed = true
  const { data, meta } = await soalService.getAll(req.query, 'calas');
  sendSuccess(res, data, 'Data soal berhasil diambil', 200, meta);
});

export const downloadSoalCalas = asyncHandler(async (req, res) => {
  // Pass 'calas' as requesterRole so soalFileService forces isViewed = true check
  const { signedUrl } = await soalFileService.downloadFile(req.params.id, 'calas');
  sendSuccess(res, { url: signedUrl }, 'URL download berhasil didapatkan');
});
