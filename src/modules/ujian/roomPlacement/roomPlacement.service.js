import ExamSession    from '../../../models/examSession.model.js';
import RoomPlacement  from '../../../models/roomPlacement.model.js';
import RoomAssignment from '../../../models/roomAssignment.model.js';

const POPULATE_OPTS = [
  { path: 'examSessionRef',  select: 'tanggal jenisUjian' },
  { path: 'calasList',       select: 'namaCalas idCalas statusRekrutmen jawabanPraktek jawabanProject' },
  { path: 'penilaiList',     select: 'nama idAsisten role' },
  { path: 'dibuatOleh',      select: 'nama idAsisten' },
];

export const create = async ({ examSessionRef, ruangan }, dibuatOleh) => {
  const session = await ExamSession.findById(examSessionRef);
  if (!session) {
    const err = new Error('Sesi ujian tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  try {
    const placement = await RoomPlacement.create({ examSessionRef, ruangan, dibuatOleh });
    return RoomPlacement.findById(placement._id).populate(POPULATE_OPTS);
  } catch (e) {
    if (e.code === 11000) {
      const err = new Error(`Ruangan ${ruangan} sudah memiliki placement di sesi ini.`);
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
  return RoomPlacement.find(filter).populate(POPULATE_OPTS).sort({ ruangan: 1 });
};

export const getOne = async (id) => {
  const placement = await RoomPlacement.findById(id).populate(POPULATE_OPTS);
  if (!placement) {
    const err = new Error('Room placement tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  return placement;
};

export const remove = async (id) => {
  const placement = await RoomPlacement.findByIdAndDelete(id);
  if (!placement) {
    const err = new Error('Room placement tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  return { deletedId: id };
};

export const isPjOfRoom = async (asistenId, examSessionRef, ruangan) => {
  return RoomAssignment.exists({ examSessionRef, ruangan, pjRuanganRef: asistenId });
};

export const getPlacementWithAccessCheck = async (placementId, asisten) => {
  const placement = await RoomPlacement.findById(placementId);
  if (!placement) {
    const err = new Error('Room placement tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  const isKoordinatorOrAdmin = ['super_admin', 'koordinator_lapangan'].includes(asisten.role);
  if (isKoordinatorOrAdmin) return placement;

  const isPj = await isPjOfRoom(asisten._id, placement.examSessionRef, placement.ruangan);
  if (!isPj) {
    const err = new Error('Anda hanya dapat mengelola ruangan yang menjadi tanggung jawab Anda.');
    err.statusCode = 403;
    throw err;
  }

  return placement;
};

export const getUploadStatus = async (id) => {
  const placement = await RoomPlacement.findById(id)
    .populate('examSessionRef', 'jenisUjian tanggal')
    .populate('calasList', 'namaCalas idCalas jawabanPraktek jawabanProject statusRekrutmen');

  if (!placement) {
    const err = new Error('Room placement tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  const { jenisUjian } = placement.examSessionRef;
  const fieldJawaban   = jenisUjian === 'praktek' ? 'jawabanPraktek' : 'jawabanProject';

  const statusList = placement.calasList.map((c) => ({
    _id:       c._id,
    idCalas:   c.idCalas,
    namaCalas: c.namaCalas,
    sudahUpload: Boolean(c[fieldJawaban]),
    fileUrl:     c[fieldJawaban] || null,
  }));

  const sudahUpload  = statusList.filter((c) => c.sudahUpload).length;
  const belumUpload  = statusList.length - sudahUpload;

  return {
    ruangan:     placement.ruangan,
    jenisUjian,
    tanggal:     placement.examSessionRef.tanggal,
    total:       statusList.length,
    sudahUpload,
    belumUpload,
    calas:       statusList,
  };
};
