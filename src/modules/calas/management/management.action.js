import Calas from '../../../models/calas.model.js';
import { getDefaultPassword } from '../../../utils/defaultPassword.js';
import { sendMail } from '../../../config/mailer.js';
import { sanitizeCalas } from './management.service.js';
import { registrationNotificationTemplate } from '../../../templates/timeline/registrationNotification.template.js';
import { lolosTemplate } from '../../../templates/timeline/lolos.template.js';
import { penolakanTemplate } from '../../../templates/timeline/penolakan.template.js';

// ─── Reset Password Calas ─────────────────────────────────────────────────────

export const resetPassword = async (calasId) => {
  const calas = await Calas.findById(calasId);
  if (!calas) {
    const err = new Error('Calas tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  calas.password = getDefaultPassword();
  calas.wajibGantiPassword = true;
  await calas.save();

  return sanitizeCalas(calas);
};

// ─── Kirim Email Registrasi ───────────────────────────────────────────────────

export const sendBiodataEmail = async (calasId) => {
  const calas = await Calas.findById(calasId);
  if (!calas) {
    const err = new Error('Calas tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  if (!calas.isBiodataEmailSending) {
    const err = new Error('Email registrasi sudah pernah dikirim untuk calas ini');
    err.statusCode = 400;
    throw err;
  }

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const defaultPassword = process.env.DEFAULT_PASSWORD;

  const emailData = registrationNotificationTemplate({
    namaCalas:       calas.namaCalas,
    idCalas:         calas.idCalas,
    emailCalas:      calas.emailCalas,
    clientUrl,
    defaultPassword,
  });

  try {
    await sendMail({
      to:      calas.emailCalas,
      subject: emailData.subject,
      html:    emailData.html,
      text:    emailData.text,
    });

    // Hanya ubah jadi false jika email berhasil terkirim
    calas.isBiodataEmailSending = false;
    await calas.save();
  } catch (error) {
    console.error(`Gagal mengirim email registrasi ke ${calas.emailCalas}:`, error);
    const err = new Error('Gagal mengirim email. Silakan coba lagi nanti.');
    err.statusCode = 500;
    throw err;
  }

  return sanitizeCalas(calas);
};

// ─── Terima Calas (Keputusan Akhir → Lolos) ───────────────────────────────────

export const acceptCalas = async (calasId) => {
  const calas = await Calas.findById(calasId);
  if (!calas) {
    const err = new Error('Calas tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  if (calas.isBanned) {
    const err = new Error('Calas sedang diblokir, tidak dapat diproses');
    err.statusCode = 400;
    throw err;
  }

  if (calas.statusRekrutmen.tahapSaatIni !== 'keputusan_akhir') {
    const err = new Error('Calas belum berada di tahap keputusan akhir');
    err.statusCode = 400;
    throw err;
  }

  calas.statusRekrutmen.tahapSaatIni = 'selesai';
  calas.statusRekrutmen.hasil = 'lolos';
  await calas.save();

  // Kirim email selamat
  if (calas.emailCalas) {
    try {
      const emailData = lolosTemplate({ namaCalas: calas.namaCalas });
      await sendMail({
        to: calas.emailCalas, subject: emailData.subject,
        html: emailData.html, text: emailData.text,
      });
    } catch (error) {
      console.error(`Gagal mengirim email lolos ke ${calas.emailCalas}:`, error);
    }
  }

  return sanitizeCalas(calas);
};

// ─── Tolak Calas ──────────────────────────────────────────────────────────────

export const rejectCalas = async (calasId, alasanTidakLolos, deskripsiPenolakan) => {
  const calas = await Calas.findById(calasId);
  if (!calas) {
    const err = new Error('Calas tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  if (calas.isBanned) {
    const err = new Error('Calas sedang diblokir, tidak dapat diproses');
    err.statusCode = 400;
    throw err;
  }

  if (alasanTidakLolos === 'lainnya' && !deskripsiPenolakan) {
    const err = new Error('Deskripsi penolakan wajib diisi jika alasan = lainnya');
    err.statusCode = 400;
    throw err;
  }

  calas.statusRekrutmen.tahapSaatIni = 'selesai';
  calas.statusRekrutmen.hasil = 'tidak_lolos';
  calas.statusRekrutmen.alasanTidakLolos = alasanTidakLolos;
  calas.statusRekrutmen.deskripsiPenolakan = alasanTidakLolos === 'lainnya'
    ? deskripsiPenolakan
    : null;
  await calas.save();

  // Kirim email penolakan
  if (calas.emailCalas) {
    try {
      const emailData = penolakanTemplate({
        namaCalas: calas.namaCalas,
        alasanTidakLolos,
        deskripsiPenolakan
      });

      await sendMail({
        to: calas.emailCalas, subject: emailData.subject,
        html: emailData.html, text: emailData.text,
      });
    } catch (error) {
      console.error(`Gagal mengirim email penolakan ke ${calas.emailCalas}:`, error);
    }
  }

  return sanitizeCalas(calas);
};
