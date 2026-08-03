import mongoose from 'mongoose';
import RoomPlacement from '../../models/roomPlacement.model.js';
import ExamSession from '../../models/examSession.model.js';
import Asisten from '../../models/asisten.model.js';
import Calas from '../../models/calas.model.js';
import { getPaginationParams, buildPaginationMeta } from '../../utils/paginate.js';

export const getAllRoomPlacements = async (query) => {
  const { page, limit, skip } = getPaginationParams(query);
  
  const filter = {};
  if (query.ruangan) filter.ruangan = parseInt(query.ruangan);
  if (query.jenisUjian) {
    const sessions = await ExamSession.find({ jenisUjian: query.jenisUjian }).select('_id');
    filter.examSessionRef = { $in: sessions.map(s => s._id) };
  }
  
  const sort = { createdAt: -1 };

  const data = await RoomPlacement.find(filter)
    .populate('examSessionRef', 'tanggal jamMulai jamSelesai jenisUjian')
    .populate('pjRuanganList', 'nama idAsisten role npm')
    .populate('penilaiList', 'nama idAsisten role npm')
    .populate('calasList', 'namaCalas idCalas npm kelas')
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await RoomPlacement.countDocuments(filter);

  return {
    data,
    meta: buildPaginationMeta(total, page, limit)
  };
};

// Helper for finding assigned assistant IDs for a specific date and exam type
const getAssignedAsistenIds = async (tanggal, jenisUjian) => {
  // 1. Cari ExamSession untuk tanggal dan jenisUjian
  const sessionDate = new Date(tanggal);
  const startOfDay = new Date(sessionDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(sessionDate.setHours(23, 59, 59, 999));

  const sessions = await ExamSession.find({
    tanggal: { $gte: startOfDay, $lte: endOfDay },
    jenisUjian
  });

  if (!sessions || sessions.length === 0) {
    return [];
  }

  const sessionIds = sessions.map(s => s._id);

  // 2. Ambil semua RoomPlacement untuk sesi-sesi tersebut
  const placements = await RoomPlacement.find({
    examSessionRef: { $in: sessionIds }
  });

  // 3. Kumpulkan semua ID asisten yang sudah di-assign (dari pjRuanganList & penilaiList)
  const assignedIds = new Set();
  placements.forEach(placement => {
    if (placement.pjRuanganList) {
      placement.pjRuanganList.forEach(id => assignedIds.add(id.toString()));
    }
    if (placement.penilaiList) {
      placement.penilaiList.forEach(id => assignedIds.add(id.toString()));
    }
  });

  return Array.from(assignedIds);
};

export const getAvailablePj = async (tanggal, jenisUjian, search) => {
  const assignedIds = await getAssignedAsistenIds(tanggal, jenisUjian);

  const filter = {
    role: 'penanggung_jawab_ruangan',
    _id: { $nin: assignedIds }
  };

  if (search) {
    filter.nama = { $regex: search, $options: 'i' };
  }

  return Asisten.find(filter)
    .select('_id nama idAsisten npm role')
    .sort({ nama: 1 })
    .lean();
};

export const getAvailablePenilai = async (tanggal, jenisUjian, search) => {
  const assignedIds = await getAssignedAsistenIds(tanggal, jenisUjian);

  const filter = {
    role: 'asisten_penilai',
    _id: { $nin: assignedIds }
  };

  if (search) {
    filter.nama = { $regex: search, $options: 'i' };
  }

  return Asisten.find(filter)
    .select('_id nama idAsisten npm role')
    .sort({ nama: 1 })
    .lean();
};

export const createAsistenPlacement = async (data, userId) => {
  const { tanggal, jenisUjian, ruangan, pjRuanganIds, penilaiIds } = data;

  // 1. Cari atau buat ExamSession
  const sessionDate = new Date(tanggal);
  const startOfDay = new Date(sessionDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(sessionDate.setHours(23, 59, 59, 999));

  let examSession = await ExamSession.findOne({
    tanggal: { $gte: startOfDay, $lte: endOfDay },
    jenisUjian
  });

  if (!examSession) {
    examSession = await ExamSession.create({
      tanggal: startOfDay,
      jenisUjian,
      dibuatOleh: userId
    });
  }

  // 2. Validasi apakah Ruangan sudah ada di sesi ini
  const existingPlacement = await RoomPlacement.findOne({
    examSessionRef: examSession._id,
    ruangan
  });

  if (existingPlacement) {
    const err = new Error(`Ruangan ${ruangan} sudah memiliki penugasan untuk sesi ini. Silakan gunakan fitur Edit.`);
    err.statusCode = 409;
    throw err;
  }

  // 3. Buat RoomPlacement baru
  const placement = await RoomPlacement.create({
    examSessionRef: examSession._id,
    ruangan,
    pjRuanganList: pjRuanganIds,
    penilaiList: penilaiIds,
    dibuatOleh: userId
  });

  return RoomPlacement.findById(placement._id)
    .populate('examSessionRef')
    .populate('pjRuanganList', 'nama idAsisten npm')
    .populate('penilaiList', 'nama idAsisten npm')
    .lean();
};

export const updateAsistenPlacement = async (id, data) => {
  const { pjRuanganIds, penilaiIds } = data;

  const placement = await RoomPlacement.findById(id);
  if (!placement) {
    const err = new Error('Penempatan ruangan tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  placement.pjRuanganList = pjRuanganIds;
  placement.penilaiList = penilaiIds;
  await placement.save();

  return RoomPlacement.findById(id)
    .populate('examSessionRef')
    .populate('pjRuanganList', 'nama idAsisten npm')
    .populate('penilaiList', 'nama idAsisten npm')
    .lean();
};

export const deletePlacement = async (id) => {
  const placement = await RoomPlacement.findByIdAndDelete(id);
  if (!placement) {
    const err = new Error('Penempatan ruangan tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  // Optional: Bersihkan ExamSession jika tidak ada lagi RoomPlacement yang merujuknya
  const otherPlacements = await RoomPlacement.exists({ examSessionRef: placement.examSessionRef });
  if (!otherPlacements) {
    await ExamSession.findByIdAndDelete(placement.examSessionRef);
  }

  return { deletedId: id };
};

// Helper for finding assigned Calas IDs for a specific date and exam type
const getAssignedCalasIds = async (tanggal, jenisUjian) => {
  const sessionDate = new Date(tanggal);
  const startOfDay = new Date(sessionDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(sessionDate.setHours(23, 59, 59, 999));

  const sessions = await ExamSession.find({
    tanggal: { $gte: startOfDay, $lte: endOfDay },
    jenisUjian
  });

  if (!sessions || sessions.length === 0) {
    return [];
  }

  const sessionIds = sessions.map(s => s._id);

  const placements = await RoomPlacement.find({
    examSessionRef: { $in: sessionIds }
  });

  const assignedIds = new Set();
  placements.forEach(placement => {
    if (placement.calasList) {
      placement.calasList.forEach(id => assignedIds.add(id.toString()));
    }
  });

  return Array.from(assignedIds);
};

export const getAvailableCalas = async (tanggal, jenisUjian, search) => {
  const assignedIds = await getAssignedCalasIds(tanggal, jenisUjian);

  const filter = {
    _id: { $nin: assignedIds },
    'statusRekrutmen.hasil': { $ne: 'tidak_lolos' },
    isBanned: false
  };

  if (search) {
    filter.$or = [
      { namaCalas: { $regex: search, $options: 'i' } },
      { npm: { $regex: search, $options: 'i' } }
    ];
  }

  return Calas.find(filter)
    .select('_id namaCalas npm emailCalas kelas')
    .sort({ namaCalas: 1 })
    .lean();
};

export const updateCalasPlacement = async (id, data) => {
  const { calasIds } = data;

  const placement = await RoomPlacement.findById(id);
  if (!placement) {
    const err = new Error('Penempatan ruangan tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  placement.calasList = calasIds;
  await placement.save();

  return RoomPlacement.findById(id)
    .populate('examSessionRef')
    .populate('pjRuanganList', 'nama idAsisten npm')
    .populate('penilaiList', 'nama idAsisten npm')
    .populate('calasList', 'namaCalas npm emailCalas kelas')
    .lean();
};
