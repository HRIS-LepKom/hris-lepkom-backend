export const submitPenilaianPraktekSchema = {
  type: 'object',
  required: ['calasId', 'examSessionId', 'deskripsi', 'kriteria'],
  additionalProperties: false,
  properties: {
    calasId:       { type: 'string', minLength: 1 },
    examSessionId: { type: 'string', minLength: 1 },
    deskripsi:     { type: 'string', minLength: 1 },
    kriteria: {
      type: 'object',
      required: ['konsep', 'eksekusi', 'analisa', 'klarifikasi'],
      additionalProperties: false,
      properties: {
        konsep:      { type: 'number', minimum: 0, maximum: 100 },
        eksekusi:    { type: 'number', minimum: 0, maximum: 100 },
        analisa:     { type: 'number', minimum: 0, maximum: 100 },
        klarifikasi: { type: 'number', minimum: 0, maximum: 100 },
      }
    }
  }
};

export const submitPenilaianProjectSchema = {
  type: 'object',
  required: ['calasId', 'examSessionId', 'deskripsi', 'kriteria'],
  additionalProperties: false,
  properties: {
    calasId:       { type: 'string', minLength: 1 },
    examSessionId: { type: 'string', minLength: 1 },
    deskripsi:     { type: 'string', minLength: 1 },
    kriteria: {
      type: 'object',
      required: ['penguasaan', 'kreatifitas', 'kontribusi', 'presentasi', 'motivasi', 'interpersonal', 'integritas', 'potensi'],
      additionalProperties: false,
      properties: {
        penguasaan:    { type: 'number', minimum: 0, maximum: 100 },
        kreatifitas:   { type: 'number', minimum: 0, maximum: 100 },
        kontribusi:    { type: 'number', minimum: 0, maximum: 100 },
        presentasi:    { type: 'number', minimum: 0, maximum: 100 },
        motivasi:      { type: 'number', minimum: 0, maximum: 100 },
        interpersonal: { type: 'number', minimum: 0, maximum: 100 },
        integritas:    { type: 'number', minimum: 0, maximum: 100 },
        potensi:       { type: 'number', minimum: 0, maximum: 100 },
      }
    }
  }
};

export const getCalasToScoreSchema = {
  type: 'object',
  required: ['tanggal', 'jenisUjian'],
  additionalProperties: true,
  properties: {
    tanggal: { type: 'string' },
    jenisUjian: { type: 'string', enum: ['praktek', 'project'] },
    search: { type: 'string' }
  }
};
