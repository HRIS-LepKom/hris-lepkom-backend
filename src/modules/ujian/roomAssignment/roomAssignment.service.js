import ExamSession from '../../../models/examSession.model.js';
import RoomAssignment from '../../../models/roomAssignment.model.js';
import RoomPlacement from '../../../models/roomPlacement.model.js';

const requireSession = async (sessionId) => {
  const session = await ExamSession.findById(sessionId);
  if (!session) {
    const err = new Error('Sesi ujian tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  return session;
};

const ensureNotAlreadyPenilai = async (sessionId, asistenId) => {
  const isAlreadyPenilai = await RoomPlacement.exists({
    examSessionRef: sessionId,
    penilaiList:    asistenId,
  });
  if (isAlreadyPenilai) {
    const err = new Error('Asisten ini sudah terdaftar sebagai penilai di sesi yang sama. Tidak dapat diassign sebagai PJ Ruangan.');
    err.statusCode = 409;
    throw err;
  }
};

export const create = async ({ examSessionRef, ruangan, pjRuanganRef }, dibuatOleh) => {
  await requireSession(examSessionRef);
  await ensureNotAlreadyPenilai(examSessionRef, pjRuanganRef);

  try {
    const assignment = await RoomAssignment.create({ examSessionRef, ruangan, pjRuanganRef, dibuatOleh });
    return assignment.populate([
      { path: 'pjRuanganRef', select: 'nama idAsisten role' },
      { path: 'examSessionRef', select: 'tanggal jenisUjian' },
    ]);
  } catch (e) {
    if (e.code === 11000) {
      const err = new Error(`Ruangan ${ruangan} sudah memiliki PJ di sesi ini.`);
      err.statusCode = 409;
      throw err;
    }
    throw e;
  }
};

export const getAll = async (query) => {
  const filter = {};
  if (query.examSessionRef) filter.examSessionRef = query.examSessionRef;
  if (query.ruangan) filter.ruangan = Number(query.ruangan);
  return RoomAssignment.find(filter)
    .populate('pjRuanganRef', 'nama idAsisten role')
    .populate('examSessionRef', 'tanggal jenisUjian')
    .sort({ ruangan: 1 });
};

export const getOne = async (id) => {
  const assignment = await RoomAssignment.findById(id)
    .populate('pjRuanganRef', 'nama idAsisten role')
    .populate('examSessionRef', 'tanggal jenisUjian');
  if (!assignment) {
    const err = new Error('RoomAssignment tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  return assignment;
};

export const update = async (id, { pjRuanganRef }) => {
  const assignment = await RoomAssignment.findById(id);
  if (!assignment) {
    const err = new Error('RoomAssignment tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  await ensureNotAlreadyPenilai(assignment.examSessionRef, pjRuanganRef);
  assignment.pjRuanganRef = pjRuanganRef;
  await assignment.save();
  return assignment.populate('pjRuanganRef', 'nama idAsisten role');
};

export const remove = async (id) => {
  const assignment = await RoomAssignment.findByIdAndDelete(id);
  if (!assignment) {
    const err = new Error('RoomAssignment tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  return { deletedId: id };
};
