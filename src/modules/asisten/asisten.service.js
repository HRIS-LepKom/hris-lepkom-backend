import Asisten from '../../models/asisten.model.js';
import Calas from '../../models/calas.model.js';
import Recruitment from '../../models/recruitment.model.js';
import Materi from '../../models/materi.model.js';
import Soal from '../../models/soal.model.js';
import { ASISTEN_ROLES } from '../../models/asisten.model.js';
import { getDefaultPassword } from '../../utils/defaultPassword.js';
import { getPaginationParams, buildPaginationMeta } from '../../utils/paginate.js';
import { buildSmartFilter } from '../../utils/buildSmartFilter.js';

// ─── Private Helper ───────────────────────────────────────────────────────────

export const sanitizeAsisten = (a) => ({
  _id:                a._id,
  idAsisten:          a.idAsisten,
  npm:                a.npm,
  nama:               a.nama,
  email:              a.email,
  kelasSaatIni:       a.kelasSaatIni,
  role:               a.role,
  isActive:           a.isActive,
  wajibGantiPassword: a.wajibGantiPassword,
  calasRef:           a.calasRef,
  createdAt:          a.createdAt,
  updatedAt:          a.updatedAt,
});

const isRecruitmentActive = async () => {
  const activeRecruitment = await Recruitment.findOne({ isActive: true });
  return !!activeRecruitment;
};

const getAsistenHistory = async (asistenId, role) => {
  const history = {};
  
  if (role === 'pj_soal_materi' || role === 'super_admin') {
    history.historyUploadMateri = await Materi.find({ dibuatOleh: asistenId })
      .select('namaMateri tingkat pertemuan createdAt')
      .sort({ createdAt: -1 })
      .lean();
      
    history.historyUploadSoal = await Soal.find({ dibuatOleh: asistenId })
      .select('judulSoal jenisSoal createdAt')
      .sort({ createdAt: -1 })
      .lean();
  }

  if (role === 'asisten_penilai' || role === 'super_admin') {
    history.historyPenilaian = [];
  }

  return history;
};

// ─── Exports ─────────────────────────────────────────────────────────────────

export const create = async (data) => {
  const asisten = await Asisten.create({
    ...data,
    password:           getDefaultPassword(),
    wajibGantiPassword: true,
  });
  return sanitizeAsisten(asisten);
};

export const getAll = async (query) => {
  const { page, limit, skip } = getPaginationParams(query);
  const activeRecruitment = await isRecruitmentActive();

  const smartFilter = buildSmartFilter(query, {
    role: { type: 'string' },
  });

  const filter = { ...smartFilter };

  if (query.tingkat) {
    if (query.tingkat.toUpperCase() === 'NON CLASS') {
      filter.kelasSaatIni = { $regex: '^NON CLASS$', $options: 'i' };
    } else {
      filter.kelasSaatIni = { $regex: `^${query.tingkat}`, $options: 'i' };
    }
  } else if (query.kelasSaatIni) {
    filter.kelasSaatIni = query.kelasSaatIni;
  }

  if (query.search) {
    filter.$or = [
      { nama:      { $regex: query.search, $options: 'i' } },
      { idAsisten: { $regex: query.search, $options: 'i' } },
      { npm:       { $regex: query.search, $options: 'i' } },
    ];
  }

  const sortOptions = {};
  if (query.sortBy) {
    sortOptions[query.sortBy] = query.sortOrder === 'desc' ? -1 : 1;
  } else {
    sortOptions.nama = 1;
  }

  let selectFields = 'idAsisten npm nama kelasSaatIni';
  if (activeRecruitment) selectFields += ' role';

  const [data, total] = await Promise.all([
    Asisten.find(filter).select(selectFields).sort(sortOptions).skip(skip).limit(limit).lean(),
    Asisten.countDocuments(filter),
  ]);

  return { data, meta: buildPaginationMeta(total, page, limit) };
};

export const getOne = async (id) => {
  const asisten = await Asisten.findById(id).lean();
  if (!asisten) {
    const err = new Error('Asisten tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  const activeRecruitment = await isRecruitmentActive();
  
  if (!activeRecruitment) {
    return {
      _id: asisten._id,
      idAsisten: asisten.idAsisten,
      npm: asisten.npm,
      nama: asisten.nama,
      kelasSaatIni: asisten.kelasSaatIni,
      email: asisten.email
    };
  }

  const history = await getAsistenHistory(asisten._id, asisten.role);
  return {
    ...sanitizeAsisten(asisten),
    history
  };
};

export const getFilters = async () => {
  const kelasSaatIniList = await Asisten.distinct('kelasSaatIni', { kelasSaatIni: { $ne: null } });
  
  return {
    kelasSaatIni: kelasSaatIniList.sort(),
    roles: ASISTEN_ROLES
  };
};

export const update = async (id, data) => {
  const asisten = await Asisten.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!asisten) {
    const err = new Error('Asisten tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  return sanitizeAsisten(asisten);
};

export const updateMe = async (id, data) => {
  const asisten = await Asisten.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!asisten) {
    const err = new Error('Asisten tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  return sanitizeAsisten(asisten);
};

export const updateRole = async (id, role) => {
  const activeRecruitment = await isRecruitmentActive();
  
  if (!activeRecruitment) {
    const restrictedRoles = ['koordinator_lapangan', 'pj_soal_materi', 'penanggung_jawab_ruangan', 'asisten_penilai'];
    if (restrictedRoles.includes(role)) {
      const err = new Error(`Role '${role}' tidak dapat ditetapkan saat tidak ada gelombang rekrutmen aktif`);
      err.statusCode = 400;
      throw err;
    }
  }

  const asisten = await Asisten.findByIdAndUpdate(id, { role }, { new: true, runValidators: true });
  if (!asisten) {
    const err = new Error('Asisten tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  return sanitizeAsisten(asisten);
};

export const toggleActive = async (id, requesterId) => {
  const asisten = await Asisten.findById(id);
  if (!asisten) {
    const err = new Error('Asisten tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  if (asisten._id.toString() === requesterId.toString()) {
    const err = new Error('Anda tidak dapat menonaktifkan akun Anda sendiri');
    err.statusCode = 400;
    throw err;
  }
  asisten.isActive = !asisten.isActive;
  await asisten.save();
  return sanitizeAsisten(asisten);
};

export const hardDelete = async (id) => {
  const asisten = await Asisten.findByIdAndDelete(id);
  if (!asisten) {
    const err = new Error('Asisten tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  return { deletedId: id };
};

export const resetPassword = async (id) => {
  const asisten = await Asisten.findById(id).select('+password');
  if (!asisten) {
    const err = new Error('Asisten tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  asisten.password            = getDefaultPassword();
  asisten.wajibGantiPassword  = true;
  asisten.refreshToken        = null;
  await asisten.save();
  return { asistenId: asisten._id };
};

export const convertFromCalas = async (calasId, { idAsisten, kelasSaatIni }) => {
  const calas = await Calas.findById(calasId);
  if (!calas) {
    const err = new Error('Calas tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  if (calas.statusRekrutmen?.hasil !== 'lolos') {
    const err = new Error('Hanya calas dengan status hasil "lolos" yang dapat dikonversi');
    err.statusCode = 400;
    throw err;
  }

  const sudahDikonversi = await Asisten.exists({ calasRef: calas._id });
  if (sudahDikonversi) {
    const err = new Error('Calas ini sudah pernah dikonversi menjadi asisten');
    err.statusCode = 409;
    throw err;
  }

  const asisten = await Asisten.create({
    idAsisten,
    npm:                calas.npm,
    nama:               calas.namaCalas,
    email:              calas.emailCalas,
    kelasSaatIni:       kelasSaatIni ?? calas.kelas,
    password:           getDefaultPassword(),
    wajibGantiPassword: true,
    calasRef:           calas._id,
  });

  return sanitizeAsisten(asisten);
};
