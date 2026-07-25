const KATEGORI_ENUM = ['materi', 'teknis', 'kepribadian', 'motivasi'];

// ─── Create ───────────────────────────────────────────────────────────────────
export const createSchema = {
  type: 'object',
  required: ['judulPertanyaan', 'kategori', 'tingkat'],
  additionalProperties: false,
  properties: {
    judulPertanyaan: { type: 'string', minLength: 1 },
    deskripsi:       { type: 'string' },
    kategori:        { type: 'string', enum: KATEGORI_ENUM },
    tingkat:         { type: 'integer', enum: [1, 2, 3] },
    namaMateri:      { type: 'string' },
  },
};

// ─── Update ───────────────────────────────────────────────────────────────────
export const updateSchema = {
  type: 'object',
  additionalProperties: false,
  minProperties: 1,
  properties: {
    judulPertanyaan: { type: 'string', minLength: 1 },
    deskripsi:       { type: 'string' },
    kategori:        { type: 'string', enum: KATEGORI_ENUM },
    tingkat:         { type: 'integer', enum: [1, 2, 3] },
    namaMateri:      { type: 'string' },
  },
};
