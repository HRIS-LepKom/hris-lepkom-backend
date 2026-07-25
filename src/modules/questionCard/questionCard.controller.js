import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import * as qcService from './questionCard.service.js';

// ─── Read ─────────────────────────────────────────────────────────────────────

export const getAll = asyncHandler(async (req, res) => {
  const { data, meta } = await qcService.getAll(req.query);
  sendSuccess(res, data, 'Data question card berhasil diambil', 200, meta);
});

export const getOne = asyncHandler(async (req, res) => {
  const qc = await qcService.getOne(req.params.id);
  sendSuccess(res, qc, 'Detail question card berhasil diambil');
});

// ─── Write ────────────────────────────────────────────────────────────────────

export const create = asyncHandler(async (req, res) => {
  const qc = await qcService.create(req.body, req.asisten._id);
  sendSuccess(res, qc, 'Question card berhasil ditambahkan', 201);
});

export const update = asyncHandler(async (req, res) => {
  const qc = await qcService.update(req.params.id, req.body);
  sendSuccess(res, qc, 'Question card berhasil diperbarui');
});

export const hardDelete = asyncHandler(async (req, res) => {
  const result = await qcService.hardDelete(req.params.id);
  sendSuccess(res, result, 'Question card berhasil dihapus secara permanen');
});
