import Asisten from '../../models/asisten.model.js';
import Calas from '../../models/calas.model.js';
import Recruitment from '../../models/recruitment.model.js';
import Materi from '../../models/materi.model.js';
import Soal from '../../models/soal.model.js';
import QuestionCard from '../../models/questionCard.model.js';
import RoomAssignment from '../../models/roomAssignment.model.js';
import RoomPlacement from '../../models/roomPlacement.model.js';
import Announcement from '../../models/announcement.model.js';
import Penilaian from '../../models/penilaian.model.js';
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

const getAsistenHistory = async (asistenId) => {
  const history = {};
  
  history.historyUploadMateri = await Materi.find({ dibuatOleh: asistenId })
    .select('namaMateri tingkat pertemuan createdAt')
    .sort({ createdAt: -1 })
    .lean();
    
  history.historyUploadSoal = await Soal.find({ dibuatOleh: asistenId })
    .select('judulSoal jenisSoal createdAt')
    .sort({ createdAt: -1 })
    .lean();

  history.historyUploadQuestionCard = await QuestionCard.find({ dibuatOleh: asistenId })
    .select('judul tingkat pertemuan createdAt')
    .sort({ createdAt: -1 })
    .lean();

  history.historyPjRuangan = await RoomAssignment.find({ pjRuanganRef: asistenId })
    .select('ruangan createdAt examSessionRef')
    .populate({ path: 'examSessionRef', select: 'sesi tanggal' })
    .sort({ createdAt: -1 })
    .lean();

  history.historyPenilaiRuangan = await RoomPlacement.find({ penilaiList: asistenId })
    .select('ruangan createdAt examSessionRef')
    .populate({ path: 'examSessionRef', select: 'sesi tanggal' })
    .sort({ createdAt: -1 })
    .lean();

  history.historyPengumuman = await Announcement.find({ dibuatOleh: asistenId })
    .select('judul createdAt')
    .sort({ createdAt: -1 })
    .lean();

  return history;
};

export const getHistoryPenilaian = async (asistenId, query) => {
  const { page, limit, skip } = getPaginationParams(query);
  
  const filter = { asistenPenilai: asistenId };

  const [data, total] = await Promise.all([
    Penilaian.find(filter)
      .populate({ path: 'calasRef', select: 'namaCalas npm' })
      .select('calasRef nilaiAkhir status createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Penilaian.countDocuments(filter),
  ]);

  return { data, meta: buildPaginationMeta(total, page, limit) };
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
    kelasSaatIni: { type: 'string' }
  });

  const filter = { ...smartFilter };

  if (query.isActive !== undefined) {
    let rawVal = query.isActive;
    
    // If it's a JSON string like '["true"]' or '["false"]', parse it
    try {
      if (typeof rawVal === 'string' && rawVal.startsWith('[')) {
        rawVal = JSON.parse(rawVal);
      }
    } catch (e) {}

    // Ensure it's an array for consistent processing
    const values = Array.isArray(rawVal) ? rawVal : [rawVal];
    const stringValues = values.map(v => String(v).toLowerCase());

    const hasTrue = stringValues.includes('true');
    const hasFalse = stringValues.includes('false');

    if (hasTrue && !hasFalse) {
      filter.isActive = { $ne: false };
    } else if (hasFalse && !hasTrue) {
      filter.isActive = false;
    }
  }

  if (query.kelasSaatIni) {
    if (query.kelasSaatIni.toUpperCase() === 'NON CLASS') {
      filter.kelasSaatIni = { $regex: '^NON CLASS$', $options: 'i' };
    } else {
      filter.kelasSaatIni = { $regex: `^${query.kelasSaatIni}`, $options: 'i' };
    }
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

  let selectFields = 'idAsisten npm nama kelasSaatIni role isActive';

  const [data, total] = await Promise.all([
    Asisten.find(filter).select(selectFields).sort(sortOptions).skip(skip).limit(limit).lean(),
    Asisten.countDocuments(filter),
  ]);

  // Default isActive for legacy documents that don't have it
  data.forEach(d => {
    if (d.isActive === undefined) d.isActive = true;
  });

  return { data, meta: buildPaginationMeta(total, page, limit) };
};

export const getOne = async (id) => {
  const asisten = await Asisten.findById(id).lean();
  if (!asisten) {
    const err = new Error('Asisten tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  const history = await getAsistenHistory(asisten._id);
  
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
