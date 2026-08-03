import asyncHandler from '../../../utils/asyncHandler.js';
import { sendSuccess } from '../../../utils/apiResponse.js';
import * as biodataService from './biodata.service.js';

export const updateBiodata = asyncHandler(async (req, res) => {
  const calas = await biodataService.updateBiodata(req.calas._id, req.body);
  sendSuccess(res, calas, 'Biodata berhasil diperbarui');
});

const handleUpload = (jenisDokumen) => asyncHandler(async (req, res) => {
  if (!req.file) {
    const err = new Error(`File dokumen ${jenisDokumen} tidak ditemukan. Pastikan field name adalah "file" dan max 2MB (PDF/DOCX).`);
    err.statusCode = 400;
    throw err;
  }
  const calas = await biodataService.uploadDokumen(req.calas._id, jenisDokumen, req.file);
  sendSuccess(res, calas, `Dokumen ${jenisDokumen} berhasil diupload`);
});

const handleDelete = (jenisDokumen) => asyncHandler(async (req, res) => {
  const calas = await biodataService.deleteDokumen(req.calas._id, jenisDokumen);
  sendSuccess(res, calas, `Dokumen ${jenisDokumen} berhasil dihapus`);
});

const handleDownload = (jenisDokumen) => asyncHandler(async (req, res) => {
  const result = await biodataService.downloadDokumen(req.calas._id, jenisDokumen);
  sendSuccess(res, result, `Link download dokumen ${jenisDokumen} berhasil dibuat`);
});

export const uploadTempFile = asyncHandler(async (req, res) => {
  const { jenisDokumen } = req.params;
  if (!req.file) {
    const err = new Error(`File dokumen ${jenisDokumen} tidak ditemukan. Pastikan field name adalah "file" dan max 2MB (PDF/DOCX).`);
    err.statusCode = 400;
    throw err;
  }
  const result = await biodataService.uploadTempDokumen(req.calas._id, jenisDokumen, req.file);
  sendSuccess(res, result, `Dokumen ${jenisDokumen} berhasil diupload ke temporary storage`);
});

export const deleteTempFile = asyncHandler(async (req, res) => {
  const { fileUrl } = req.body;
  if (!fileUrl) {
    const err = new Error('URL file tidak diberikan');
    err.statusCode = 400;
    throw err;
  }
  await biodataService.deleteTempDokumen(fileUrl);
  sendSuccess(res, null, 'File berhasil dihapus dari temporary storage');
});

export const uploadCv = handleUpload('cv');
export const deleteCv = handleDelete('cv');
export const downloadCv = handleDownload('cv');

export const uploadKrs = handleUpload('krs');
export const deleteKrs = handleDelete('krs');
export const downloadKrs = handleDownload('krs');

export const uploadRangkumanNilai = handleUpload('rangkumanNilai');
export const deleteRangkumanNilai = handleDelete('rangkumanNilai');
export const downloadRangkumanNilai = handleDownload('rangkumanNilai');
