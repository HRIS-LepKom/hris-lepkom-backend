import asyncHandler from '../../../utils/asyncHandler.js';
import { sendSuccess } from '../../../utils/apiResponse.js';
import * as jawabanService from './jawaban.service.js';

const handleUploadTemp = (jenisUjian) => asyncHandler(async (req, res) => {
  if (!req.file) {
    const err = new Error(`File jawaban tidak ditemukan. Kirim file dengan field name "file".`);
    err.statusCode = 400;
    throw err;
  }
  const result = await jawabanService.uploadTempJawaban(req.calas._id, jenisUjian, req.file);
  sendSuccess(res, result, `File jawaban sementara berhasil diupload`);
});

export const deleteTempJawaban = asyncHandler(async (req, res) => {
  const { fileUrl } = req.body;
  if (!fileUrl) {
    const err = new Error('URL file tidak diberikan');
    err.statusCode = 400;
    throw err;
  }
  await jawabanService.deleteTempJawaban(fileUrl);
  sendSuccess(res, null, 'File jawaban berhasil dihapus dari temporary storage');
});

const handleSave = (jenisUjian) => asyncHandler(async (req, res) => {
  const { fileUrl } = req.body;
  if (!fileUrl) {
    const err = new Error('URL file tidak diberikan');
    err.statusCode = 400;
    throw err;
  }
  const calas = await jawabanService.saveJawaban(req.calas._id, jenisUjian, fileUrl);
  sendSuccess(res, calas, `Jawaban ${jenisUjian} berhasil disimpan`);
});

const handleDelete = (jenisUjian) => asyncHandler(async (req, res) => {
  const calas = await jawabanService.deleteJawaban(req.calas._id, jenisUjian);
  sendSuccess(res, calas, `Jawaban ${jenisUjian} berhasil dihapus`);
});

const handleDownload = (jenisUjian) => asyncHandler(async (req, res) => {
  const { signedUrl } = await jawabanService.downloadJawaban(req.calas._id, jenisUjian);
  sendSuccess(res, { signedUrl }, `Link download jawaban ${jenisUjian} berhasil dibuat`);
});

export const uploadTempPraktek = handleUploadTemp('praktek');
export const saveJawabanPraktek = handleSave('praktek');
export const deleteJawabanPraktek = handleDelete('praktek');
export const downloadJawabanPraktek = handleDownload('praktek');

export const uploadTempProject = handleUploadTemp('project');
export const saveJawabanProject = handleSave('project');
export const deleteJawabanProject = handleDelete('project');
export const downloadJawabanProject = handleDownload('project');
