import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import * as recruitmentService from './recruitment.service.js';

export const getAll = asyncHandler(async (req, res) => {
  const result = await recruitmentService.getAll(req.query);
  sendSuccess(res, result.data, 'Daftar gelombang rekrutmen berhasil diambil', 200, result.meta);
});

export const getOne = asyncHandler(async (req, res) => {
  const rec = await recruitmentService.getOne(req.params.id);
  sendSuccess(res, rec, 'Detail gelombang rekrutmen berhasil diambil');
});

export const create = asyncHandler(async (req, res) => {
  const rec = await recruitmentService.create(req.body, req.asisten._id);
  sendSuccess(res, rec, 'Gelombang rekrutmen berhasil dibuat dan diaktifkan', 201);
});

export const update = asyncHandler(async (req, res) => {
  const rec = await recruitmentService.update(req.params.id, req.body);
  sendSuccess(res, rec, 'Gelombang rekrutmen berhasil diperbarui');
});

export const activate = asyncHandler(async (req, res) => {
  const rec = await recruitmentService.activate(req.params.id, req.asisten._id);
  sendSuccess(res, rec, 'Gelombang rekrutmen berhasil diaktifkan');
});

export const deactivate = asyncHandler(async (req, res) => {
  const rec = await recruitmentService.deactivate(req.params.id, req.asisten._id);
  sendSuccess(res, rec, 'Gelombang rekrutmen berhasil dinonaktifkan');
});

export const hardDelete = asyncHandler(async (req, res) => {
  const result = await recruitmentService.hardDelete(req.params.id);
  sendSuccess(res, result, 'Gelombang rekrutmen berhasil dihapus');
});
