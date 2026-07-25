import asyncHandler from '../../../utils/asyncHandler.js';
import { sendSuccess } from '../../../utils/apiResponse.js';
import * as sessionService from './session.service.js';

export const create = asyncHandler(async (req, res) => {
  const session = await sessionService.create(req.body, req.asisten._id);
  sendSuccess(res, session, 'Sesi ujian berhasil dibuat', 201);
});

export const getAll = asyncHandler(async (req, res) => {
  const sessions = await sessionService.getAll(req.query);
  sendSuccess(res, sessions, 'Data sesi ujian berhasil diambil');
});

export const getOne = asyncHandler(async (req, res) => {
  const session = await sessionService.getOne(req.params.id);
  sendSuccess(res, session, 'Detail sesi ujian berhasil diambil');
});

export const update = asyncHandler(async (req, res) => {
  const session = await sessionService.update(req.params.id, req.body);
  sendSuccess(res, session, 'Sesi ujian berhasil diperbarui');
});

export const remove = asyncHandler(async (req, res) => {
  const result = await sessionService.remove(req.params.id);
  sendSuccess(res, result, 'Sesi ujian berhasil dihapus');
});
