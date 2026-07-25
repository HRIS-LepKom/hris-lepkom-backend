import asyncHandler from '../../../utils/asyncHandler.js';
import { sendSuccess } from '../../../utils/apiResponse.js';
import * as service        from './roomPlacement.service.js';
import * as membersService from './roomPlacement.members.service.js';
import Asisten from '../../../models/asisten.model.js';

// ─── CRUD Dasar ───────────────────────────────────────────────────────────────

export const create = asyncHandler(async (req, res) => {
  const placement = await service.create(req.body, req.asisten._id);
  sendSuccess(res, placement, 'Room placement berhasil dibuat', 201);
});

export const getAll = asyncHandler(async (req, res) => {
  const placements = await service.getAll(req.query);
  sendSuccess(res, placements, 'Data room placement berhasil diambil');
});

export const getOne = asyncHandler(async (req, res) => {
  const placement = await service.getOne(req.params.id);
  sendSuccess(res, placement, 'Detail room placement berhasil diambil');
});

export const remove = asyncHandler(async (req, res) => {
  const result = await service.remove(req.params.id);
  sendSuccess(res, result, 'Room placement berhasil dihapus');
});

// ─── Calas Members ────────────────────────────────────────────────────────────

export const addCalas = asyncHandler(async (req, res) => {
  const placement = await service.getPlacementWithAccessCheck(req.params.id, req.asisten);
  await placement.populate('examSessionRef', 'jenisUjian tanggal');
  const result = await membersService.addCalas(placement, req.body.calasId);
  sendSuccess(res, result, 'Calas berhasil ditambahkan ke ruangan');
});

export const removeCalas = asyncHandler(async (req, res) => {
  const placement = await service.getPlacementWithAccessCheck(req.params.id, req.asisten);
  const result = await membersService.removeCalas(placement, req.params.calasId);
  sendSuccess(res, result, 'Calas berhasil dihapus dari ruangan');
});

// ─── Penilai Members ─────────────────────────────────────────────────────────

export const addPenilai = asyncHandler(async (req, res) => {
  const placement = await service.getPlacementWithAccessCheck(req.params.id, req.asisten);
  const asistenData = await Asisten.findById(req.body.asistenId).select('role nama idAsisten');
  if (!asistenData) {
    const err = new Error('Asisten penilai tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  const result = await membersService.addPenilai(placement, req.body.asistenId, asistenData);
  sendSuccess(res, result, 'Penilai berhasil ditambahkan ke ruangan');
});

export const removePenilai = asyncHandler(async (req, res) => {
  const placement = await service.getPlacementWithAccessCheck(req.params.id, req.asisten);
  const result = await membersService.removePenilai(placement, req.params.asistenId);
  sendSuccess(res, result, 'Penilai berhasil dihapus dari ruangan');
});

// ─── Upload Status ────────────────────────────────────────────────────────────

export const getUploadStatus = asyncHandler(async (req, res) => {
  const data = await service.getUploadStatus(req.params.id);
  sendSuccess(res, data, 'Status upload jawaban berhasil diambil');
});
