import Penilaian from '../../models/penilaian.model.js';
import RoomPlacement from '../../models/roomPlacement.model.js';
import ExamSession from '../../models/examSession.model.js';
import Calas from '../../models/calas.model.js';
import Asisten from '../../models/asisten.model.js';
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

  return { jenisUjian: session.jenisUjian, roomPlacementId: placement._id }; 
};

export const submitPenilaian = async (asistenId, data) => {
  const { calasId, examSessionId, deskripsi, kriteria } = data;

  const calas = await Calas.findById(calasId);
  if (!calas) {
    const err = new Error('Calas tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  const { jenisUjian: expectedJenisUjian, roomPlacementId } = await ensurePenilaiAndCalasInSameRoom(examSessionId, asistenId, calasId);

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
    roomPlacementRef: roomPlacementId,
    jenisUjian: expectedJenisUjian,
    kriteria,
    deskripsi,
  });

  // Calculate and update the aggregated average score for this Calas
  await updateCalasNilaiAggregates(calasId, expectedJenisUjian);

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

export const getAllHistory = async (query) => {
  const { page, limit, skip } = getPaginationParams(query);
  const filter = {};

  if (query.jenisUjian) {
    filter.jenisUjian = query.jenisUjian;
  }

  if (query.tanggal) {
    const sessionDate = new Date(query.tanggal);
    const startOfDay = new Date(sessionDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(sessionDate.setHours(23, 59, 59, 999));

    const sessions = await ExamSession.find({
      tanggal: { $gte: startOfDay, $lte: endOfDay }
    });

    if (sessions.length > 0) {
      filter.examSessionRef = { $in: sessions.map(s => s._id) };
    } else {
      // If no session on that date, return empty
      return {
        data: [],
        meta: buildPaginationMeta(0, page, limit),
      };
    }
  }

  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    const asistenMatching = await Asisten.find({
      $or: [{ nama: searchRegex }, { npm: searchRegex }]
    });

    if (asistenMatching.length > 0) {
      filter.penilaiRef = { $in: asistenMatching.map(a => a._id) };
    } else {
      // If no asisten matches, return empty
      return {
        data: [],
        meta: buildPaginationMeta(0, page, limit),
      };
    }
  }

  const [data, total] = await Promise.all([
    Penilaian.find(filter)
      .populate('penilaiRef', 'nama npm')
      .populate('calasRef', 'namaCalas idCalas npm kelas jurusan')
      .populate('examSessionRef', 'tanggal jenisUjian')
      .populate('roomPlacementRef', 'ruangan')
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

export const getCalasToScore = async (asistenId, query) => {
  const { tanggal, jenisUjian, search } = query;

  const sessionDate = new Date(tanggal);
  const startOfDay = new Date(sessionDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(sessionDate.setHours(23, 59, 59, 999));

  // 1. Find sessions for the given date and type
  const sessions = await ExamSession.find({
    tanggal: { $gte: startOfDay, $lte: endOfDay },
    jenisUjian
  });

  if (!sessions || sessions.length === 0) {
    return [];
  }

  const sessionIds = sessions.map(s => s._id);

  // 2. Find RoomPlacements where this assistant is a Penilai
  const placements = await RoomPlacement.find({
    examSessionRef: { $in: sessionIds },
    penilaiList: asistenId
  });

  if (!placements || placements.length === 0) {
    return [];
  }

  // 3. Collect all assigned Calas across all their assigned rooms
  // 3. Collect all assigned Calas across all their assigned rooms
  const assignedCalasMap = new Map();
  placements.forEach(placement => {
    if (placement.calasList) {
      placement.calasList.forEach(id => {
        assignedCalasMap.set(id.toString(), placement.examSessionRef);
      });
    }
  });

  if (assignedCalasMap.size === 0) {
    return [];
  }

  // 4. Find which Calas have already been scored by THIS assistant in this session
  const alreadyScored = await Penilaian.find({
    penilaiRef: asistenId,
    examSessionRef: { $in: sessionIds }
  }).select('calasRef');

  const scoredCalasIds = new Set(alreadyScored.map(p => p.calasRef.toString()));

  // 5. Filter out already scored Calas
  const unscoredCalasIds = Array.from(assignedCalasMap.keys()).filter(id => !scoredCalasIds.has(id));

  if (unscoredCalasIds.length === 0) {
    return [];
  }

  // 6. Query Calas details
  const calasFilter = {
    _id: { $in: unscoredCalasIds },
    'statusRekrutmen.hasil': { $ne: 'tidak_lolos' }
  };

  if (search) {
    calasFilter.$or = [
      { namaCalas: { $regex: search, $options: 'i' } },
      { npm: { $regex: search, $options: 'i' } }
    ];
  }

  const calasData = await Calas.find(calasFilter)
    .select('_id idCalas namaCalas npm kelas jurusan')
    .sort({ namaCalas: 1 })
    .lean();

  // Attach examSessionId to each Calas
  return calasData.map(c => ({
    ...c,
    examSessionId: assignedCalasMap.get(c._id.toString())
  }));
};

const updateCalasNilaiAggregates = async (calasId, jenisUjian) => {
  // Aggregate all scores for this calas and jenisUjian
  const allScores = await Penilaian.find({
    calasRef: calasId,
    jenisUjian
  });

  if (!allScores || allScores.length === 0) return;

  let totalScore = 0;
  const kriteriaSums = {};

  allScores.forEach(score => {
    totalScore += score.skorKeseluruhan;
    
    // score.kriteria is a Map (Mongoose type Map)
    if (score.kriteria) {
      for (const [key, val] of score.kriteria.entries()) {
        if (!kriteriaSums[key]) kriteriaSums[key] = 0;
        kriteriaSums[key] += val;
      }
    }
  });

  const numPenilai = allScores.length;
  const avgTotal = totalScore / numPenilai;
  
  const avgKriteria = {};
  for (const [key, sum] of Object.entries(kriteriaSums)) {
    avgKriteria[key] = sum / numPenilai;
  }

  const updateField = jenisUjian === 'praktek' ? 'nilaiUjian.praktek' : 'nilaiUjian.project';
  
  await Calas.findByIdAndUpdate(calasId, {
    [updateField]: {
      kriteria: avgKriteria,
      total: avgTotal
    }
  });
};
