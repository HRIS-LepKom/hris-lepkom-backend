import mongoose from 'mongoose';
import Calas        from '../../../models/calas.model.js';
import RoomPlacement from '../../../models/roomPlacement.model.js';
import { uploadToSupabase, deleteFromSupabase } from '../../../utils/uploadHelper.js';
import { sanitizeCalas } from '../../calas/management/management.service.js';

const JENIS_MAP = {
  praktek: { stage: 'ujian_praktek', field: 'jawabanPraktek', label: 'Jawaban Praktek' },
  project: { stage: 'ujian_project', field: 'jawabanProject', label: 'Jawaban Project'  },
};

const requireCalasAssigned = async (calasId, stage) => {
  const jenisUjian = stage === 'ujian_praktek' ? 'praktek' : 'project';
  const isAssigned = await RoomPlacement.exists({
    calasList: calasId,
    $lookup: { from: 'examsessions', localField: 'examSessionRef', foreignField: '_id', as: 'session' },
  });

  // Cara yang lebih straightforward tanpa lookup di exists():
  const placement = await RoomPlacement.findOne({ calasList: calasId })
    .populate('examSessionRef', 'jenisUjian');

  const hasValidPlacement = placement && placement.examSessionRef?.jenisUjian === jenisUjian;
  if (!hasValidPlacement) {
    const err = new Error(
      `Anda belum di-assign ke ruangan ujian ${jenisUjian}. ` +
      `Hubungi Koordinator Lapangan atau PJ Ruangan untuk proses assignment.`
    );
    err.statusCode = 403;
    throw err;
  }
};

export const uploadJawaban = async (calasId, jenisUjian, file) => {
  const { stage, field, label } = JENIS_MAP[jenisUjian];
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const calas = await Calas.findById(calasId).session(session);
    if (!calas) {
      const err = new Error('Calas tidak ditemukan');
      err.statusCode = 404;
      throw err;
    }

    if (calas.statusRekrutmen?.tahapSaatIni !== stage) {
      const err = new Error(`Upload ${label} hanya bisa dilakukan pada tahap ${stage}. Tahap Anda saat ini: ${calas.statusRekrutmen?.tahapSaatIni}`);
      err.statusCode = 403;
      throw err;
    }

    await requireCalasAssigned(calasId, stage);

    if (calas[field]) {
      const err = new Error(
        `${label} sudah ada. Harap hapus file lama terlebih dahulu sebelum mengupload file baru.`
      );
      err.statusCode = 409;
      throw err;
    }

    const fileUrl = await uploadToSupabase(file, `jawaban-ujian/${jenisUjian}`);
    calas[field] = fileUrl;
    await calas.save({ session });
    
    await session.commitTransaction();
    session.endSession();
    
    return sanitizeCalas(calas);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const deleteJawaban = async (calasId, jenisUjian) => {
  const { stage, field, label } = JENIS_MAP[jenisUjian];

  const calas = await Calas.findById(calasId);
  if (!calas) {
    const err = new Error('Calas tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  if (calas.statusRekrutmen?.tahapSaatIni !== stage) {
    const err = new Error(`Hapus ${label} hanya bisa dilakukan pada tahap ${stage}.`);
    err.statusCode = 403;
    throw err;
  }

  if (!calas[field]) {
    const err = new Error(`${label} belum diupload.`);
    err.statusCode = 400;
    throw err;
  }

  await deleteFromSupabase(calas[field]);
  calas[field] = null;
  await calas.save();
  return sanitizeCalas(calas);
};
