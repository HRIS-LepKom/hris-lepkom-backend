import mongoose from 'mongoose';
import Calas        from '../../../models/calas.model.js';
import RoomPlacement from '../../../models/roomPlacement.model.js';
import { uploadToSupabase, deleteFromSupabase } from '../../../utils/uploadHelper.js';
import { sanitizeCalas } from '../../calas/management/management.service.js';
import supabase from '../../../config/supabase.js';

import { getIO } from '../../../config/socket.js';

const BUCKET_NAME = process.env.SUPABASE_BUCKET;

const JENIS_MAP = {
  praktek: { stage: 'ujian_praktek', field: 'jawabanPraktek', timestampField: 'jawabanPraktekUploadedAt', label: 'Jawaban Praktek' },
  project: { stage: 'ujian_project', field: 'jawabanProject', timestampField: 'jawabanProjectUploadedAt', label: 'Jawaban Project'  },
};

const requireCalasAssigned = async (calasId, stage) => {
  const jenisUjian = stage === 'ujian_praktek' ? 'praktek' : 'project';
  const placements = await RoomPlacement.find({ calasList: calasId })
    .populate('examSessionRef', 'jenisUjian');

  const hasValidPlacement = placements.some(p => p.examSessionRef?.jenisUjian === jenisUjian);
  if (!hasValidPlacement) {
    const err = new Error(
      `Anda belum di-assign ke ruangan ujian ${jenisUjian}. ` +
      `Hubungi Koordinator Lapangan atau PJ Ruangan untuk proses assignment.`
    );
    err.statusCode = 403;
    throw err;
  }
};

export const uploadTempJawaban = async (calasId, jenisUjian, file) => {
  const { stage, field, label } = JENIS_MAP[jenisUjian];

  const calas = await Calas.findById(calasId);
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
      `${label} sudah ada di database dan tidak dapat ditimpa secara langsung. ` +
      `Harap hapus file lama terlebih dahulu sebelum mengupload file baru.`
    );
    err.statusCode = 409;
    throw err;
  }

  const fileUrl = await uploadToSupabase(file, `jawaban-ujian/${jenisUjian}`);
  
  return { fileUrl };
};

export const deleteTempJawaban = async (fileUrl) => {
  await deleteFromSupabase(fileUrl);
};

export const saveJawaban = async (calasId, jenisUjian, fileUrl) => {
  const { stage, field, timestampField, label } = JENIS_MAP[jenisUjian];

  const calas = await Calas.findById(calasId);
  if (!calas) {
    const err = new Error('Calas tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  if (calas.statusRekrutmen?.tahapSaatIni !== stage) {
    const err = new Error(`Menyimpan ${label} hanya bisa dilakukan pada tahap ${stage}.`);
    err.statusCode = 403;
    throw err;
  }

  await requireCalasAssigned(calasId, stage);

  if (calas[field]) {
    const err = new Error(`${label} sudah ada. Harap hapus file lama terlebih dahulu.`);
    err.statusCode = 409;
    throw err;
  }

  calas[field] = fileUrl;
  calas[timestampField] = new Date();
  await calas.save();
  
  // Realtime Broadcast
  try {
    const io = getIO();
    // Get Room Placement
    const placements = await RoomPlacement.find({ calasList: calasId })
      .populate('examSessionRef', 'jenisUjian');
    
    const validPlacement = placements.find(p => p.examSessionRef?.jenisUjian === jenisUjian);
    const ruangan = validPlacement ? validPlacement.ruangan : null;

    io.emit('new-jawaban-upload', {
      namaCalas: calas.namaCalas,
      npm: calas.npm,
      jenisUjian,
      ruangan,
      timestamp: calas[timestampField],
    });
  } catch (error) {
    console.error('[Socket.IO] Gagal mengirim event new-jawaban-upload:', error);
  }

  return sanitizeCalas(calas);
};

export const deleteJawaban = async (calasId, jenisUjian) => {
  const { stage, field, timestampField, label } = JENIS_MAP[jenisUjian];

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
  calas[timestampField] = null;
  await calas.save();
  return sanitizeCalas(calas);
};
export const downloadJawaban = async (calasId, jenisUjian) => {
  const { field, label } = JENIS_MAP[jenisUjian];
  const calas = await Calas.findById(calasId);
  if (!calas) {
    const err = new Error('Calas tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  const fileUrl = calas[field];
  if (!fileUrl) {
    const err = new Error(`${label} belum diunggah`);
    err.statusCode = 404;
    throw err;
  }

  const filePath = fileUrl.split(`/${BUCKET_NAME}/`)[1];
  if (!filePath) {
    const err = new Error('URL file tidak valid, hubungi administrator');
    err.statusCode = 500;
    throw err;
  }

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(filePath, 60);

  if (error) {
    const err = new Error(`Gagal membuat link download: ${error.message}`);
    err.statusCode = 502;
    throw err;
  }

  return { signedUrl: data.signedUrl };
};
