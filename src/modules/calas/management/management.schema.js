export const createSchema = {
  type: 'object',
  required: [
    'idCalas', 'npm', 'namaCalas', 'kelas', 'jenisKelamin',
    'noKtp', 'noHp', 'emailCalas', 'tempatLahir', 'tanggalLahir',
    'alamatLengkap', 'asalSekolah', 'jurusan', 'ipk', 'noHpOrtu'
  ],
  additionalProperties: false,
  properties: {
    idCalas:                  { type: 'string', minLength: 1 },
    gelombangDaftar:          { type: 'string' },
    npm:                      { type: 'string', minLength: 1 },
    namaCalas:                { type: 'string', minLength: 1 },
    kelas:                    { type: 'string', minLength: 1 },
    jenisKelamin:             { type: 'string', enum: ['L', 'P'] },
    noKtp:                    { type: 'string', minLength: 1 },
    noHp:                     { type: 'string', minLength: 1 },
    emailCalas:               { type: 'string', pattern: "^\\S+@\\S+\\.\\S+$" },
    tempatLahir:              { type: 'string', minLength: 1 },
    tanggalLahir:             { type: 'string', minLength: 1 },
    alamatLengkap:            { type: 'string', minLength: 1 },
    asalSekolah:              { type: 'string', minLength: 1 },
    wilayah:                  { type: 'string' },
    jurusan:                  { type: 'string', minLength: 1 },
    ipk:                      { type: 'number', minimum: 0, maximum: 4 },
    namaIbu:                  { type: 'string' },
    namaAyah:                 { type: 'string' },
    noHpOrtu:                 { type: 'string', minLength: 1 },
    kemampuanPribadi:         { type: 'string' },
    kemampuanIt:              { type: 'string' },
    pengalamanOrganisasi:     { type: 'string' },
    pengalamanKerja:          { type: 'string' },
  },
};

export const updateSchema = {
  type: 'object',
  additionalProperties: false,
  minProperties: 1,
  properties: {
    idCalas:    { type: 'string', minLength: 1 },
    npm:        { type: 'string', minLength: 1 },
    namaCalas:  { type: 'string', minLength: 1 },
    kelas:      { type: 'string', minLength: 1 },
    emailCalas: { type: 'string', pattern: "^\\S+@\\S+\\.\\S+$" },
  },
};

export const updateTimelineSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['tahapSaatIni', 'hasil'],
  properties: {
    tahapSaatIni: {
      type: 'string',
      enum: ['registrasi', 'screening', 'biodata_dokumen', 'ujian_praktek', 'ujian_project', 'keputusan_akhir', 'selesai']
    },
    hasil: {
      type: 'string',
      enum: ['proses', 'lolos', 'tidak_lolos']
    },
    alasanTidakLolos: {
      type: 'string',
      enum: ['tidak_lolos_screening', 'tidak_hadir_ujian', 'tidak_lolos_penilaian', 'ditolak_rapat_akhir', 'lainnya']
    },
    deskripsiPenolakan: {
      type: 'string',
      minLength: 1,
    }
  }
};

export const deleteSchema = {
  type: 'object',
  required: ['password'],
  additionalProperties: false,
  properties: {
    password: { type: 'string', minLength: 1 }
  }
};

export const rejectSchema = {
  type: 'object',
  required: ['alasanTidakLolos'],
  additionalProperties: false,
  properties: {
    alasanTidakLolos: {
      type: 'string',
      enum: ['tidak_lolos_screening', 'tidak_hadir_ujian', 'tidak_lolos_penilaian', 'ditolak_rapat_akhir', 'lainnya']
    },
    deskripsiPenolakan: {
      type: 'string',
      minLength: 1,
    }
  }
};