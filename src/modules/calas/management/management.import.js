import * as XLSX from 'xlsx';
import Calas from '../../../models/calas.model.js';
import { getDefaultPassword } from '../../../utils/defaultPassword.js';
import { sanitizeCalas } from './management.service.js';
import dayjs from 'dayjs';

const REQUIRED_COLS = [
  'idCalas', 'npm', 'namaCalas', 'kelas', 'jenisKelamin',
  'noKtp', 'noHp', 'emailCalas', 'tempatLahir', 'tanggalLahir',
  'alamatLengkap', 'asalSekolah', 'jurusan', 'ipk', 'noHpOrtu'
];

const TEMPLATE_HEADERS = [
  'idCalas', 'npm', 'namaCalas', 'kelas', 'jenisKelamin',
  'noKtp', 'noHp', 'emailCalas', 'tempatLahir', 'tanggalLahir (YYYY-MM-DD)',
  'alamatLengkap', 'asalSekolah', 'wilayah', 'jurusan', 'ipk',
  'namaIbu', 'namaAyah', 'noHpOrtu', 'kemampuanPribadi',
  'kemampuanIt', 'pengalamanOrganisasi', 'pengalamanKerja'
];

const parseBuffer = (buffer, mimetype) => {
  const type = mimetype === 'text/csv' ? 'string' : 'buffer';
  const input = type === 'string' ? buffer.toString('utf-8') : buffer;
  const wb = XLSX.read(input, { type });
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(ws, { defval: '' });
};

const parseRow = (row, index) => {
  const missing = REQUIRED_COLS.filter((col) => !String(row[col] ?? '').trim() && !col.includes('tanggalLahir'));
  const tanggalKey = Object.keys(row).find(k => k.includes('tanggalLahir')) || 'tanggalLahir';
  if (!String(row[tanggalKey] ?? '').trim()) {
    missing.push('tanggalLahir');
  }

  if (missing.length) {
    return { ok: false, reason: `Baris ${index + 2}: kolom wajib kosong — ${missing.join(', ')}` };
  }

  const parsedDate = dayjs(row[tanggalKey]).toDate();
  if (isNaN(parsedDate.getTime())) {
    return { ok: false, reason: `Baris ${index + 2}: format tanggalLahir tidak valid.` };
  }

  return {
    ok: true,
    data: {
      idCalas:          String(row.idCalas).trim(),
      npm:              String(row.npm).trim(),
      namaCalas:        String(row.namaCalas).trim(),
      kelas:            String(row.kelas).trim(),
      jenisKelamin:     String(row.jenisKelamin).trim(),
      noKtp:            String(row.noKtp).trim(),
      noHp:             String(row.noHp).trim(),
      emailCalas:       String(row.emailCalas).trim().toLowerCase(),
      tempatLahir:      String(row.tempatLahir).trim(),
      tanggalLahir:     parsedDate,
      alamatLengkap:    String(row.alamatLengkap).trim(),
      asalSekolah:      String(row.asalSekolah).trim(),
      wilayah:          row.wilayah ? String(row.wilayah).trim() : undefined,
      jurusan:          String(row.jurusan).trim(),
      ipk:              Number(row.ipk) || 0,
      namaIbu:          row.namaIbu ? String(row.namaIbu).trim() : undefined,
      namaAyah:         row.namaAyah ? String(row.namaAyah).trim() : undefined,
      noHpOrtu:         String(row.noHpOrtu).trim(),
      kemampuanPribadi: row.kemampuanPribadi ? String(row.kemampuanPribadi).trim() : undefined,
      kemampuanIt:      row.kemampuanIt ? String(row.kemampuanIt).trim() : undefined,
      pengalamanOrganisasi: row.pengalamanOrganisasi ? String(row.pengalamanOrganisasi).trim() : undefined,
      pengalamanKerja:  row.pengalamanKerja ? String(row.pengalamanKerja).trim() : undefined,
    },
  };
};

export const importFromFile = async (file, asistenId, gelombangAktif) => {
  const rows = parseBuffer(file.buffer, file.mimetype);

  if (!rows.length) {
    const err = new Error('File kosong atau tidak memiliki data');
    err.statusCode = 400;
    throw err;
  }

  const berhasil = [];
  const gagal = [];

  for (const [i, row] of rows.entries()) {
    const parsed = parseRow(row, i);
    if (!parsed.ok) { gagal.push({ baris: i + 2, alasan: parsed.reason }); continue; }

    try {
      const calas = await Calas.create({
        ...parsed.data,
        password:           getDefaultPassword(),
        wajibGantiPassword: true,
        daftarVia:          'asisten',
        didaftarkanOleh:    asistenId,
        gelombangDaftar:    gelombangAktif || null,
      });
      berhasil.push(sanitizeCalas(calas));
    } catch (e) {
      const alasan = e.code === 11000
        ? `Duplikat — idCalas, npm, noKtp, noHp, atau emailCalas sudah terdaftar`
        : e.message;
      gagal.push({ baris: i + 2, alasan });
    }
  }

  return { total: rows.length, berhasil: berhasil.length, gagal };
};

export const generateImportTemplate = () => {
  const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'TemplateCalas');
  return XLSX.write(wb, { type: 'buffer', bookType: 'csv' });
};
