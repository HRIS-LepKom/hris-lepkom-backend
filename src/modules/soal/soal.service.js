import Soal from '../../models/soal.model.js';
import { getPaginationParams, buildPaginationMeta } from '../../utils/paginate.js';
import { deleteFromSupabase } from '../../utils/uploadHelper.js';

const PJ_ROLES = ['super_admin', 'pj_soal_materi'];

export const getAll = async (query, requesterRole) => {
  const { page, limit, skip } = getPaginationParams(query);
  const isPjOrAdmin = PJ_ROLES.includes(requesterRole);

  const filter = {};

  if (!isPjOrAdmin) {
    filter.isViewed = true;
  } else if (query.isViewed !== undefined) {
    filter.isViewed = query.isViewed === 'true';
  }

  if (query.materiRef)   filter.materiRef  = query.materiRef;
  if (query.tingkat)     filter.tingkat    = Number(query.tingkat);
  if (query.dibuatOleh)  filter.dibuatOleh = query.dibuatOleh;
  if (query.search) {
    filter.judulSoal = { $regex: query.search, $options: 'i' };
  }

  const ALLOWED_SORT_FIELDS = ['judulSoal', 'tingkat', 'createdAt'];
  const sortField  = ALLOWED_SORT_FIELDS.includes(query.sortBy) ? query.sortBy : 'judulSoal';
  const sortDir    = query.sortOrder === 'desc' ? -1 : 1;

  const [data, total] = await Promise.all([
    Soal.find(filter)
      .populate('materiRef',  'namaMateri tingkat')
      .populate('dibuatOleh', 'nama idAsisten')
      .sort({ [sortField]: sortDir })
      .skip(skip)
      .limit(limit)
      .lean(),
    Soal.countDocuments(filter),
  ]);

  return { data, meta: buildPaginationMeta(total, page, limit) };
};

export const getOne = async (id, requesterRole) => {
  const soal = await Soal.findById(id)
    .populate('materiRef',  'namaMateri tingkat')
    .populate('dibuatOleh', 'nama idAsisten')
    .lean();

  if (!soal) {
    const err = new Error('Soal tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  const isPjOrAdmin = PJ_ROLES.includes(requesterRole);
  if (!soal.isViewed && !isPjOrAdmin) {
    const err = new Error('Soal ini belum dipublikasikan dan tidak dapat diakses');
    err.statusCode = 403;
    throw err;
  }

  return soal;
};

export const create = async (data, asistenId) => {
  try {
    const soal = await Soal.create({ ...data, dibuatOleh: asistenId });
    return await soal.populate([
      { path: 'materiRef',  select: 'namaMateri tingkat' },
      { path: 'dibuatOleh', select: 'nama idAsisten' },
    ]);
  } catch (error) {
    if (error.code === 11000) {
      const err = new Error('Soal dengan judul tersebut sudah ada pada materi yang sama');
      err.statusCode = 409;
      throw err;
    }
    throw error;
  }
};

export const update = async (id, data) => {
  try {
    const soal = await Soal.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate('materiRef',  'namaMateri tingkat')
      .populate('dibuatOleh', 'nama idAsisten');

    if (!soal) {
      const err = new Error('Soal tidak ditemukan');
      err.statusCode = 404;
      throw err;
    }
    return soal;
  } catch (error) {
    if (error.code === 11000) {
      const err = new Error('Soal dengan judul tersebut sudah ada pada materi yang sama');
      err.statusCode = 409;
      throw err;
    }
    throw error;
  }
};

export const toggleView = async (id) => {
  const soal = await Soal.findById(id);
  if (!soal) {
    const err = new Error('Soal tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  soal.isViewed = !soal.isViewed;
  await soal.save();
  return soal;
};

export const hardDelete = async (id) => {
  const soal = await Soal.findById(id);
  if (!soal) {
    const err = new Error('Soal tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  if (soal.file) {
    await deleteFromSupabase(soal.file);
  }

  await Soal.findByIdAndDelete(id);
  return { deletedId: id };
};
