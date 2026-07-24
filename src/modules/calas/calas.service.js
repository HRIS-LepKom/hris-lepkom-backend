import mongoose from 'mongoose';
import Calas from '../../models/calas.model.js';
import Asisten from '../../models/asisten.model.js';
import Penilaian from '../../models/penilaian.model.js';
import RoomPlacement from '../../models/roomPlacement.model.js';
import { getDefaultPassword } from '../../utils/defaultPassword.js';
import { getPaginationParams, buildPaginationMeta } from '../../utils/paginate.js';
import { deleteFromSupabase } from '../../utils/uploadHelper.js';

export const sanitizeCalas = (calas) => ({
  _id:                calas._id,
  idCalas:            calas.idCalas,
  npm:                calas.npm,
  namaCalas:          calas.namaCalas,
  emailCalas:         calas.emailCalas,
  kelas:              calas.kelas,
  gelombangDaftar:    calas.gelombangDaftar,
  statusRekrutmen:    calas.statusRekrutmen,
  isBanned:           calas.isBanned,
  daftarVia:          calas.daftarVia,
  didaftarkanOleh:    calas.didaftarkanOleh,
  createdAt:          calas.createdAt,
  updatedAt:          calas.updatedAt,
});

export const create = async (data, asistenId, gelombangAktif) => {
  const calas = await Calas.create({
    ...data,
    password:           getDefaultPassword(),
    wajibGantiPassword: true,
    daftarVia:          'asisten',
    didaftarkanOleh:    asistenId,
    gelombangDaftar:    data.gelombangDaftar || gelombangAktif || null,
  });
  return sanitizeCalas(calas);
};

export const getAll = async (query) => {
  const { page, limit, skip } = getPaginationParams(query);

  const filter = {};
  if (query.tahapSaatIni) filter['statusRekrutmen.tahapSaatIni'] = query.tahapSaatIni;
  if (query.hasil) filter['statusRekrutmen.hasil'] = query.hasil;
  if (query.isBanned !== undefined) filter.isBanned = query.isBanned === 'true';
  if (query.search) {
    filter.$or = [
      { namaCalas: { $regex: query.search, $options: 'i' } },
      { idCalas:   { $regex: query.search, $options: 'i' } },
    ];
  }

  const [data, total] = await Promise.all([
    Calas.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Calas.countDocuments(filter),
  ]);

  return {
    data: data.map(sanitizeCalas),
    meta: buildPaginationMeta(total, page, limit),
  };
};

export const getOne = async (id) => {
  const calas = await Calas.findById(id).populate('didaftarkanOleh', 'nama idAsisten');
  if (!calas) {
    const err = new Error('Calas tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  const result = calas.toObject();
  delete result.password;
  delete result.refreshToken;
  delete result.resetPasswordToken;
  return result;
};

export const update = async (id, data) => {
  const calas = await Calas.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!calas) {
    const err = new Error('Calas tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  return sanitizeCalas(calas);
};

export const ban = async (id) => {
  const calas = await Calas.findByIdAndUpdate(id, { isBanned: true }, { new: true });
  if (!calas) {
    const err = new Error('Calas tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  return sanitizeCalas(calas);
};

export const unban = async (id) => {
  const calas = await Calas.findByIdAndUpdate(id, { isBanned: false }, { new: true });
  if (!calas) {
    const err = new Error('Calas tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  return sanitizeCalas(calas);
};

export const hardDelete = async (id, asistenId, password) => {
  const asisten = await Asisten.findById(asistenId).select('+password');
  if (!asisten) {
    const err = new Error('Akun super admin tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  const isMatch = await asisten.comparePassword(password);
  if (!isMatch) {
    const err = new Error('Password super admin salah. Penghapusan dibatalkan.');
    err.statusCode = 401;
    throw err;
  }

  const calas = await Calas.findById(id);
  if (!calas) {
    const err = new Error('Calas tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    if (calas.cv) await deleteFromSupabase(calas.cv);
    if (calas.krs) await deleteFromSupabase(calas.krs);
    if (calas.rangkumanNilai) await deleteFromSupabase(calas.rangkumanNilai);

    await Penilaian.deleteMany({ calasRef: calas._id }).session(session);

    await RoomPlacement.updateMany(
      { calasList: calas._id },
      { $pull: { calasList: calas._id } }
    ).session(session);

    await Calas.findByIdAndDelete(calas._id).session(session);

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }

  return { deletedId: id };
};
