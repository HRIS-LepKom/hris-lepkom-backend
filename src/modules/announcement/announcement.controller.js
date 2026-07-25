import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import * as announcementService from './announcement.service.js';

export const create = asyncHandler(async (req, res) => {
  const result = await announcementService.create(req.body, req.asisten._id);
  sendSuccess(res, result, 'Pengumuman berhasil dibuat', 201);
});

export const getAll = asyncHandler(async (req, res) => {
  const { data, meta } = await announcementService.getAll(req.query);
  sendSuccess(res, data, 'Data pengumuman berhasil diambil', 200, meta);
});

export const getOne = asyncHandler(async (req, res) => {
  const result = await announcementService.getOne(req.params.id);
  sendSuccess(res, result, 'Detail pengumuman berhasil diambil');
});

export const update = asyncHandler(async (req, res) => {
  const result = await announcementService.update(req.params.id, req.body);
  sendSuccess(res, result, 'Pengumuman berhasil diperbarui');
});

export const remove = asyncHandler(async (req, res) => {
  const result = await announcementService.remove(req.params.id);
  sendSuccess(res, result, 'Pengumuman berhasil dihapus');
});

export const getFeedForCalas = asyncHandler(async (req, res) => {
  const { data, meta } = await announcementService.getFeedForCalas(req.calas._id, req.query);
  sendSuccess(res, data, 'Feed pengumuman berhasil diambil', 200, meta);
});
