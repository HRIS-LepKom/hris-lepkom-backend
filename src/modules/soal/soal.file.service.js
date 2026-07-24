import Soal from '../../models/soal.model.js';
import supabase from '../../config/supabase.js';
import { uploadToSupabase, deleteFromSupabase } from '../../utils/uploadHelper.js';

const BUCKET_NAME = process.env.SUPABASE_BUCKET;
const PJ_ROLES    = ['super_admin', 'pj_soal_materi'];

// ─── Upload File Baru ─────────────────────────────────────────────────────────
export const uploadFile = async (id, file) => {
  const soal = await Soal.findById(id);
  if (!soal) {
    const err = new Error('Soal tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  if (soal.file) {
    const err = new Error(
      'Soal ini masih memiliki file aktif dan tidak dapat ditimpa secara langsung. ' +
      'Untuk menggantinya, harap hapus file lama terlebih dahulu melalui: ' +
      'DELETE /api/soal/' + id + '/file  — kemudian upload file baru. ' +
      'Hal ini dilakukan untuk menjaga integritas data dan mencegah penumpukan file pada storage.'
    );
    err.statusCode = 409;
    throw err;
  }

  const fileUrl = await uploadToSupabase(file, 'soal');
  soal.file = fileUrl;
  await soal.save();

  return await soal.populate([
    { path: 'materiRef',  select: 'namaMateri tingkat' },
    { path: 'dibuatOleh', select: 'nama idAsisten' },
  ]);
};

// ─── Hapus File (tanpa menghapus dokumen Soal) ───────────────────────────────
export const deleteFile = async (id) => {
  const soal = await Soal.findById(id);
  if (!soal) {
    const err = new Error('Soal tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  if (!soal.file) {
    const err = new Error(
      'Soal ini tidak memiliki file aktif yang dapat dihapus. ' +
      'Gunakan PATCH /api/soal/' + id + '/file untuk mengupload file baru.'
    );
    err.statusCode = 400;
    throw err;
  }

  await deleteFromSupabase(soal.file);
  soal.file = null;
  await soal.save();

  return {
    soalId: id,
    pesan: 'File berhasil dihapus dari storage. Anda sekarang dapat mengupload file baru melalui PATCH /api/soal/' + id + '/file',
  };
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
