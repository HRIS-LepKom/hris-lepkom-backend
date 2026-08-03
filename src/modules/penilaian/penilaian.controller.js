import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import * as penilaianService from './penilaian.service.js';

export const submitPraktek = asyncHandler(async (req, res) => {
  const result = await penilaianService.submitPenilaian(req.asisten._id, req.body);
  sendSuccess(res, result, 'Nilai ujian praktek berhasil disimpan', 201);
});

export const submitProject = asyncHandler(async (req, res) => {
  const result = await penilaianService.submitPenilaian(req.asisten._id, req.body);
  sendSuccess(res, result, 'Nilai ujian project berhasil disimpan', 201);
});

export const getMyHistory = asyncHandler(async (req, res) => {
  const { data, meta } = await penilaianService.getMyHistory(req.asisten._id, req.query);
  sendSuccess(res, data, 'Riwayat penilaian berhasil diambil', 200, meta);
});

export const getAllHistory = asyncHandler(async (req, res) => {
  const { data, meta } = await penilaianService.getAllHistory(req.query);
  sendSuccess(res, data, 'Seluruh riwayat penilaian berhasil diambil', 200, meta);
});

export const getCalasToScore = asyncHandler(async (req, res) => {
  const data = await penilaianService.getCalasToScore(req.asisten._id, req.query);
  sendSuccess(res, data, 'Daftar calas yang harus dinilai berhasil diambil', 200);
});
