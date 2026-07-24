import mongoose from 'mongoose';
import Materi from '../../models/materi.model.js';
import Soal from '../../models/soal.model.js';
import Asisten from '../../models/asisten.model.js';
import { getPaginationParams, buildPaginationMeta } from '../../utils/paginate.js';
import { deleteFromSupabase } from '../../utils/uploadHelper.js';

export const create = async (data, asistenId) => {
  try {
    const materi = await Materi.create({
      ...data,
      dibuatOleh: asistenId,
    });
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

  const filter = {};
  if (query.tingkat) filter.tingkat = Number(query.tingkat);
  if (query.dibuatOleh) filter.dibuatOleh = query.dibuatOleh;
  if (query.search) {
    filter.namaMateri = { $regex: query.search, $options: 'i' };
  }

  // Smart global sort: pengurutan dilakukan di level DB terhadap seluruh data,
  // bukan hanya per halaman, sehingga A-Z benar-benar global dari awal hingga akhir.
  const ALLOWED_SORT_FIELDS = ['namaMateri', 'tingkat', 'pertemuan', 'createdAt'];
  const sortField = ALLOWED_SORT_FIELDS.includes(query.sortBy) ? query.sortBy : 'namaMateri';
  const sortDir   = query.sortOrder === 'desc' ? -1 : 1;
  const sortOptions = { [sortField]: sortDir };

  const [data, total] = await Promise.all([
    Materi.find(filter)
      .populate('dibuatOleh', 'nama idAsisten')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit),
    Materi.countDocuments(filter),
  ]);

  return {
    data,
    meta: buildPaginationMeta(total, page, limit),
  };
};

export const getOne = async (id) => {
  const materi = await Materi.findById(id).populate('dibuatOleh', 'nama idAsisten');
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
    // 1. Cari semua soal yang terhubung dengan materi ini
    const soalTerkait = await Soal.find({ materiRef: materi._id }).session(session);

    // 2. Hapus fisik file setiap soal dari Supabase
    // (Bisa memakan waktu, jadi kita lakukan dengan Promise.all di luar session db)
    const deleteFilePromises = soalTerkait.map(soal => deleteFromSupabase(soal.file));
    await Promise.all(deleteFilePromises);

    // 3. Hapus dokumen Soal terkait dari database
    await Soal.deleteMany({ materiRef: materi._id }).session(session);

    // 4. Hapus materi itu sendiri
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
  // Mencari distinct asisten yang pernah membuat materi
  const authorIds = await Materi.distinct('dibuatOleh');
  const authors = await Asisten.find({ _id: { $in: authorIds } }).select('nama idAsisten');
  return authors;
};
