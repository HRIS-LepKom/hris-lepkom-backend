import asyncHandler from '../../../utils/asyncHandler.js';
import { sendSuccess } from '../../../utils/apiResponse.js';
import * as jawabanService from './jawaban.service.js';

const handleUpload = (jenisUjian) => asyncHandler(async (req, res) => {
  if (!req.file) {
    const err = new Error('File jawaban tidak ditemukan. Kirim file dengan field name "file" (PDF, maks 10MB).');
    err.statusCode = 400;
    throw err;
  }
  const calas = await jawabanService.uploadJawaban(req.calas._id, jenisUjian, req.file);
  sendSuccess(res, calas, `Jawaban ${jenisUjian} berhasil diupload`);
});

const handleDelete = (jenisUjian) => asyncHandler(async (req, res) => {
  const calas = await jawabanService.deleteJawaban(req.calas._id, jenisUjian);
  sendSuccess(res, calas, `Jawaban ${jenisUjian} berhasil dihapus`);
});

export const uploadJawabanPraktek = handleUpload('praktek');
export const deleteJawabanPraktek = handleDelete('praktek');

export const uploadJawabanProject = handleUpload('project');
export const deleteJawabanProject = handleDelete('project');
