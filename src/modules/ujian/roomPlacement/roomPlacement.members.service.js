import Calas          from '../../../models/calas.model.js';
import RoomPlacement  from '../../../models/roomPlacement.model.js';
import RoomAssignment from '../../../models/roomAssignment.model.js';

const POPULATE_OPTS = [
  { path: 'examSessionRef',  select: 'tanggal jenisUjian' },
  { path: 'calasList',       select: 'namaCalas idCalas statusRekrutmen jawabanPraktek jawabanProject' },
  { path: 'penilaiList',     select: 'nama idAsisten role' },
];

// ─── Guard helpers ────────────────────────────────────────────────────────────

const requireCalasStageMatch = async (calasId, jenisUjian) => {
  const calas = await Calas.findById(calasId).select('statusRekrutmen namaCalas');
  if (!calas) {
    const err = new Error('Calas tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  const expected = jenisUjian === 'praktek' ? 'ujian_praktek' : 'ujian_project';
  if (calas.statusRekrutmen?.tahapSaatIni !== expected) {
    const err = new Error(
      `Calas "${calas.namaCalas}" tidak dapat di-assign ke sesi ${jenisUjian}. ` +
      `Status rekrutmen saat ini: ${calas.statusRekrutmen?.tahapSaatIni} (harus: ${expected}).`
    );
    err.statusCode = 400;
    throw err;
  }
};

const ensureCalasNotInOtherRoom = async (sessionId, calasId, excludePlacementId) => {
  const existing = await RoomPlacement.findOne({
    examSessionRef: sessionId,
    calasList: calasId,
    _id: { $ne: excludePlacementId },
  });
  if (existing) {
    const err = new Error(`Calas ini sudah di-assign ke ruangan ${existing.ruangan} pada sesi yang sama.`);
    err.statusCode = 409;
    throw err;
  }
};

const ensurePenilaiNotInOtherRoom = async (sessionId, asistenId, excludePlacementId) => {
  const existing = await RoomPlacement.findOne({
    examSessionRef: sessionId,
    penilaiList: asistenId,
    _id: { $ne: excludePlacementId },
  });
  if (existing) {
    const err = new Error(`Penilai ini sudah di-assign ke ruangan ${existing.ruangan} pada sesi yang sama.`);
    err.statusCode = 409;
    throw err;
  }
};

const ensureNotPjOfAnyRoom = async (sessionId, asistenId) => {
  const isPj = await RoomAssignment.exists({ examSessionRef: sessionId, pjRuanganRef: asistenId });
  if (isPj) {
    const err = new Error('Asisten ini adalah PJ Ruangan di sesi ini dan tidak dapat diassign sebagai penilai.');
    err.statusCode = 409;
    throw err;
  }
};

const ensureNotKoordinator = (asisten) => {
  if (asisten?.role === 'koordinator_lapangan') {
    const err = new Error('Koordinator lapangan tidak dapat diassign sebagai penilai.');
    err.statusCode = 409;
    throw err;
  }
};

// ─── Add / Remove Calas ───────────────────────────────────────────────────────

export const addCalas = async (placement, calasId) => {
  const session = placement.examSessionRef;
  await requireCalasStageMatch(calasId, session.jenisUjian);
  await ensureCalasNotInOtherRoom(session._id || placement.examSessionRef, calasId, placement._id);

  if (placement.calasList.some((c) => c.toString() === calasId)) {
    const err = new Error('Calas ini sudah ada di ruangan ini.');
    err.statusCode = 409;
    throw err;
  }

  placement.calasList.push(calasId);
  await placement.save();
  return RoomPlacement.findById(placement._id).populate(POPULATE_OPTS);
};

export const removeCalas = async (placement, calasId) => {
  placement.calasList = placement.calasList.filter((c) => c.toString() !== calasId);
  await placement.save();
  return RoomPlacement.findById(placement._id).populate(POPULATE_OPTS);
};

// ─── Add / Remove Penilai ─────────────────────────────────────────────────────

export const addPenilai = async (placement, asistenId, asistenData) => {
  ensureNotKoordinator(asistenData);
  await ensureNotPjOfAnyRoom(placement.examSessionRef, asistenId);
  await ensurePenilaiNotInOtherRoom(placement.examSessionRef, asistenId, placement._id);

  if (placement.penilaiList.some((p) => p.toString() === asistenId)) {
    const err = new Error('Penilai ini sudah ada di ruangan ini.');
    err.statusCode = 409;
    throw err;
  }

  placement.penilaiList.push(asistenId);
  await placement.save();
  return RoomPlacement.findById(placement._id).populate(POPULATE_OPTS);
};

export const removePenilai = async (placement, asistenId) => {
  placement.penilaiList = placement.penilaiList.filter((p) => p.toString() !== asistenId);
  await placement.save();
  return RoomPlacement.findById(placement._id).populate(POPULATE_OPTS);
};
