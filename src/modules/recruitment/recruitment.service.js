import Recruitment from '../../models/recruitment.model.js';
import { getPaginationParams, buildPaginationMeta } from '../../utils/paginate.js';
import { buildSmartFilter } from '../../utils/buildSmartFilter.js';

export const getAll = async (query) => {
  const { page, limit, skip } = getPaginationParams(query);

  const smartFilter = buildSmartFilter(query, {
    dibuatOleh: { type: 'string' },
    diaktifkanOleh: { type: 'string' },
    isActive: { type: 'boolean' }
  });
  
  const filter = { ...smartFilter };

  if (query.search) {
    filter.gelombangAktif = { $regex: query.search, $options: 'i' };
  }

  const ALLOWED_SORT_FIELDS = ['gelombangAktif', 'isActive', 'createdAt'];
  const sortField = ALLOWED_SORT_FIELDS.includes(query.sortBy) ? query.sortBy : 'createdAt';
  const sortDir = query.sortOrder === 'asc' ? 1 : -1;

  const [data, total] = await Promise.all([
    Recruitment.find(filter)
      .populate('dibuatOleh', 'nama idAsisten')
      .populate('diaktifkanOleh', 'nama idAsisten')
      .populate('dinonaktifkanOleh', 'nama idAsisten')
      .sort({ [sortField]: sortDir })
      .skip(skip)
      .limit(limit)
      .lean(),
    Recruitment.countDocuments(filter),
  ]);

  return { data, meta: buildPaginationMeta(total, page, limit) };
};

export const getOne = async (id) => {
  const rec = await Recruitment.findById(id)
    .populate('dibuatOleh', 'nama idAsisten')
    .populate('diaktifkanOleh', 'nama idAsisten')
    .populate('dinonaktifkanOleh', 'nama idAsisten')
    .lean();

  if (!rec) {
    const err = new Error('Gelombang rekrutmen tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  return rec;
};

export const create = async (data, asistenId) => {
  // Check if there is already an active recruitment wave
  const activeWave = await Recruitment.findOne({ isActive: true });
  if (activeWave) {
    const err = new Error(`Tidak dapat menambahkan gelombang baru karena gelombang "${activeWave.gelombangAktif}" sedang aktif. Silakan nonaktifkan terlebih dahulu.`);
    err.statusCode = 409;
    throw err;
  }

  try {
    const rec = await Recruitment.create({
      ...data,
      isActive: true, // as requested, default is active
      dibuatOleh: asistenId,
      diaktifkanOleh: asistenId,
      diaktifkanPada: new Date(),
    });
    return await rec.populate('dibuatOleh', 'nama idAsisten');
  } catch (error) {
    if (error.code === 11000) {
      const err = new Error('Nama gelombang tersebut sudah ada');
      err.statusCode = 409;
      throw err;
    }
    throw error;
  }
};

export const update = async (id, data) => {
  try {
    const rec = await Recruitment.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate('dibuatOleh', 'nama idAsisten');

    if (!rec) {
      const err = new Error('Gelombang rekrutmen tidak ditemukan');
      err.statusCode = 404;
      throw err;
    }
    return rec;
  } catch (error) {
    if (error.code === 11000) {
      const err = new Error('Nama gelombang tersebut sudah ada');
      err.statusCode = 409;
      throw err;
    }
    throw error;
  }
};

export const activate = async (id, asistenId) => {
  const rec = await Recruitment.findById(id);
  if (!rec) {
    const err = new Error('Gelombang rekrutmen tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  if (rec.isActive) {
    const err = new Error('Gelombang rekrutmen ini sudah aktif');
    err.statusCode = 409;
    throw err;
  }

  const activeWave = await Recruitment.findOne({ isActive: true });
  if (activeWave) {
    const err = new Error(`Tidak dapat mengaktifkan karena gelombang "${activeWave.gelombangAktif}" sedang aktif. Silakan nonaktifkan terlebih dahulu.`);
    err.statusCode = 409;
    throw err;
  }

  rec.isActive = true;
  rec.diaktifkanOleh = asistenId;
  rec.diaktifkanPada = new Date();
  await rec.save();

  return await rec.populate('diaktifkanOleh', 'nama idAsisten');
};

export const deactivate = async (id, asistenId) => {
  const rec = await Recruitment.findById(id);
  if (!rec) {
    const err = new Error('Gelombang rekrutmen tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  if (!rec.isActive) {
    const err = new Error('Gelombang rekrutmen ini sudah nonaktif');
    err.statusCode = 409;
    throw err;
  }

  rec.isActive = false;
  rec.dinonaktifkanOleh = asistenId;
  rec.dinonaktifkanPada = new Date();
  await rec.save();

  return await rec.populate('dinonaktifkanOleh', 'nama idAsisten');
};

export const hardDelete = async (id) => {
  const rec = await Recruitment.findById(id);
  if (!rec) {
    const err = new Error('Gelombang rekrutmen tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  if (rec.isActive) {
    const err = new Error('Tidak dapat menghapus gelombang rekrutmen yang sedang aktif. Silakan nonaktifkan terlebih dahulu.');
    err.statusCode = 409; // Conflict
    throw err;
  }

  await Recruitment.findByIdAndDelete(id);
  return { deletedId: id };
};

