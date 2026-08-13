import crypto from 'crypto';
import Calas from '../../../models/calas.model.js';
import { signToken } from '../../../utils/jwtHelper.js';
import { getDefaultPassword } from '../../../utils/defaultPassword.js';
import { sendMail } from '../../../config/mailer.js';
import { forgotPasswordCalasTemplate } from '../../../templates/forgotPasswordCalas.template.js';

const RESET_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 jam

// ─── Private Helpers ──────────────────────────────────────────────────────────

const sanitizeCalas = (calas) => ({
  _id:                calas._id,
  idCalas:            calas.idCalas,
  namaCalas:          calas.namaCalas,
  emailCalas:         calas.emailCalas,
  kelas:              calas.kelas,
  statusRekrutmen:    calas.statusRekrutmen,
  wajibGantiPassword: calas.wajibGantiPassword,
  daftarVia:          calas.daftarVia,
});

const createTokens = async (calas) => {
  const expiresIn = process.env.ACCESS_TOKEN_EXPIRY || (process.env.NODE_ENV === 'development' ? '1h' : '1h');
  const accessToken        = signToken({ id: calas._id, nama: calas.namaCalas }, expiresIn);
  const rawRefreshToken    = crypto.randomBytes(40).toString('hex');
  const hashedRefreshToken = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
  await Calas.findByIdAndUpdate(calas._id, { refreshToken: hashedRefreshToken });
  return { accessToken, rawRefreshToken };
};

export const login = async ({ identifier, password }) => {
  const calas = await Calas.findOne({
    $or: [
      { idCalas: identifier },
      { emailCalas: identifier?.toLowerCase() },
    ],
  }).select('+password');

  const invalidErr = new Error('ID/email atau password salah');
  invalidErr.statusCode = 401;

  if (!calas) throw invalidErr;

  if (calas.isBanned) {
    const err = new Error('Akun Anda telah diblokir. Hubungi panitia rekrutmen.');
    err.statusCode = 403;
    throw err;
  }

  const match = await calas.comparePassword(password);
  if (!match) throw invalidErr;

  const { accessToken, rawRefreshToken } = await createTokens(calas);
  return { accessToken, rawRefreshToken, calas: sanitizeCalas(calas) };
};

export const refreshAccessToken = async (rawTokens) => {
  const candidates = Array.isArray(rawTokens)
    ? rawTokens.filter(Boolean)
    : rawTokens ? [rawTokens] : [];

  if (candidates.length === 0) {
    const err = new Error('Sesi tidak ditemukan, silakan login kembali');
    err.statusCode = 401;
    throw err;
  }

  let calas = null;
  for (const raw of candidates) {
    const hashed = crypto.createHash('sha256').update(raw).digest('hex');
    calas = await Calas.findOne({ refreshToken: hashed }); 
    if (calas) break;
  }

  if (!calas) {
    const err = new Error('Sesi tidak valid, silakan login kembali');
    err.statusCode = 401;
    throw err;
  }

  if (calas.isBanned) {
    const err = new Error('Akun Anda telah diblokir. Hubungi panitia rekrutmen.');
    err.statusCode = 403;
    throw err;
  }

  const expiresIn = process.env.ACCESS_TOKEN_EXPIRY || (process.env.NODE_ENV === 'development' ? '1h' : '1h');
  const accessToken = signToken({ id: calas._id, nama: calas.namaCalas }, expiresIn);
  return { accessToken, calas: sanitizeCalas(calas) };
};

export const logout = async (rawTokens) => {
  const candidates = Array.isArray(rawTokens)
    ? rawTokens.filter(Boolean)
    : rawTokens ? [rawTokens] : [];
  if (candidates.length === 0) return;

  for (const raw of candidates) {
    const hashed = crypto.createHash('sha256').update(raw).digest('hex');
    await Calas.findOneAndUpdate({ refreshToken: hashed }, { refreshToken: null }); 
  }
};

// Forgot password — kirim email dengan link reset (token berlaku 1 jam).
export const forgotPassword = async ({ identifier }) => {
  const calas = await Calas.findOne({
    $or: [
      { idCalas: identifier },
      { emailCalas: identifier?.toLowerCase() },
    ],
  });

  if (!calas) return;

  const rawToken    = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  calas.resetPasswordToken  = hashedToken;
  calas.resetPasswordExpiry = new Date(Date.now() + RESET_TOKEN_EXPIRY);
  await calas.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;
  const { subject, html, text } = forgotPasswordCalasTemplate({
    namaCalas: calas.namaCalas,
    resetUrl,
  });

  await sendMail({ to: calas.emailCalas, subject, html, text });
};

export const resetPassword = async ({ token, newPassword }) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const calas = await Calas.findOne({
    resetPasswordToken:  hashedToken,
    resetPasswordExpiry: { $gt: Date.now() },
  });

  if (!calas) {
    const err = new Error('Link reset password tidak valid atau sudah kedaluwarsa');
    err.statusCode = 400;
    throw err;
  }

  calas.password            = newPassword;
  calas.resetPasswordToken  = null;
  calas.resetPasswordExpiry = null;
  calas.wajibGantiPassword  = false;
  calas.refreshToken        = null;
  await calas.save();
};

export const changePassword = async ({ calasId, newPassword }) => {
  const calas = await Calas.findById(calasId);

  if (!calas) {
    const err = new Error('Akun calas tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  calas.password            = newPassword;
  calas.wajibGantiPassword  = false;
  calas.refreshToken        = null;
  await calas.save();

  return { calasId: calas._id };
};
