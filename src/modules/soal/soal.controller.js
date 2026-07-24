import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import * as soalService from './soal.service.js';
import * as soalFileService from './soal.file.service.js';

// ─── Read ─────────────────────────────────────────────────────────────────────

export const getAll = asyncHandler(async (req, res) => {
  const { data, meta } = await soalService.getAll(req.query, req.asisten?.role);
  sendSuccess(res, data, 'Data soal berhasil diambil', 200, meta);
});

export const getOne = asyncHandler(async (req, res) => {
  const soal = await soalService.getOne(req.params.id, req.asisten?.role);
  sendSuccess(res, soal, 'Detail soal berhasil diambil');
});

// ─── Write (metadata) ─────────────────────────────────────────────────────────

export const create = asyncHandler(async (req, res) => {
  const soal = await soalService.create(req.body, req.asisten._id);
  sendSuccess(res, soal, 'Soal berhasil ditambahkan. Silakan upload file melalui PATCH /api/soal/:id/file', 201);
});

export const update = asyncHandler(async (req, res) => {
  const soal = await soalService.update(req.params.id, req.body);
  sendSuccess(res, soal, 'Data soal berhasil diperbarui');
});

export const toggleView = asyncHandler(async (req, res) => {
  const soal = await soalService.toggleView(req.params.id);
  const msg  = soal.isViewed
    ? 'Soal berhasil dipublikasikan — kini dapat diakses oleh semua asisten dan calas'
    : 'Soal berhasil disembunyikan — hanya dapat diakses oleh pj_soal_materi dan super_admin';
  sendSuccess(res, soal, msg);
});

export const hardDelete = asyncHandler(async (req, res) => {
  const result = await soalService.hardDelete(req.params.id);
  sendSuccess(res, result, 'Soal beserta filenya berhasil dihapus secara permanen');
});

// ─── File Operations ──────────────────────────────────────────────────────────

export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    const err = new Error(
      'File tidak ditemukan pada request. ' +
      'Pastikan file dikirim dengan field name "file" dan format PDF atau DOCX (maks. 2 MB)'
    );
    err.statusCode = 400;
    throw err;
  }
  const soal = await soalFileService.uploadFile(req.params.id, req.file);
  sendSuccess(res, soal, 'File soal berhasil diupload');
});

export const deleteFile = asyncHandler(async (req, res) => {
  const result = await soalFileService.deleteFile(req.params.id);
  sendSuccess(res, result, result.pesan);
});

export const downloadFile = asyncHandler(async (req, res) => {
  const { signedUrl } = await soalFileService.downloadFile(req.params.id, req.asisten?.role);
  res.redirect(signedUrl);
});
