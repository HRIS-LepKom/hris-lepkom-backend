import Calas from '../../../models/calas.model.js';
import { uploadToSupabase, deleteFromSupabase } from '../../../utils/uploadHelper.js';
import { sanitizeCalas } from '../management/management.service.js';
import supabase from '../../../config/supabase.js';

const BUCKET_NAME = process.env.SUPABASE_BUCKET;

export const updateBiodata = async (calasId, data) => {
  const existingCalas = await Calas.findById(calasId);
  if (!existingCalas) {
    const err = new Error('Calas tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  // Jika payload membawa perubahan email
  if (data.emailCalas !== undefined) {
    // Jika email di database sudah ada dan berbeda dengan yang baru
    if (existingCalas.emailCalas && existingCalas.emailCalas !== data.emailCalas) {
      const err = new Error('Email calas sudah terdaftar dan bersifat permanen, tidak dapat diubah.');
      err.statusCode = 403;
      throw err;
    }
  }

  const checkUnique = async (field, value, label) => {
    if (value) {
      const duplicate = await Calas.findOne({ [field]: value, _id: { $ne: calasId } });
      if (duplicate) {
        const err = new Error(`${label} tersebut sudah terdaftar pada pengguna lain.`);
        err.statusCode = 400;
        throw err;
      }
    }
  };

  await checkUnique('npm', data.npm, 'NPM');
  await checkUnique('noKtp', data.noKtp, 'No KTP');
  await checkUnique('noHp', data.noHp, 'No HP');

  const updatedCalas = await Calas.findByIdAndUpdate(calasId, data, { new: true, runValidators: true });
  return sanitizeCalas(updatedCalas);
};

export const uploadDokumen = async (calasId, jenisDokumen, file) => {
  const calas = await Calas.findById(calasId);
  if (!calas) {
    const err = new Error('Calas tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  if (calas[jenisDokumen]) {
    const err = new Error(
      `Dokumen ${jenisDokumen} sudah ada dan tidak dapat ditimpa secara langsung. ` +
      `Harap hapus file lama terlebih dahulu sebelum mengupload file baru.`
    );
    err.statusCode = 409;
    throw err;
  }

  const fileUrl = await uploadToSupabase(file, 'dokumen-calas');
  calas[jenisDokumen] = fileUrl;
  await calas.save();

  return sanitizeCalas(calas);
};

export const uploadTempDokumen = async (calasId, jenisDokumen, file) => {
  const calas = await Calas.findById(calasId);
  if (!calas) {
    const err = new Error('Calas tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  // Aturan 1: Cek apakah data lama sudah ada di DB
  if (calas[jenisDokumen]) {
    const err = new Error(
      `Dokumen ${jenisDokumen} sudah ada di database dan tidak dapat ditimpa secara langsung. ` +
      `Harap hapus file lama terlebih dahulu sebelum mengupload file baru.`
    );
    err.statusCode = 409;
    throw err;
  }

  // Upload ke Supabase tanpa menyimpan ke MongoDB
  const fileUrl = await uploadToSupabase(file, 'dokumen-calas');
  
  return { fileUrl };
};

export const deleteTempDokumen = async (fileUrl) => {
  await deleteFromSupabase(fileUrl);
};

export const deleteDokumen = async (calasId, jenisDokumen) => {
  const calas = await Calas.findById(calasId);
  if (!calas) {
    const err = new Error('Calas tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  if (!calas[jenisDokumen]) {
    const err = new Error(`Dokumen ${jenisDokumen} belum diupload.`);
    err.statusCode = 400;
    throw err;
  }

  await deleteFromSupabase(calas[jenisDokumen]);
  calas[jenisDokumen] = null;
  await calas.save();

  return sanitizeCalas(calas);
};

export const downloadDokumen = async (calasId, jenisDokumen) => {
  const calas = await Calas.findById(calasId);
  if (!calas) {
    const err = new Error('Calas tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  const fileUrl = calas[jenisDokumen];
  if (!fileUrl) {
    const err = new Error(`Dokumen ${jenisDokumen} belum diunggah`);
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
