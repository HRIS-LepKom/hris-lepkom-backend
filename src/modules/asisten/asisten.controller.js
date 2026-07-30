import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import * as asistenService from './asisten.service.js';
import * as asistenImport  from './asisten.import.js';
import * as asistenExport  from './asisten.export.js';

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export const create = asyncHandler(async (req, res) => {
  const asisten = await asistenService.create(req.body);
  sendSuccess(res, asisten, 'Asisten berhasil ditambahkan', 201);
});

export const getAll = asyncHandler(async (req, res) => {
  const { data, meta } = await asistenService.getAll(req.query);
  sendSuccess(res, data, 'Data asisten berhasil diambil', 200, meta);
});

export const getOne = asyncHandler(async (req, res) => {
  const asisten = await asistenService.getOne(req.params.id);
  sendSuccess(res, asisten, 'Detail asisten berhasil diambil');
});

export const getHistoryPenilaian = asyncHandler(async (req, res) => {
  const { data, meta } = await asistenService.getHistoryPenilaian(req.params.id, req.query);
  sendSuccess(res, data, 'Riwayat penilaian asisten berhasil diambil', 200, meta);
});

export const getMe = asyncHandler(async (req, res) => {
  const asisten = await asistenService.getOne(req.asisten._id);
  sendSuccess(res, asisten, 'Detail profil Anda berhasil diambil');
});

export const getFilters = asyncHandler(async (req, res) => {
  const filters = await asistenService.getFilters();
  sendSuccess(res, filters, 'Filter asisten berhasil diambil');
});

export const update = asyncHandler(async (req, res) => {
  const asisten = await asistenService.update(req.params.id, req.body);
  sendSuccess(res, asisten, 'Data asisten berhasil diperbarui');
});

export const updateMe = asyncHandler(async (req, res) => {
  const asisten = await asistenService.updateMe(req.asisten._id, req.body);
  sendSuccess(res, asisten, 'Profil Anda berhasil diperbarui');
});

export const hardDelete = asyncHandler(async (req, res) => {
  const result = await asistenService.hardDelete(req.params.id);
  sendSuccess(res, result, 'Asisten berhasil dihapus');
});

// ─── Role & Status ────────────────────────────────────────────────────────────

export const updateRole = asyncHandler(async (req, res) => {
  const asisten = await asistenService.updateRole(req.params.id, req.body.role);
  sendSuccess(res, asisten, 'Role asisten berhasil diperbarui');
});

export const toggleActive = asyncHandler(async (req, res) => {
  const asisten = await asistenService.toggleActive(req.params.id, req.asisten._id);
  const msg = asisten.isActive ? 'Akun asisten berhasil diaktifkan' : 'Akun asisten berhasil dinonaktifkan';
  sendSuccess(res, asisten, msg);
});

export const resetPassword = asyncHandler(async (req, res) => {
  const result = await asistenService.resetPassword(req.params.id);
  sendSuccess(res, result, 'Password asisten berhasil direset ke password default');
});

// ─── Konversi Calas ───────────────────────────────────────────────────────────

export const convertFromCalas = asyncHandler(async (req, res) => {
  const asisten = await asistenService.convertFromCalas(req.params.calasId, req.body);
  sendSuccess(res, asisten, 'Calas berhasil dikonversi menjadi asisten', 201);
});

// ─── Import ───────────────────────────────────────────────────────────────────

export const importFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    const err = new Error('File import tidak ditemukan');
    err.statusCode = 400;
    throw err;
  }
  const result = await asistenImport.importFromFile(req.file);
  const msg = result.gagal.length > 0
    ? `Import selesai: ${result.berhasil} data dimasukkan, ${result.gagal.length} data dilewati karena duplikat/tidak valid.`
    : `Import berhasil: ${result.berhasil} data dimasukkan.`;
  sendSuccess(res, result, msg, 207);
});

export const downloadTemplate = asyncHandler(async (req, res) => {
  const buffer = asistenImport.generateImportTemplate();
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="template-import-asisten.csv"');
  res.send(buffer);
});

// ─── Export ───────────────────────────────────────────────────────────────────

export const exportData = asyncHandler(async (req, res) => {
  const buffer = await asistenExport.generateExportExcel();
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="data_asisten.xlsx"');
  res.send(buffer);
});
