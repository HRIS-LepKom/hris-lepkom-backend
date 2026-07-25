export const createAnnouncementSchema = {
  type: 'object',
  required: ['judul', 'konten'],
  additionalProperties: false,
  properties: {
    judul: { type: 'string', minLength: 3 },
    konten: { type: 'string', minLength: 3 },
    targetGelombang: { type: ['number', 'null'] },
    targetTahap: {
      type: ['string', 'null'],
      enum: [
        'registrasi',
        'screening',
        'biodata_dokumen',
        'ujian_praktek',
        'ujian_project',
        'keputusan_akhir',
        'selesai',
        null
      ]
    },
    isActive: { type: 'boolean' }
  }
};

export const updateAnnouncementSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    judul: { type: 'string', minLength: 3 },
    konten: { type: 'string', minLength: 3 },
    targetGelombang: { type: ['number', 'null'] },
    targetTahap: {
      type: ['string', 'null'],
      enum: [
        'registrasi',
        'screening',
        'biodata_dokumen',
        'ujian_praktek',
        'ujian_project',
        'keputusan_akhir',
        'selesai',
        null
      ]
    },
    isActive: { type: 'boolean' }
  }
};
