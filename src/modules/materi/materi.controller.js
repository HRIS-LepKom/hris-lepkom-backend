import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import * as materiService from './materi.service.js';

export const create = asyncHandler(async (req, res) => {
  const materi = await materiService.create(req.body, req.asisten._id);
  sendSuccess(res, materi, 'Materi berhasil ditambahkan', 201);
});

export const getAll = asyncHandler(async (req, res) => {
  const { data, meta } = await materiService.getAll(req.query);
  sendSuccess(res, data, 'Data materi berhasil diambil', 200, meta);
});

export const getAuthors = asyncHandler(async (req, res) => {
  const authors = await materiService.getAuthors();
  sendSuccess(res, authors, 'Daftar asisten pembuat materi berhasil diambil', 200);
});

export const getNames = asyncHandler(async (req, res) => {
  const names = await materiService.getNames(req.query);
  sendSuccess(res, names, 'Daftar nama materi berhasil diambil');
});

export const getOne = asyncHandler(async (req, res) => {
  const materi = await materiService.getOne(req.params.id);
  sendSuccess(res, materi, 'Detail materi berhasil diambil');
});

export const update = asyncHandler(async (req, res) => {
  const materi = await materiService.update(req.params.id, req.body);
  sendSuccess(res, materi, 'Data materi berhasil diperbarui');
});

export const hardDelete = asyncHandler(async (req, res) => {
  const result = await materiService.hardDelete(req.params.id);
  sendSuccess(res, result, 'Materi beserta soal terkait berhasil dihapus permanen');
});
