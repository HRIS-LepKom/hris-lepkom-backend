import asyncHandler from '../../../utils/asyncHandler.js';
import { sendSuccess } from '../../../utils/apiResponse.js';
import * as jadwalKosongService from './jadwalKosong.service.js';
import * as entriService        from './jadwalKosongEntri.service.js';
import * as exportService       from './jadwalKosong.export.service.js';

// ─── Dashboard ────────────────────────────────────────────────────────────────

/**
 * POST /api/jadwal/kosong
 * Buat jadwal kosong baru + auto-populate semua asisten aktif.
 * Hanya super_admin.
 */
export const create = asyncHandler(async (req, res) => {
  const jadwal = await jadwalKosongService.create(req.body, req.asisten._id);
  sendSuccess(res, jadwal, 'Jadwal kosong berhasil dibuat', 201);
});

/**
 * GET /api/jadwal/kosong
 * List jadwal kosong dengan pagination, search, sort.
 * Semua asisten bisa akses.
 */
export const getAll = asyncHandler(async (req, res) => {
  const { data, meta } = await jadwalKosongService.getAll(req.query);
  sendSuccess(res, data, 'Daftar jadwal kosong berhasil diambil', 200, meta);
});

/**
 * PATCH /api/jadwal/kosong/:id
 * Update judul jadwal kosong.
 * Hanya super_admin.
 */
export const updateJudul = asyncHandler(async (req, res) => {
  const jadwal = await jadwalKosongService.updateJudul(req.params.id, req.body.judul);
  sendSuccess(res, jadwal, 'Judul jadwal kosong berhasil diperbarui');
});

/**
 * DELETE /api/jadwal/kosong/:id
 * Hapus jadwal kosong beserta seluruh entrinya.
 * Hanya super_admin.
 */
export const remove = asyncHandler(async (req, res) => {
  await jadwalKosongService.remove(req.params.id);
  sendSuccess(res, null, 'Jadwal kosong beserta seluruh entrinya berhasil dihapus');
});

// ─── Detail Jadwal Kosong ─────────────────────────────────────────────────────

/**
 * GET /api/jadwal/kosong/:id
 * Get header jadwal + list entri asisten (paginated, searchable, sortable).
 * Semua asisten bisa akses.
 */
export const getDetail = asyncHandler(async (req, res) => {
  const { data, jadwal, meta } = await jadwalKosongService.getEntris(req.params.id, req.query);
  sendSuccess(res, { jadwal, entris: data }, 'Detail jadwal kosong berhasil diambil', 200, meta);
});

/**
 * GET /api/jadwal/kosong/:id/asisten/:asistenId
 * Get entri spesifik satu asisten (untuk default value modal).
 * Semua asisten bisa melihat.
 */
export const getEntriAsisten = asyncHandler(async (req, res) => {
  const entri = await entriService.getEntriByAsisten(req.params.id, req.params.asistenId);
  sendSuccess(res, entri, 'Data entri asisten berhasil diambil');
});

// ─── Update Field Entri ───────────────────────────────────────────────────────

/**
 * PATCH /api/jadwal/kosong/:id/asisten/:asistenId/kursus
 * Update kursus lepkom yang pernah diikuti.
 * Hanya asisten yang bersangkutan.
 */
export const updateKursus = asyncHandler(async (req, res) => {
  const entri = await entriService.updateKursusLepkom(
    req.params.id,
    req.params.asistenId,
    req.asisten._id,
    req.body.kursusLepkom,
  );
  sendSuccess(res, entri, 'Kursus LEPKOM berhasil diperbarui');
});

/**
 * PATCH /api/jadwal/kosong/:id/asisten/:asistenId/jadwal
 * Update jadwal kosong asisten (hari + sesi).
 * Hanya asisten yang bersangkutan.
 */
export const updateJadwal = asyncHandler(async (req, res) => {
  const entri = await entriService.updateJadwalKosong(
    req.params.id,
    req.params.asistenId,
    req.asisten._id,
    req.body.jadwalKosong,
  );
  sendSuccess(res, entri, 'Jadwal kosong berhasil diperbarui');
});

/**
 * PATCH /api/jadwal/kosong/:id/asisten/:asistenId/jadwal-materi
 * Update jadwal & materi LEPKOM (khusus mahasiswa aktif).
 * Hanya asisten yang bersangkutan.
 */
export const updateJadwalMateri = asyncHandler(async (req, res) => {
  const entri = await entriService.updateJadwalMateriLepkom(
    req.params.id,
    req.params.asistenId,
    req.asisten._id,
    req.body.jadwalMateriLepkom,
  );
  sendSuccess(res, entri, 'Jadwal & Materi LEPKOM berhasil diperbarui');
});

// ─── Export ───────────────────────────────────────────────────────────────────

/**
 * GET /api/jadwal/kosong/:id/export
 * Export data jadwal kosong ke Excel.
 * Hanya super_admin.
 */
export const exportExcel = asyncHandler(async (req, res) => {
  const buffer = await exportService.generateExportExcel(req.params.id);
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="jadwal-kosong-${req.params.id}.xlsx"`
  );
  res.send(buffer);
});
