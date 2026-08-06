import mongoose from 'mongoose';
import { JadwalKosong, JadwalKosongEntri } from '../../../models/jadwalKosong.model.js';
import Asisten from '../../../models/asisten.model.js';
import { getPaginationParams, buildPaginationMeta } from '../../../utils/paginate.js';
import { buildSmartFilter } from '../../../utils/buildSmartFilter.js';

// ─── Helper: hitung status pengisian ────────────────────────────────────────

const hitungStatus = (entri) => {
  const adaKursus  = entri.kursusLepkom?.length > 0;
  const adaJadwal  = entri.jadwalKosong?.length > 0;
  if (!adaKursus && !adaJadwal) return 'belum_diisi';
  if (adaKursus  && adaJadwal)  return 'lengkap';
  return 'sebagian';
};

// ─── CRUD Dashboard ──────────────────────────────────────────────────────────

/**
 * Buat jadwal kosong baru + auto-populate entri untuk semua asisten aktif.
 */
export const create = async (data, asistenId) => {
  const jadwal = await JadwalKosong.create({ ...data, dibuatOleh: asistenId });

  // Ambil semua asisten aktif
  const semuaAsisten = await Asisten.find({ isActive: true }).select('_id').lean();

  // Buat entri kosong untuk masing-masing asisten
  if (semuaAsisten.length > 0) {
    const entris = semuaAsisten.map((a) => ({
      jadwalKosongRef: jadwal._id,
      asistenRef:      a._id,
    }));
    await JadwalKosongEntri.insertMany(entris, { ordered: false });
  }

  return jadwal.populate('dibuatOleh', 'nama idAsisten');
};

/**
 * List semua jadwal kosong dengan pagination, search, sort.
 */
export const getAll = async (query) => {
  const { page, limit, skip } = getPaginationParams(query);

  const filter = {};
  if (query.search) {
    filter.judul = { $regex: query.search, $options: 'i' };
  }

  const ALLOWED_SORT = ['judul', 'createdAt'];
  const sortField    = ALLOWED_SORT.includes(query.sortBy) ? query.sortBy : 'createdAt';
  const sortDir      = query.sortOrder === 'asc' ? 1 : -1;

  const [data, total] = await Promise.all([
    JadwalKosong.find(filter)
      .populate('dibuatOleh', 'nama idAsisten')
      .sort({ [sortField]: sortDir })
      .skip(skip)
      .limit(limit)
      .lean(),
    JadwalKosong.countDocuments(filter),
  ]);

  return { data, meta: buildPaginationMeta(total, page, limit) };
};

/**
 * Update judul jadwal kosong (super_admin only).
 */
export const updateJudul = async (id, judul) => {
  const jadwal = await JadwalKosong.findByIdAndUpdate(
    id,
    { judul },
    { new: true, runValidators: true }
  ).populate('dibuatOleh', 'nama idAsisten');

  if (!jadwal) {
    const err = new Error('Jadwal kosong tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  return jadwal;
};

// ─── Detail Jadwal Kosong ────────────────────────────────────────────────────

/**
 * Get detail header jadwal kosong (untuk heading halaman detail).
 */
export const getOne = async (id) => {
  const jadwal = await JadwalKosong.findById(id)
    .populate('dibuatOleh', 'nama idAsisten')
    .lean();
  if (!jadwal) {
    const err = new Error('Jadwal kosong tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  return jadwal;
};

/**
 * List entri asisten dalam jadwal kosong dengan pagination, search, sort, filter status.
 */
export const getEntris = async (jadwalId, query) => {
  // Pastikan jadwal ada
  const jadwal = await JadwalKosong.findById(jadwalId).populate('dibuatOleh', 'nama idAsisten').lean();
  if (!jadwal) {
    const err = new Error('Jadwal kosong tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  const { page, limit, skip } = getPaginationParams(query);

  // Filter base pada jadwal ini
  const filter = { jadwalKosongRef: new mongoose.Types.ObjectId(jadwalId) };

  // Filter status
  if (query.statusPengisian) {
    filter.statusPengisian = query.statusPengisian;
  }

  // Build filter join ke Asisten melalui lookup
  const matchAsisten = {};
  if (query.search) {
    matchAsisten.$or = [
      { 'asisten.nama':       { $regex: query.search, $options: 'i' } },
      { 'asisten.idAsisten':  { $regex: query.search, $options: 'i' } },
      { 'asisten.npm':        { $regex: query.search, $options: 'i' } },
      { 'asisten.kelasSaatIni': { $regex: query.search, $options: 'i' } },
    ];
  }

  // Handle specific column filters
  if (query.nama) matchAsisten['asisten.nama'] = { $regex: query.nama, $options: 'i' };
  if (query.npm) matchAsisten['asisten.npm'] = { $regex: query.npm, $options: 'i' };
  if (query.idAsisten) matchAsisten['asisten.idAsisten'] = { $regex: query.idAsisten, $options: 'i' };
  if (query.kelasSaatIni) matchAsisten['asisten.kelasSaatIni'] = { $regex: query.kelasSaatIni, $options: 'i' };

  const ALLOWED_SORT = ['asisten.nama', 'asisten.idAsisten', 'asisten.npm', 'statusPengisian'];
  const sortField    = ALLOWED_SORT.includes(query.sortBy) ? query.sortBy : 'asisten.nama';
  const sortDir      = query.sortOrder === 'desc' ? -1 : 1;

  // Gunakan aggregation agar bisa sort & search berdasarkan field asisten
  const pipeline = [
    { $match: filter },
    {
      $lookup: {
        from:         'asistens',
        localField:   'asistenRef',
        foreignField: '_id',
        as:           'asisten',
        pipeline: [{ $project: { nama: 1, idAsisten: 1, npm: 1, kelasSaatIni: 1 } }],
      },
    },
    { $unwind: '$asisten' },
    ...(Object.keys(matchAsisten).length ? [{ $match: matchAsisten }] : []),
    {
      $facet: {
        data: [
          { $sort: { [sortField]: sortDir } },
          { $skip: skip },
          { $limit: limit },
        ],
        total: [{ $count: 'count' }],
      },
    },
  ];

  const [result] = await JadwalKosongEntri.aggregate(pipeline);
  const data  = result?.data  ?? [];
  const total = result?.total?.[0]?.count ?? 0;

  return { data, jadwal, meta: buildPaginationMeta(total, page, limit) };
};
