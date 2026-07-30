import mongoose from 'mongoose';
import Calas from '../../../models/calas.model.js';
import Asisten from '../../../models/asisten.model.js';
import Penilaian from '../../../models/penilaian.model.js';
import RoomPlacement from '../../../models/roomPlacement.model.js';
import { getDefaultPassword } from '../../../utils/defaultPassword.js';
import { getPaginationParams, buildPaginationMeta } from '../../../utils/paginate.js';
import { deleteFromSupabase } from '../../../utils/uploadHelper.js';

import { buildSmartFilter } from '../../../utils/buildSmartFilter.js';

export const sanitizeCalas = (calas) => ({
  _id:                calas._id,
  idCalas:            calas.idCalas,
  npm:                calas.npm,
  namaCalas:          calas.namaCalas,
  emailCalas:         calas.emailCalas,
  kelas:              calas.kelas,
  jurusan:            calas.jurusan,
  isKursusDelete:     calas.isKursusDelete,
  SemesterKursusDel:  calas.SemesterKursusDel,
  gelombangDaftar:    calas.gelombangDaftar,
  statusRekrutmen:    calas.statusRekrutmen,
  isBanned:           calas.isBanned,
  didaftarkanOleh:    calas.didaftarkanOleh,
  skorAkhirNilai:     calas.skorAkhirNilai || null,
  createdAt:          calas.createdAt,
  updatedAt:          calas.updatedAt,
});

export const create = async (data, asistenId, gelombangAktif) => {
  const calas = await Calas.create({
    ...data,
    password:           getDefaultPassword(),
    wajibGantiPassword: true,
    didaftarkanOleh:    asistenId,
    gelombangDaftar:    data.gelombangDaftar || gelombangAktif || null,
  });
  return sanitizeCalas(calas);
};

export const getAll = async (query) => {
  const { page, limit, skip } = getPaginationParams(query);

  const filterConfigs = {
    jurusan:           { type: 'string' },
    semesterKursusDel: { type: 'boolean' },
    kelas:             { type: 'string' },
  };

  const filter = buildSmartFilter(query, filterConfigs);
  
  if (query.tahapSaatIni) filter['statusRekrutmen.tahapSaatIni'] = query.tahapSaatIni;
  if (query.hasil) filter['statusRekrutmen.hasil'] = query.hasil;
  if (query.isBanned !== undefined) filter.isBanned = query.isBanned === 'true';
  if (query.search) {
    filter.$or = [
      { namaCalas:  { $regex: query.search, $options: 'i' } },
      { idCalas:    { $regex: query.search, $options: 'i' } },
      { npm:        { $regex: query.search, $options: 'i' } },
      { emailCalas: { $regex: query.search, $options: 'i' } },
    ];
  }

  const sort = {};
  if (query.sortField) {
    sort[query.sortField] = query.sortOrder === 'z-a' ? -1 : 1;
  } else {
    sort.createdAt = -1;
  }

  const pipeline = [
    { $match: filter },
    {
      $lookup: {
        from: 'penilaians',
        localField: '_id',
        foreignField: 'calasRef',
        as: 'riwayatPenilaian'
      }
    },
    {
      $addFields: {
        skorAkhirNilai: {
          $cond: {
            if: { $gt: [{ $size: "$riwayatPenilaian" }, 0] },
            then: { $avg: "$riwayatPenilaian.skorKeseluruhan" },
            else: null
          }
        }
      }
    },
    { $project: { riwayatPenilaian: 0, password: 0, refreshToken: 0, resetPasswordToken: 0 } },
    { $sort: sort }
  ];

  const dataPipeline = [...pipeline, { $skip: skip }, { $limit: limit }];

  const [data, totalArr] = await Promise.all([
    Calas.aggregate(dataPipeline),
    Calas.aggregate([...pipeline, { $count: 'total' }])
  ]);

  const total = totalArr.length > 0 ? totalArr[0].total : 0;

  return {
    data: data.map(sanitizeCalas),
    meta: buildPaginationMeta(total, page, limit),
  };
};

export const getOne = async (id) => {
  const calas = await Calas.findById(id).populate('didaftarkanOleh', 'nama idAsisten').lean();
  if (!calas) {
    const err = new Error('Calas tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  // Populate penilaian history for this calas
  const riwayatPenilaian = await Penilaian.find({ calasRef: calas._id })
    .populate('penilaiRef', 'nama idAsisten role')
    .populate('examSessionRef', 'tanggal jenisUjian')
    .sort({ createdAt: -1 });

  const result = calas.toObject();
  delete result.password;
  delete result.refreshToken;
  delete result.resetPasswordToken;

  result.riwayatPenilaian = riwayatPenilaian;

  return result;
};

export const getFilters = async () => {
  const [jurusan, semesterKursusDel, kelas] = await Promise.all([
    Calas.distinct('jurusan'),
    Calas.distinct('semesterKursusDel'),
    Calas.distinct('kelas'),
  ]);

  return { jurusan, semesterKursusDel, kelas };
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
