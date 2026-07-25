import Penilaian from '../../models/penilaian.model.js';
import RoomPlacement from '../../models/roomPlacement.model.js';
import ExamSession from '../../models/examSession.model.js';
import Calas from '../../models/calas.model.js';
import { getPaginationParams, buildPaginationMeta } from '../../utils/paginate.js';

const ensurePenilaiAndCalasInSameRoom = async (examSessionId, asistenId, calasId) => {
  const session = await ExamSession.findById(examSessionId);
  if (!session) {
    const err = new Error('Sesi ujian tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  const placement = await RoomPlacement.findOne({
    examSessionRef: examSessionId,
    penilaiList: asistenId,
    calasList: calasId,
  });

  if (!placement) {
    const err = new Error('Anda tidak memiliki akses untuk menilai calas ini, atau calas tidak berada di ruangan yang sama dengan Anda pada sesi ini.');
    err.statusCode = 403;
    throw err;
  }

  return session.jenisUjian; 
};

export const submitPenilaian = async (asistenId, data) => {
  const { calasId, examSessionId, deskripsi, kriteria } = data;

  const calas = await Calas.findById(calasId);
  if (!calas) {
    const err = new Error('Calas tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  const expectedJenisUjian = await ensurePenilaiAndCalasInSameRoom(examSessionId, asistenId, calasId);

  const existingScore = await Penilaian.findOne({
    calasRef: calasId,
    penilaiRef: asistenId,
    jenisUjian: expectedJenisUjian,
  });

  if (existingScore) {
    const err = new Error(`Anda sudah memberikan nilai untuk calas ini pada ujian ${expectedJenisUjian}. Nilai yang sudah disubmit tidak dapat diubah.`);
    err.statusCode = 409;
    throw err;
  }

  const penilaian = await Penilaian.create({
    calasRef: calasId,
    penilaiRef: asistenId,
    examSessionRef: examSessionId,
    jenisUjian: expectedJenisUjian,
    kriteria,
    deskripsi,
  });

  return penilaian.populate([
    { path: 'calasRef', select: 'namaCalas idCalas npm' },
    { path: 'examSessionRef', select: 'tanggal jenisUjian' }
  ]);
};

export const getMyHistory = async (asistenId, query) => {
  const { page, limit, skip } = getPaginationParams(query);

  const filter = { penilaiRef: asistenId };
  if (query.jenisUjian) filter.jenisUjian = query.jenisUjian;

  const [data, total] = await Promise.all([
    Penilaian.find(filter)
      .populate('calasRef', 'namaCalas idCalas npm kelas jurusan')
      .populate('examSessionRef', 'tanggal jenisUjian')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Penilaian.countDocuments(filter)
  ]);

  return {
    data,
    meta: buildPaginationMeta(total, page, limit),
  };
};
