export const updateBiodataSchema = {
  type: 'object',
  additionalProperties: false,
  minProperties: 1,
  properties: {
    npm:                  { type: 'string' },
    namaCalas:            { type: 'string' },
    noKtp:                { type: 'string' },
    jenisKelamin:         { type: 'string', enum: ['L', 'P'] },
    kelas:                { type: 'string' },
    tanggalLahir:         { type: 'string' },
    tempatLahir:          { type: 'string' },
    noHp:                 { type: 'string' },
    alamatLengkap:        { type: 'string' },
    wilayah:              { type: 'string' },
    namaIbu:              { type: 'string' },
    namaAyah:             { type: 'string' },
    noHpOrtu:             { type: 'string' },
    kemampuanPribadi:     { type: 'string' },
    kemampuanIt:          { type: 'string' },
    pengalamanOrganisasi: { type: 'string' },
    pengalamanKerja:      { type: 'string' },
    asalSekolah:          { type: 'string' },
    jurusan:              { type: 'string' },
    kursusSemester: {
      type: 'object',
      properties: {
        semester1: { type: 'string', nullable: true },
        semester2: { type: 'string', nullable: true },
        semester3: { type: 'string', nullable: true },
        semester4: { type: 'string', nullable: true },
        semester5: { type: 'string', nullable: true },
        semester6: { type: 'string', nullable: true },
        semester7: { type: 'string', nullable: true },
      },
      additionalProperties: false
    }
  }
};
