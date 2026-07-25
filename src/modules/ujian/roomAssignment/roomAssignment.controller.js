import asyncHandler from '../../../utils/asyncHandler.js';
import { sendSuccess } from '../../../utils/apiResponse.js';
import * as service from './roomAssignment.service.js';

export const create = asyncHandler(async (req, res) => {
  const assignment = await service.create(req.body, req.asisten._id);
  sendSuccess(res, assignment, 'PJ Ruangan berhasil di-assign', 201);
});

export const getAll = asyncHandler(async (req, res) => {
  const assignments = await service.getAll(req.query);
  sendSuccess(res, assignments, 'Data room assignment berhasil diambil');
});

export const getOne = asyncHandler(async (req, res) => {
  const assignment = await service.getOne(req.params.id);
  sendSuccess(res, assignment, 'Detail room assignment berhasil diambil');
});

export const update = asyncHandler(async (req, res) => {
  const assignment = await service.update(req.params.id, req.body);
  sendSuccess(res, assignment, 'PJ Ruangan berhasil diperbarui');
});

export const remove = asyncHandler(async (req, res) => {
  const result = await service.remove(req.params.id);
  sendSuccess(res, result, 'Room assignment berhasil dihapus');
});
