import * as XLSX from 'xlsx';
import Calas from '../../../models/calas.model.js';
import { getDefaultPassword } from '../../../utils/defaultPassword.js';
import { sanitizeCalas } from './management.service.js';

const REQUIRED_COLS = [
  'idCalas', 'npm', 'namaCalas', 'kelas', 'jenisKelamin',
  'noKtp', 'noHp', 'emailCalas', 'tempatLahir', 'tanggalLahir',
  'alamatLengkap', 'asalSekolah', 'jurusan', 'ipk', 'noHpOrtu'
];

const TEMPLATE_HEADERS = [
  'idCalas', 'npm', 'namaCalas', 'kelas', 'jenisKelamin (L/P)',
  'noKtp', 'noHp', 'emailCalas', 'tempatLahir', 'tanggalLahir',
  'alamatLengkap', 'asalSekolah', 'wilayah', 'jurusan', 'ipk',
  'namaIbu', 'namaAyah', 'noHpOrtu', 'kemampuanPribadi',
  'kemampuanIt', 'pengalamanOrganisasi', 'pengalamanKerja',
  'semester1', 'semester2', 'semester3', 'semester4',
  'semester5', 'semester6', 'semester7', 'SemesterKursusDel'
];

const parseBuffer = (buffer, mimetype) => {
  const type = mimetype === 'text/csv' ? 'string' : 'buffer';
  const input = type === 'string' ? buffer.toString('utf-8') : buffer;
  const wb = XLSX.read(input, { type });
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(ws, { defval: '' });
};

// Normalisasi jenisKelamin dari berbagai kemungkinan input excel ke enum model ("L" / "P")
const normalizeJenisKelamin = (raw) => {
  const v = String(raw).trim().toLowerCase();
  if (v === 'l' || v === 'laki-laki' || v === 'laki laki') return 'L';
  if (v === 'p' || v === 'perempuan') return 'P';
  return null;
};

const parseRow = (rawRow, index) => {
  // Normalize row keys to handle variations in Excel headers
  const row = { ...rawRow };
  
  // Handle 'Tempat, Tanggal Lahir' if it exists
  if (row['Tempat, Tanggal Lahir'] && !row['tempatLahir'] && !row['tanggalLahir']) {
    const ttl = String(row['Tempat, Tanggal Lahir']);
    if (ttl.includes(',')) {
      const parts = ttl.split(',');
      row.tempatLahir = parts[0].trim();
      row.tanggalLahir = parts.slice(1).join(',').trim();
    } else {
      row.tempatLahir = ttl.trim();
      row.tanggalLahir = '';
    }
  }

  // Handle 'Pengalaman Kerja' if it exists
  if (row['Pengalaman Kerja'] && !row['pengalamanKerja']) {
    row.pengalamanKerja = row['Pengalaman Kerja'];
  }
  
  // Handle 'jenisKelamin (L/P)' vs 'jenisKelamin'
  if (row['jenisKelamin (L/P)'] && !row['jenisKelamin']) {
    row.jenisKelamin = row['jenisKelamin (L/P)'];
  }

  const missing = REQUIRED_COLS.filter((col) => !String(row[col] ?? '').trim());
  if (missing.length) {
    return { ok: false, reason: `Baris ${index + 2}: kolom wajib kosong — ${missing.join(', ')}` };
  }

  const jenisKelamin = normalizeJenisKelamin(row.jenisKelamin);
  if (!jenisKelamin) {
    return { ok: false, reason: `Baris ${index + 2}: jenisKelamin harus L/P atau Laki-laki/Perempuan.` };
  }

  const ipk = Number(row.ipk);
  if (isNaN(ipk) || ipk < 0 || ipk > 4) {
    return { ok: false, reason: `Baris ${index + 2}: ipk tidak valid (harus angka 0-4).` };
  }

  const semesterKursusDelRaw = String(row.SemesterKursusDel ?? '').trim();
  const isKursusDelete = semesterKursusDelRaw.length > 0;

  return {
    ok: true,
    data: {
      idCalas:          String(row.idCalas).trim(),
      npm:              String(row.npm).trim(),
      namaCalas:        String(row.namaCalas).trim(),
      kelas:            String(row.kelas).trim(),
      jenisKelamin,
      noKtp:            String(row.noKtp).trim(),
      noHp:             String(row.noHp).trim(),
      emailCalas:       String(row.emailCalas).trim().toLowerCase(),
      tempatLahir:      String(row.tempatLahir).trim(),
      tanggalLahir:     String(row.tanggalLahir).trim(),
      alamatLengkap:    String(row.alamatLengkap).trim(),
      asalSekolah:      String(row.asalSekolah).trim(),
      wilayah:          row.wilayah ? String(row.wilayah).trim() : undefined,
      jurusan:          String(row.jurusan).trim(),
      ipk,
      namaIbu:          row.namaIbu ? String(row.namaIbu).trim() : undefined,
      namaAyah:         row.namaAyah ? String(row.namaAyah).trim() : undefined,
      noHpOrtu:         String(row.noHpOrtu).trim(),
      kemampuanPribadi: row.kemampuanPribadi ? String(row.kemampuanPribadi).trim() : undefined,
      kemampuanIt:      row.kemampuanIt ? String(row.kemampuanIt).trim() : undefined,
      pengalamanOrganisasi: row.pengalamanOrganisasi ? String(row.pengalamanOrganisasi).trim() : undefined,
      pengalamanKerja:  row.pengalamanKerja ? String(row.pengalamanKerja).trim() : undefined,
      kursusSemester: {
        semester1: row.semester1 ? String(row.semester1).trim() : null,
        semester2: row.semester2 ? String(row.semester2).trim() : null,
        semester3: row.semester3 ? String(row.semester3).trim() : null,
        semester4: row.semester4 ? String(row.semester4).trim() : null,
        semester5: row.semester5 ? String(row.semester5).trim() : null,
        semester6: row.semester6 ? String(row.semester6).trim() : null,
        semester7: row.semester7 ? String(row.semester7).trim() : null,
      },
      isKursusDelete,
      SemesterKursusDel: isKursusDelete ? semesterKursusDelRaw : undefined,
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
        password:              getDefaultPassword(),
        wajibGantiPassword:    true,
        isBiodataEmailSending: true,
        daftarVia:             'asisten',
        didaftarkanOleh:       asistenId,
        gelombangDaftar:       gelombangAktif || null,
        statusRekrutmen: {
          tahapSaatIni: 'biodata_dokumen',
          hasil: 'proses',
          alasanTidakLolos: null,
        },
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