import mongoose from 'mongoose';
import Calas from '../../../models/calas.model.js';
import { sendMail } from '../../../config/mailer.js';
import { deleteFromSupabase } from '../../../utils/uploadHelper.js';
import { sanitizeCalas } from './management.service.js';
import { screeningTemplate } from '../../../templates/timeline/screening.template.js';
import { biodataTemplate } from '../../../templates/timeline/biodata.template.js';
import { ujianPraktekTemplate } from '../../../templates/timeline/ujianPraktek.template.js';
import { ujianProjectTemplate } from '../../../templates/timeline/ujianProject.template.js';
import { keputusanAkhirTemplate } from '../../../templates/timeline/keputusanAkhir.template.js';
import { lolosTemplate } from '../../../templates/timeline/lolos.template.js';
import { penolakanTemplate } from '../../../templates/timeline/penolakan.template.js';

const STAGES = [
  'registrasi',
  'screening',
  'biodata_dokumen',
  'ujian_praktek',
  'ujian_project',
  'keputusan_akhir',
  'selesai'
];

export const updateTimeline = async (calasId, { tahapSaatIni, hasil, alasanTidakLolos, deskripsiPenolakan }) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const calas = await Calas.findById(calasId).session(session);
    if (!calas) {
      const err = new Error('Calas tidak ditemukan');
      err.statusCode = 404;
      throw err;
    }

    if (calas.isBanned) {
      const err = new Error('Calas sedang diblokir, tidak dapat mengubah progres rekrutmen');
      err.statusCode = 400;
      throw err;
    }

    // Tidak bisa update jika sudah di tahap keputusan_akhir (gunakan accept/reject)
    if (calas.statusRekrutmen.tahapSaatIni === 'keputusan_akhir' && hasil !== 'tidak_lolos') {
      const err = new Error('Calas sudah di tahap keputusan akhir. Gunakan fitur Terima/Tolak.');
      err.statusCode = 400;
      throw err;
    }

    const currentIndex = STAGES.indexOf(calas.statusRekrutmen.tahapSaatIni);
    const newIndex = STAGES.indexOf(tahapSaatIni);

    if (newIndex < currentIndex) {
      const err = new Error('Tahapan rekrutmen tidak dapat dimundurkan (No Rollback).');
      err.statusCode = 400;
      throw err;
    }
    if (newIndex > currentIndex + 1 && hasil !== 'tidak_lolos') {
      const err = new Error('Tahapan rekrutmen harus berurutan (step-by-step), tidak bisa diloncat.');
      err.statusCode = 400;
      throw err;
    }

    // Guard: Memastikan kelengkapan dokumen sebelum maju ke ujian_praktek
    if (tahapSaatIni === 'ujian_praktek' && calas.statusRekrutmen.tahapSaatIni === 'biodata_dokumen') {
      const missingDocs = [];
      if (!calas.cv) missingDocs.push('CV');
      if (!calas.krs) missingDocs.push('KRS');
      if (!calas.rangkumanNilai) missingDocs.push('Rangkuman Nilai');

      if (missingDocs.length > 0) {
        const err = new Error(`Calas belum melengkapi semua dokumen wajib. Dokumen yang belum diupload: ${missingDocs.join(', ')}.`);
        err.statusCode = 400;
        throw err;
      }
    }

    if (hasil === 'lolos' && tahapSaatIni !== 'selesai') {
      const err = new Error("Status 'lolos' hanya dapat diberikan tepat pada tahap akhir ('selesai').");
      err.statusCode = 400;
      throw err;
    }

    // Jika tertolak, paksakan tahapSaatIni menjadi 'selesai'
    if (hasil === 'tidak_lolos') {
      calas.statusRekrutmen.tahapSaatIni = 'selesai';
    } else {
      calas.statusRekrutmen.tahapSaatIni = tahapSaatIni;
    }

    calas.statusRekrutmen.hasil = hasil;
    calas.statusRekrutmen.alasanTidakLolos = alasanTidakLolos || null;
    calas.statusRekrutmen.deskripsiPenolakan = (alasanTidakLolos === 'lainnya' && deskripsiPenolakan)
      ? deskripsiPenolakan
      : null;

    await calas.save({ session });
    await session.commitTransaction();
    session.endSession();

  let emailData = null;
  const context = { namaCalas: calas.namaCalas, clientUrl: process.env.CLIENT_URL };

  if (hasil === 'tidak_lolos') {
    emailData = penolakanTemplate({
      namaCalas: calas.namaCalas,
      alasanTidakLolos,
      deskripsiPenolakan
    });
  } else if (hasil === 'lolos' && tahapSaatIni === 'selesai') {
    emailData = lolosTemplate(context);
  } else {
    switch (tahapSaatIni) {
      case 'screening':       emailData = screeningTemplate(context); break;
      case 'biodata_dokumen': emailData = biodataTemplate(context); break;
      case 'ujian_praktek':   emailData = ujianPraktekTemplate(context); break;
      case 'ujian_project':   emailData = ujianProjectTemplate(context); break;
      case 'keputusan_akhir': emailData = keputusanAkhirTemplate(context); break;
    }
  }

  if (emailData && calas.emailCalas) {
    try {
      await sendMail({ to: calas.emailCalas, subject: emailData.subject, html: emailData.html, text: emailData.text });
    } catch (error) {
      console.error(`Gagal mengirim email timeline ke ${calas.emailCalas}:`, error);
    }
  }

  return sanitizeCalas(calas);

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const resetProses = async (calasId) => {
  const calas = await Calas.findById(calasId);
  if (!calas) {
    const err = new Error('Calas tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  if (calas.cv) await deleteFromSupabase(calas.cv);
  if (calas.krs) await deleteFromSupabase(calas.krs);
  if (calas.rangkumanNilai) await deleteFromSupabase(calas.rangkumanNilai);

  calas.cv = null;
  calas.krs = null;
  calas.rangkumanNilai = null;

  calas.statusRekrutmen = {
    tahapSaatIni: 'registrasi', hasil: 'proses',
    alasanTidakLolos: null, deskripsiPenolakan: null,
  };

  await calas.save();
  return sanitizeCalas(calas);
};
