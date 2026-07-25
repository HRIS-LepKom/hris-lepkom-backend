import ExamSession from '../../../models/examSession.model.js';

export const create = async (data, dibuatOleh) => {
  const session = await ExamSession.create({ ...data, dibuatOleh });
  return session;
};

export const getAll = async (query) => {
  const filter = {};
  if (query.jenisUjian) filter.jenisUjian = query.jenisUjian;
  if (query.tanggal) {
    const start = new Date(query.tanggal);
    const end   = new Date(query.tanggal);
    end.setDate(end.getDate() + 1);
    filter.tanggal = { $gte: start, $lt: end };
  }
  return ExamSession.find(filter).populate('dibuatOleh', 'nama idAsisten').sort({ tanggal: -1 });
};

export const getOne = async (id) => {
  const session = await ExamSession.findById(id).populate('dibuatOleh', 'nama idAsisten');
  if (!session) {
    const err = new Error('Sesi ujian tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  return session;
};

export const update = async (id, data) => {
  const session = await ExamSession.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!session) {
    const err = new Error('Sesi ujian tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  return session;
};

export const remove = async (id) => {
  const session = await ExamSession.findByIdAndDelete(id);
  if (!session) {
    const err = new Error('Sesi ujian tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  return { deletedId: id };
};
