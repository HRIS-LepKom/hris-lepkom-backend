import asyncHandler from '../../../utils/asyncHandler.js';
import { sendSuccess } from '../../../utils/apiResponse.js';
import * as managementService  from './management.service.js';
import * as managementImport   from './management.import.js';
import * as managementExport   from './management.export.js';
import * as managementTimeline from './management.timeline.js';

// ─── Self (Calas Login) ───────────────────────────────────────────────────────

export const getMe = asyncHandler(async (req, res) => {
  const calas = await managementService.getOne(req.calas._id);

  const allowedStages = ['keputusan_akhir', 'selesai'];
  if (!allowedStages.includes(calas.statusRekrutmen?.tahapSaatIni)) {
    delete calas.riwayatPenilaian;
  }

  sendSuccess(res, calas, 'Data profil berhasil diambil');
});

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export const create = asyncHandler(async (req, res) => {
  const gelombangAktif = req.recruitmentSetting?.gelombangAktif;
  const calas = await managementService.create(req.body, req.asisten._id, gelombangAktif);
  sendSuccess(res, calas, 'Calas berhasil ditambahkan', 201);
});

export const getAll = asyncHandler(async (req, res) => {
  const { data, meta } = await managementService.getAll(req.query);
  sendSuccess(res, data, 'Data calas berhasil diambil', 200, meta);
});

export const getFilters = asyncHandler(async (req, res) => {
  const filters = await managementService.getFilters();
  sendSuccess(res, filters, 'Data filter berhasil diambil');
});

export const getOne = asyncHandler(async (req, res) => {
  const calas = await managementService.getOne(req.params.id);
  sendSuccess(res, calas, 'Detail calas berhasil diambil');
});

export const update = asyncHandler(async (req, res) => {
  const calas = await managementService.update(req.params.id, req.body);
  sendSuccess(res, calas, 'Data calas berhasil diperbarui');
});

export const hardDelete = asyncHandler(async (req, res) => {
  const result = await managementService.hardDelete(req.params.id, req.asisten._id, req.body.password);
  sendSuccess(res, result, 'Calas beserta datanya berhasil dihapus permanen');
});

export const ban = asyncHandler(async (req, res) => {
  const calas = await managementService.ban(req.params.id);
  sendSuccess(res, calas, 'Calas berhasil diblokir');
});

export const unban = asyncHandler(async (req, res) => {
  const calas = await managementService.unban(req.params.id);
  sendSuccess(res, calas, 'Blokir calas berhasil dibuka');
});

// ─── Timeline ─────────────────────────────────────────────────────────────────

export const updateTimeline = asyncHandler(async (req, res) => {
  const calas = await managementTimeline.updateTimeline(req.params.id, req.body);
  sendSuccess(res, calas, 'Progres rekrutmen calas berhasil diperbarui, notifikasi telah dikirim via email');
});

export const resetProses = asyncHandler(async (req, res) => {
  const calas = await managementTimeline.resetProses(req.params.id);
  sendSuccess(res, calas, 'Proses rekrutmen calas berhasil direset ke tahap awal');
});

// ─── Import ───────────────────────────────────────────────────────────────────

export const importFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    const err = new Error('File import tidak ditemukan');
    err.statusCode = 400;
    throw err;
  }
  const gelombangAktif = req.recruitmentSetting?.gelombangAktif;
  const result = await managementImport.importFromFile(req.file, req.asisten._id, gelombangAktif);
  sendSuccess(res, result, `Import selesai: ${result.berhasil} berhasil, ${result.gagal.length} gagal`, 207);
});

export const downloadTemplate = asyncHandler(async (req, res) => {
  const buffer = managementImport.generateImportTemplate();
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="template-import-calas.csv"');
  res.send(buffer);
});

export const exportToExcel = asyncHandler(async (req, res) => {
  const buffer = await managementExport.exportCalasToExcel(req.query);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="Data_Calas_Export.xlsx"');
  res.send(buffer);
});
