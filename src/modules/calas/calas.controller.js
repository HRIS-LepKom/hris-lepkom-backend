import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import * as calasService from './calas.service.js';
import * as calasImport from './calas.import.js';
import * as calasTimeline from './calas.timeline.js';

// ─── Self ─────────────────────────────────────────────────────────────────────

export const getMe = asyncHandler(async (req, res) => {
  // Hanya calas yang login bisa mengakses (melalui calasAuth middleware)
  // Menampilkan data calas lengkap, tanpa password dll
  const calas = await calasService.getOne(req.calas._id);

  // Jika calas belum lulus, kita bisa sensor data penilaian di sisi client, 
  // namun jika dilarang keras, hapus key nilainya di sini.
  if (calas.statusRekrutmen?.hasil !== 'lolos') {
      // Hilangkan data nilai jika belum lolos. (Namun nilai aslinya di collection Penilaian, jadi ini aman jika calas tidak punya akses ke endpoint nilai)
  }

  sendSuccess(res, calas, 'Data profil berhasil diambil');
});

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export const create = asyncHandler(async (req, res) => {
  const gelombangAktif = req.recruitmentSetting?.gelombangAktif; // Didapat dari middleware (jika toggle aktif)
  const calas = await calasService.create(req.body, req.asisten._id, gelombangAktif);
  sendSuccess(res, calas, 'Calas berhasil ditambahkan', 201);
});

export const getAll = asyncHandler(async (req, res) => {
  const { data, meta } = await calasService.getAll(req.query);
  sendSuccess(res, data, 'Data calas berhasil diambil', 200, meta);
});

export const getOne = asyncHandler(async (req, res) => {
  const calas = await calasService.getOne(req.params.id);
  sendSuccess(res, calas, 'Detail calas berhasil diambil');
});

export const update = asyncHandler(async (req, res) => {
  const calas = await calasService.update(req.params.id, req.body);
  sendSuccess(res, calas, 'Data calas berhasil diperbarui');
});

export const hardDelete = asyncHandler(async (req, res) => {
  const result = await calasService.hardDelete(req.params.id, req.asisten._id, req.body.password);
  sendSuccess(res, result, 'Calas beserta datanya berhasil dihapus permanen');
});

export const ban = asyncHandler(async (req, res) => {
  const calas = await calasService.ban(req.params.id);
  sendSuccess(res, calas, 'Calas berhasil diblokir');
});

export const unban = asyncHandler(async (req, res) => {
  const calas = await calasService.unban(req.params.id);
  sendSuccess(res, calas, 'Blokir calas berhasil dibuka');
});

// ─── Timeline ─────────────────────────────────────────────────────────────────

export const updateTimeline = asyncHandler(async (req, res) => {
  const calas = await calasTimeline.updateTimeline(req.params.id, req.body);
  sendSuccess(res, calas, 'Progres rekrutmen calas berhasil diperbarui, notifikasi telah dikirim via email');
});

export const resetProses = asyncHandler(async (req, res) => {
  const calas = await calasTimeline.resetProses(req.params.id);
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
  const result = await calasImport.importFromFile(req.file, req.asisten._id, gelombangAktif);
  sendSuccess(res, result, `Import selesai: ${result.berhasil} berhasil, ${result.gagal.length} gagal`, 207);
});

export const downloadTemplate = asyncHandler(async (req, res) => {
  const buffer = calasImport.generateImportTemplate();
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="template-import-calas.csv"');
  res.send(buffer);
});
