import mongoose from 'mongoose';
import Materi from '../../models/materi.model.js';
import Soal from '../../models/soal.model.js';
import Asisten from '../../models/asisten.model.js';
import { getPaginationParams, buildPaginationMeta } from '../../utils/paginate.js';
import { buildSmartFilter } from '../../utils/buildSmartFilter.js';
import { deleteFromSupabase } from '../../utils/uploadHelper.js';

export const create = async (data, asistenId) => {
  try {
    const materi = await Materi.create({ ...data, dibuatOleh: asistenId });
    return await materi.populate('dibuatOleh', 'nama idAsisten');
  } catch (error) {
    if (error.code === 11000) {
      const err = new Error('Materi dengan nama dan tingkat tersebut sudah ada');
      err.statusCode = 409;
      throw err;
    }
    throw error;
  }
};

export const getAll = async (query) => {
  const { page, limit, skip } = getPaginationParams(query);

  // Filter pintar — mendukung comma-separated multi-value per field
  const smartFilter = buildSmartFilter(query, {
    tingkat:    { type: 'number' },
    dibuatOleh: { type: 'string' },
  });

  const filter = { ...smartFilter };
  
  // Global search
  if (query.search) {
    filter.namaMateri = { $regex: query.search, $options: 'i' };
  }
  
  // Specific column search
  if (query.namaMateri) {
    filter.namaMateri = { $regex: query.namaMateri, $options: 'i' };
  }

  // Smart global sort — pengurutan dilakukan di level DB terhadap seluruh data
  const ALLOWED_SORT_FIELDS = ['namaMateri', 'tingkat', 'pertemuan', 'createdAt'];
  const sortField = ALLOWED_SORT_FIELDS.includes(query.sortBy) ? query.sortBy : 'namaMateri';
  const sortDir   = query.sortOrder === 'desc' ? -1 : 1;

  const [data, total] = await Promise.all([
    Materi.find(filter)
      .populate('dibuatOleh', 'nama idAsisten')
      .sort({ [sortField]: sortDir })
      .skip(skip)
      .limit(limit)
      .lean(),
    Materi.countDocuments(filter),
  ]);

  return { data, meta: buildPaginationMeta(total, page, limit) };
};

// Endpoint khusus untuk dropdown/autocomplete namaMateri di frontend
export const getNames = async (query) => {
  const filter = {};
  if (query.search) {
    filter.namaMateri = { $regex: query.search, $options: 'i' };
  }
  return Materi.find(filter)
    .select('_id namaMateri tingkat')
    .sort({ tingkat: 1 })
    .lean();
};

export const getOne = async (id) => {
  const materi = await Materi.findById(id).populate('dibuatOleh', 'nama idAsisten').lean();
  if (!materi) {
    const err = new Error('Materi tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  return materi;
};

export const update = async (id, data) => {
  try {
    const materi = await Materi.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate('dibuatOleh', 'nama idAsisten');
    if (!materi) {
      const err = new Error('Materi tidak ditemukan');
      err.statusCode = 404;
      throw err;
    }
    return materi;
  } catch (error) {
    if (error.code === 11000) {
      const err = new Error('Materi dengan nama dan tingkat tersebut sudah ada');
      err.statusCode = 409;
      throw err;
    }
    throw error;
  }
};

// CASCADE DELETE ATOMIC
export const hardDelete = async (id) => {
  const materi = await Materi.findById(id);
  if (!materi) {
    const err = new Error('Materi tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const soalTerkait = await Soal.find({ materiRef: materi._id }).session(session);
    const deleteFilePromises = soalTerkait.map((soal) => deleteFromSupabase(soal.file));
    await Promise.all(deleteFilePromises);

    await Soal.deleteMany({ materiRef: materi._id }).session(session);
    await Materi.findByIdAndDelete(materi._id).session(session);
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }

  return { deletedId: id };
};

export const getAuthors = async () => {
  const authorIds = await Materi.distinct('dibuatOleh');
  return Asisten.find({ _id: { $in: authorIds } }).select('nama idAsisten');
};
