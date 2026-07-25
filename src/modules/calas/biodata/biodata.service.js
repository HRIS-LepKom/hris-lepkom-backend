import Calas from '../../../models/calas.model.js';
import { uploadToSupabase, deleteFromSupabase } from '../../../utils/uploadHelper.js';
import { sanitizeCalas } from '../management/management.service.js';

export const updateBiodata = async (calasId, data) => {
  const calas = await Calas.findByIdAndUpdate(calasId, data, { new: true, runValidators: true });
  if (!calas) {
    const err = new Error('Calas tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  return sanitizeCalas(calas);
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
