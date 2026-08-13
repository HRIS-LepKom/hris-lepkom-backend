import crypto from 'crypto';
import Asisten from '../../../models/asisten.model.js';
import HardResetRequest from '../../../models/HardResetRequest.model.js';
import { signToken } from '../../../utils/jwtHelper.js';
import { getDefaultPassword } from '../../../utils/defaultPassword.js';

const BOOTSTRAP_ID_ASISTEN = 'SUPERADMIN';
const BOOTSTRAP_NPM = 'SUPERADMIN';

const sanitizeAsisten = (asisten) => ({
  _id: asisten._id,
  idAsisten: asisten.idAsisten,
  npm: asisten.npm,
  nama: asisten.nama,
  email: asisten.email,
  kelasSaatIni: asisten.kelasSaatIni,
  role: asisten.role,
  wajibGantiPassword: asisten.wajibGantiPassword,
});

const createTokens = async (asisten) => {
  const expiresIn = process.env.ACCESS_TOKEN_EXPIRY || (process.env.NODE_ENV === 'development' ? '1h' : '1h');
  const accessToken = signToken({ id: asisten._id, role: asisten.role, nama : asisten.nama }, expiresIn);
  const rawRefreshToken = crypto.randomBytes(40).toString('hex');
  const hashedRefreshToken = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
  await Asisten.findByIdAndUpdate(asisten._id, { refreshToken: hashedRefreshToken });
  return { accessToken, rawRefreshToken };
};

// Bootstrap: bikin akun super_admin pertama kali, dari EMAIL_ADMIN/EMAIL_ADMIN_PASS di .env.
// Otomatis terkunci begitu sudah ada 1 asisten dengan role super_admin.
export const registerSuperAdmin = async () => {
  const exists = await Asisten.exists({ role: 'super_admin' });
  if (exists) {
    const err = new Error('Super admin sudah terdaftar. Endpoint ini hanya bisa dipakai sekali.');
    err.statusCode = 409;
    throw err;
  }
  const { EMAIL_ADMIN, EMAIL_ADMIN_PASS } = process.env;
  if (!EMAIL_ADMIN || !EMAIL_ADMIN_PASS) {
    const err = new Error('Kredensial admin belum dikonfigurasi di server');
    err.statusCode = 500;
    throw err;
  }
  const admin = await Asisten.create({
    idAsisten: BOOTSTRAP_ID_ASISTEN,
    npm: BOOTSTRAP_NPM,
    nama: 'Super Admin',
    email: EMAIL_ADMIN.toLowerCase(),
    role: 'super_admin',
    password: EMAIL_ADMIN_PASS,
  });
  return { idAsisten: admin.idAsisten, email: admin.email };
};

export const login = async ({ identifier, password }) => {
  const asisten = await Asisten.findOne({
    $or: [{ idAsisten: identifier }, { email: identifier?.toLowerCase() }],
  }).select('+password');

  const invalidErr = new Error('ID/email atau password salah');
  invalidErr.statusCode = 401;

  if (!asisten) throw invalidErr;

  if (!asisten.isActive) {
    const err = new Error('Akun Anda tidak aktif. Hubungi super admin.');
    err.statusCode = 403;
    throw err;
  }

  const match = await asisten.comparePassword(password);
  if (!match) throw invalidErr;

  const { accessToken, rawRefreshToken } = await createTokens(asisten);
  return { accessToken, rawRefreshToken, asisten: sanitizeAsisten(asisten) };
};

export const refreshAccessToken = async (rawTokens) => {
  const candidates = Array.isArray(rawTokens) ? rawTokens.filter(Boolean) : (rawTokens ? [rawTokens] : []);

  if (candidates.length === 0) {
    const err = new Error('Sesi tidak ditemukan, silakan login kembali');
    err.statusCode = 401;
    throw err;
  }

  let asisten = null;
  for (const raw of candidates) {
    const hashed = crypto.createHash('sha256').update(raw).digest('hex');
    asisten = await Asisten.findOne({ refreshToken: hashed }); 
    if (asisten) break;
  }

  if (!asisten) {
    const err = new Error('Sesi tidak valid, silakan login kembali');
    err.statusCode = 401;
    throw err;
  }

  if (!asisten.isActive) {
    const err = new Error('Akun Anda tidak aktif. Hubungi super admin.');
    err.statusCode = 403;
    throw err;
  }

  const expiresIn = process.env.ACCESS_TOKEN_EXPIRY || (process.env.NODE_ENV === 'development' ? '1h' : '1h');
  const accessToken = signToken({ id: asisten._id, role: asisten.role }, expiresIn);
  return { accessToken, asisten: sanitizeAsisten(asisten) };
};

export const logout = async (rawTokens) => {
  const candidates = Array.isArray(rawTokens) ? rawTokens.filter(Boolean) : (rawTokens ? [rawTokens] : []);
  if (candidates.length === 0) return;

  for (const raw of candidates) {
    const hashed = crypto.createHash('sha256').update(raw).digest('hex');
    await Asisten.findOneAndUpdate({ refreshToken: hashed }, { refreshToken: null }); 
  }
};

export const requestHardReset = async ({ identifier }) => {
  const asisten = await Asisten.findOne({
    $or: [{ idAsisten: identifier }, { email: identifier?.toLowerCase() }],
  });

  if (!asisten) {
    const err = new Error('Akun asisten tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  const request = await HardResetRequest.create({
    asistenRef: asisten._id,
    inputAwal: identifier,
  });

  return { requestId: request._id, status: request.status };
};

export const approveHardReset = async ({ requestId, approvedBy }) => {
  const request = await HardResetRequest.findById(requestId);

  if (!request) {
    const err = new Error('Permintaan hard reset tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  if (request.status !== 'menunggu') {
    const err = new Error('Permintaan ini sudah diproses sebelumnya');
    err.statusCode = 409;
    throw err;
  }

  const asisten = await Asisten.findById(request.asistenRef);
  if (!asisten) {
    const err = new Error('Akun asisten terkait tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  asisten.password = getDefaultPassword();
  asisten.wajibGantiPassword = true;
  asisten.refreshToken = null;
  await asisten.save();

  request.status = 'disetujui';
  request.disetujuiOleh = approvedBy;
  request.diprosesPada = new Date();
  await request.save();

  return { asistenId: asisten._id, status: request.status };
};

export const rejectHardReset = async ({ requestId, rejectedBy }) => {
  const request = await HardResetRequest.findById(requestId);

  if (!request) {
    const err = new Error('Permintaan hard reset tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  if (request.status !== 'menunggu') {
    const err = new Error('Permintaan ini sudah diproses sebelumnya');
    err.statusCode = 409;
    throw err;
  }

  request.status = 'ditolak';
  request.disetujuiOleh = rejectedBy;
  request.diprosesPada = new Date();
  await request.save();

  return { requestId: request._id, status: request.status };
};

export const changePassword = async ({ asistenId, newPassword }) => {
  const asisten = await Asisten.findById(asistenId);

  if (!asisten) {
    const err = new Error('Akun asisten tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  asisten.password = newPassword;
  asisten.wajibGantiPassword = false;
  asisten.refreshToken = null;
  await asisten.save();

  return { asistenId: asisten._id };
};

export const getAllHardResetRequests = async (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = {};

  if (query.status) {
    filter.status = query.status;
  }

  const asistenMatch = {};

  // Global search
  if (query.search) {
    asistenMatch.nama = { $regex: query.search, $options: 'i' };
  }
  
  // Specific column filters
  if (query['asistenRef.nama']) {
    asistenMatch.nama = { $regex: query['asistenRef.nama'], $options: 'i' };
  }
  if (query['asistenRef.idAsisten']) {
    asistenMatch.idAsisten = { $regex: query['asistenRef.idAsisten'], $options: 'i' };
  }

  if (query.inputAwal) {
    filter.inputAwal = { $regex: query.inputAwal, $options: 'i' };
  }

  // Handle global search OR logic for inputAwal vs Asisten nama
  if (query.search) {
    const asistenIds = await Asisten.find(asistenMatch).select('_id');
    filter.$or = [
      { inputAwal: { $regex: query.search, $options: 'i' } },
      { asistenRef: { $in: asistenIds.map(a => a._id) } }
    ];
  } else if (Object.keys(asistenMatch).length > 0) {
    // Handle specific asisten filters (AND logic)
    const asistenIds = await Asisten.find(asistenMatch).select('_id');
    filter.asistenRef = { $in: asistenIds.map(a => a._id) };
  }

  const sortOptions = {};
  if (query.sortBy) {
    sortOptions[query.sortBy] = query.sortOrder === 'asc' ? 1 : -1;
  } else {
    sortOptions.createdAt = -1;
  }

  // Get raw data first to handle potential deleted asisten
  const rawData = await HardResetRequest.find(filter)
    .populate('asistenRef', 'idAsisten npm nama email role isActive')
    .populate('disetujuiOleh', 'idAsisten nama')
    .sort(sortOptions)
    .lean();

  // Filter out records where asistenRef is null (asisten deleted)
  // and optionally we could delete them from DB, but for now we just filter them from the response
  const validData = rawData.filter(item => item.asistenRef != null);
  
  // Cleanup database from orphaned requests asynchronously
  const orphanedIds = rawData.filter(item => item.asistenRef == null).map(item => item._id);
  if (orphanedIds.length > 0) {
    HardResetRequest.deleteMany({ _id: { $in: orphanedIds } }).exec().catch(err => console.error('Failed to cleanup orphaned requests:', err));
  }

  // Calculate pagination manually on valid data
  const total = validData.length;
  const totalPages = Math.ceil(total / limit);
  const data = validData.slice(skip, skip + limit);

  const meta = {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };

  return { data, meta };
};