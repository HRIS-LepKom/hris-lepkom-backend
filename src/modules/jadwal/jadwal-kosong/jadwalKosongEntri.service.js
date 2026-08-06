import { JadwalKosongEntri, HARI_LIST, SESI_LIST } from '../../../models/jadwalKosong.model.js';
import Asisten from '../../../models/asisten.model.js';

// ─── Helper: hitung status pengisian ────────────────────────────────────────

const hitungStatus = (kursusLepkom, jadwalKosong) => {
  const adaKursus = kursusLepkom?.length > 0;
  const adaJadwal = jadwalKosong?.length > 0;
  if (!adaKursus && !adaJadwal) return 'belum_diisi';
  if (adaKursus  && adaJadwal)  return 'lengkap';
  return 'sebagian';
};

// ─── Helper: validasi kepemilikan entri ─────────────────────────────────────

const getEntriOrThrow = async (jadwalId, asistenId) => {
  const entri = await JadwalKosongEntri.findOne({
    jadwalKosongRef: jadwalId,
    asistenRef:      asistenId,
  });
  if (!entri) {
    const err = new Error('Entri jadwal kosong untuk asisten ini tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  return entri;
};

// ─── Kursus Lepkom ───────────────────────────────────────────────────────────

/**
 * Update kursus lepkom yang pernah diikuti asisten.
 * Hanya asisten yang bersangkutan yang boleh mengubah.
 * Asisten lain hanya boleh melihat (handled di controller).
 *
 * @param {string} jadwalId
 * @param {string} targetAsistenId  - Asisten pemilik entri
 * @param {string} requesterId      - Asisten yang melakukan request
 * @param {Array}  kursusLepkom     - Array { materiRef, namaMateri, tingkat }
 */
export const updateKursusLepkom = async (jadwalId, targetAsistenId, requesterId, kursusLepkom) => {
  if (targetAsistenId.toString() !== requesterId.toString()) {
    const err = new Error('Anda tidak diizinkan mengubah data asisten lain');
    err.statusCode = 403;
    throw err;
  }

  const entri = await getEntriOrThrow(jadwalId, targetAsistenId);
  entri.kursusLepkom  = kursusLepkom;
  entri.statusPengisian = hitungStatus(kursusLepkom, entri.jadwalKosong);
  await entri.save();
  return entri;
};

/**
 * Ambil data kursus (dan entri) untuk ditampilkan di modal — semua asisten bisa lihat.
 */
export const getEntriByAsisten = async (jadwalId, targetAsistenId) => {
  const entri = await JadwalKosongEntri.findOne({
    jadwalKosongRef: jadwalId,
    asistenRef:      targetAsistenId,
  }).lean();

  if (!entri) {
    const err = new Error('Entri tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  return entri;
};

// ─── Jadwal Kosong ───────────────────────────────────────────────────────────

/**
 * Update jadwal kosong asisten (hari + sesi).
 * Hanya asisten yang bersangkutan yang boleh mengubah.
 *
 * @param {string} jadwalId
 * @param {string} targetAsistenId
 * @param {string} requesterId
 * @param {Array}  jadwalKosong  - Array { hari, sesi[] }
 */
export const updateJadwalKosong = async (jadwalId, targetAsistenId, requesterId, jadwalKosong) => {
  if (targetAsistenId.toString() !== requesterId.toString()) {
    const err = new Error('Anda tidak diizinkan mengubah data asisten lain');
    err.statusCode = 403;
    throw err;
  }

  // Validasi: pastikan hari & sesi valid
  for (const slot of jadwalKosong) {
    if (!HARI_LIST.includes(slot.hari)) {
      const err = new Error(`Hari tidak valid: ${slot.hari}`);
      err.statusCode = 400;
      throw err;
    }
    for (const s of slot.sesi) {
      if (!SESI_LIST.includes(s)) {
        const err = new Error(`Sesi tidak valid: ${s}`);
        err.statusCode = 400;
        throw err;
      }
    }
  }

  const entri = await getEntriOrThrow(jadwalId, targetAsistenId);
  entri.jadwalKosong    = jadwalKosong;
  entri.statusPengisian = hitungStatus(entri.kursusLepkom, jadwalKosong);
  await entri.save();
  return entri;
};

// ─── Jadwal & Materi LEPKOM ──────────────────────────────────────────────────

/**
 * Update jadwal & materi LEPKOM.
 * Hanya untuk asisten yang kelasSaatIni !== 'NON CLASS' (mahasiswa aktif).
 * Hanya asisten yang bersangkutan yang boleh mengubah.
 *
 * @param {string} jadwalId
 * @param {string} targetAsistenId
 * @param {string} requesterId
 * @param {Object|null} jadwalMateriLepkom - { materiRef, namaMateri, tingkat, hari, sesi } atau null
 */
export const updateJadwalMateriLepkom = async (jadwalId, targetAsistenId, requesterId, jadwalMateriLepkom) => {
  if (targetAsistenId.toString() !== requesterId.toString()) {
    const err = new Error('Anda tidak diizinkan mengubah data asisten lain');
    err.statusCode = 403;
    throw err;
  }

  // Cek apakah asisten masih mahasiswa aktif
  const asisten = await Asisten.findById(targetAsistenId).select('kelasSaatIni').lean();
  if (!asisten) {
    const err = new Error('Asisten tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  const isNonClass = !asisten.kelasSaatIni ||
    asisten.kelasSaatIni.toUpperCase() === 'NON CLASS';

  if (isNonClass) {
    const err = new Error('Asisten NON CLASS tidak perlu mengisi Jadwal & Materi LEPKOM');
    err.statusCode = 400;
    throw err;
  }

  const entri = await getEntriOrThrow(jadwalId, targetAsistenId);
  entri.jadwalMateriLepkom = jadwalMateriLepkom;
  await entri.save();
  return entri;
};
