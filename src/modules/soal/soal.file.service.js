import Soal from '../../models/soal.model.js';
import supabase from '../../config/supabase.js';
import { uploadToSupabase, deleteFromSupabase } from '../../utils/uploadHelper.js';

const BUCKET_NAME = process.env.SUPABASE_BUCKET;
const PJ_ROLES    = ['super_admin', 'pj_soal_materi'];

// ─── Upload File Baru (Ke Storage Saja) ───────────────────────────────────────
export const uploadTempFile = async (file) => {
  const fileUrl = await uploadToSupabase(file, 'soal');
  return { fileUrl };
};

// ─── Hapus File (Dari Storage Saja) ───────────────────────────────────────────
export const deleteTempFile = async (fileUrl) => {
  await deleteFromSupabase(fileUrl);
};

// ─── Download File (redirect ke signed URL) ───────────────────────────────────
export const downloadFile = async (id, requesterRole) => {
  const soal = await Soal.findById(id).lean();
  if (!soal) {
    const err = new Error('Soal tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  const isPjOrAdmin = PJ_ROLES.includes(requesterRole);
  if (!soal.isViewed && !isPjOrAdmin) {
    const err = new Error(
      'Soal ini belum dipublikasikan oleh pengelola materi dan belum dapat diunduh saat ini'
    );
    err.statusCode = 403;
    throw err;
  }

  if (!soal.file) {
    const err = new Error('Soal ini belum memiliki file yang dapat diunduh');
    err.statusCode = 404;
    throw err;
  }

  const filePath = soal.file.split(`/${BUCKET_NAME}/`)[1];
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

  return { signedUrl: data.signedUrl, judulSoal: soal.judulSoal };
};
