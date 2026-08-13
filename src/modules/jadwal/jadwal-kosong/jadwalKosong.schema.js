// ─── Sub-schemas reusable ────────────────────────────────────────────────────

const HARI_ENUM    = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
const SESI_ENUM    = [0, 1, 2, 3];
const TINGKAT_ENUM = [1, 2, 3];

// ─── Dashboard ───────────────────────────────────────────────────────────────

/** POST /api/jadwal/kosong */
export const createSchema = {
  type: 'object',
  required: ['judul'],
  additionalProperties: false,
  properties: {
    judul: { type: 'string', minLength: 3, maxLength: 150 },
  },
};

/** PATCH /api/jadwal/kosong/:id */
export const updateJudulSchema = {
  type: 'object',
  required: ['judul'],
  additionalProperties: false,
  properties: {
    judul: { type: 'string', minLength: 3, maxLength: 150 },
  },
};

// ─── Entri: Kursus Lepkom ────────────────────────────────────────────────────

const kursusItemSchema = {
  type: 'object',
  required: ['materiRef', 'namaMateri', 'tingkat'],
  additionalProperties: false,
  properties: {
    materiRef:  { type: 'string', minLength: 1 },
    namaMateri: { type: 'string', minLength: 1, maxLength: 150 },
    tingkat:    { type: 'integer', enum: TINGKAT_ENUM },
  },
};

/** PATCH /api/jadwal/kosong/:id/asisten/:asistenId/kursus */
export const updateKursusSchema = {
  type: 'object',
  required: ['kursusLepkom'],
  additionalProperties: false,
  properties: {
    kursusLepkom: {
      type: 'array',
      items: kursusItemSchema,
    },
  },
};

// ─── Entri: Jadwal Kosong ────────────────────────────────────────────────────

const slotJadwalSchema = {
  type: 'object',
  required: ['hari', 'sesi'],
  additionalProperties: false,
  properties: {
    hari: { type: 'string', enum: HARI_ENUM },
    sesi: {
      type: 'array',
      items: { type: 'integer', enum: SESI_ENUM },
      minItems: 1,
      uniqueItems: true,
    },
  },
};

/** PATCH /api/jadwal/kosong/:id/asisten/:asistenId/jadwal */
export const updateJadwalSchema = {
  type: 'object',
  required: ['jadwalKosong'],
  additionalProperties: false,
  properties: {
    jadwalKosong: {
      type: 'array',
      items: slotJadwalSchema,
    },
  },
};

// ─── Entri: Jadwal & Materi LEPKOM ──────────────────────────────────────────

/** PATCH /api/jadwal/kosong/:id/asisten/:asistenId/jadwal-materi */
export const updateJadwalMateriSchema = {
  type: 'object',
  required: ['jadwalMateriLepkom'],
  additionalProperties: false,
  properties: {
    // null diizinkan untuk menghapus/mengosongkan data
    jadwalMateriLepkom: {
      oneOf: [
        { type: 'null' },
        {
          type: 'object',
          required: ['materiRef', 'namaMateri', 'tingkat', 'hari', 'sesi'],
          additionalProperties: false,
          properties: {
            materiRef:  { type: 'string', minLength: 1 },
            namaMateri: { type: 'string', minLength: 1, maxLength: 150 },
            tingkat:    { type: 'integer', enum: TINGKAT_ENUM },
            hari:       { type: 'string', enum: HARI_ENUM },
            sesi:       { type: 'integer', enum: SESI_ENUM },
          },
        },
      ],
    },
  },
};
