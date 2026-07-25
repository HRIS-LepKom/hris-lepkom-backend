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

export const uploadCv = handleUpload('cv');
export const deleteCv = handleDelete('cv');

export const uploadKrs = handleUpload('krs');
export const deleteKrs = handleDelete('krs');

export const uploadRangkumanNilai = handleUpload('rangkumanNilai');
export const deleteRangkumanNilai = handleDelete('rangkumanNilai');
