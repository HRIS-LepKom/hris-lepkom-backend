import mongoose from 'mongoose';

const { Schema } = mongoose;

// ─── Konstanta Jadwal ────────────────────────────────────────────────────────

export const HARI_LIST = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
export const SESI_LIST = [0, 1, 2, 3];

// ─── Sub-schema: Kursus Lepkom yang pernah diikuti ──────────────────────────

const kursusLepkomSchema = new Schema(
  {
    materiRef: {
      type: Schema.Types.ObjectId,
      ref: 'Materi',
      required: true,
    },
    namaMateri: { type: String, required: true, trim: true },
    tingkat:    { type: Number, required: true, enum: [1, 2, 3] },
  },
  { _id: false }
);

// ─── Sub-schema: Slot jadwal kosong (satu hari, banyak sesi) ────────────────

const slotJadwalSchema = new Schema(
  {
    hari: { type: String, required: true, enum: HARI_LIST },
    sesi: {
      type: [{ type: Number, enum: SESI_LIST }],
      default: [],
    },
  },
  { _id: false }
);

// ─── Sub-schema: Jadwal & Materi LEPKOM (untuk mahasiswa aktif) ─────────────

const jadwalMateriLepkomSchema = new Schema(
  {
    materiRef:  { type: Schema.Types.ObjectId, ref: 'Materi', required: true },
    namaMateri: { type: String, required: true, trim: true },
    tingkat:    { type: Number, required: true, enum: [1, 2, 3] },
    hari:       { type: String, required: true, enum: HARI_LIST },
    sesi:       { type: Number, required: true, enum: SESI_LIST },
  },
  { _id: false }
);

// ─── Schema: Header Jadwal Kosong ───────────────────────────────────────────

const jadwalKosongSchema = new Schema(
  {
    judul: {
      type: String,
      required: true,
      trim: true,
    },
    dibuatOleh: {
      type: Schema.Types.ObjectId,
      ref: 'Asisten',
      required: true,
    },
  },
  { timestamps: true }
);

// ─── Schema: Entri per-Asisten dalam satu Jadwal Kosong ─────────────────────

const jadwalKosongEntriSchema = new Schema(
  {
    jadwalKosongRef: {
      type: Schema.Types.ObjectId,
      ref: 'JadwalKosong',
      required: true,
    },
    asistenRef: {
      type: Schema.Types.ObjectId,
      ref: 'Asisten',
      required: true,
    },

    // Field A: Kursus Lepkom yang pernah diikuti
    kursusLepkom: {
      type: [kursusLepkomSchema],
      default: [],
    },

    // Field B: Jadwal kosong per hari-sesi
    jadwalKosong: {
      type: [slotJadwalSchema],
      default: [],
    },

    // Field C: Jadwal & Materi LEPKOM (khusus mahasiswa aktif, bukan NON CLASS)
    jadwalMateriLepkom: {
      type: jadwalMateriLepkomSchema,
      default: null,
    },

    // Status pengisian untuk memudahkan monitoring
    statusPengisian: {
      type: String,
      enum: ['belum_diisi', 'sebagian', 'lengkap'],
      default: 'belum_diisi',
    },
  },
  { timestamps: true }
);

// Satu asisten hanya boleh ada 1 entri per jadwal kosong
jadwalKosongEntriSchema.index(
  { jadwalKosongRef: 1, asistenRef: 1 },
  { unique: true }
);

// ─── Models ─────────────────────────────────────────────────────────────────

export const JadwalKosong      = mongoose.model('JadwalKosong',      jadwalKosongSchema);
export const JadwalKosongEntri = mongoose.model('JadwalKosongEntri', jadwalKosongEntriSchema);
