import * as XLSX           from 'xlsx';
import Asisten            from '../../models/asisten.model.js';
import { getDefaultPassword } from '../../utils/defaultPassword.js';
import { sanitizeAsisten }    from './asisten.service.js';


// Kolom wajib yang harus ada di file import
const REQUIRED_COLS = ['idAsisten', 'npm', 'nama', 'kelasSaatIni'];

// Header template kosong untuk download
const TEMPLATE_HEADERS = ['idAsisten', 'npm', 'nama', 'email', 'kelasSaatIni'];

// ─── Parsers ─────────────────────────────────────────────────────────────────

const parseBuffer = (buffer, mimetype) => {
  const type = mimetype === 'text/csv' ? 'string' : 'buffer';
  const input = type === 'string' ? buffer.toString('utf-8') : buffer;
  const wb    = XLSX.read(input, { type });
  const ws    = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(ws, { defval: '' });
};

const parseRow = (row, index) => {
  const normRow = {};
  for (const k in row) {
    const key = k.trim().toLowerCase().replace(/\s+/g, '');
    normRow[key] = row[k];
  }

  const idAsisten = normRow.idasisten || normRow.id;
  const npm = normRow.npm;
  const nama = normRow.nama || normRow.namaasisten;
  const email = normRow.email;
  const kelasSaatIni = normRow.kelassaatini || normRow.kelas;

  const missing = [];
  if (!idAsisten) missing.push('idAsisten');
  if (!npm) missing.push('npm');
  if (!nama) missing.push('nama');
  if (!kelasSaatIni) missing.push('kelasSaatIni');

  if (missing.length > 0) {
    return { ok: false, reason: `Baris ${index + 2}: kolom wajib kosong — ${missing.join(', ')}` };
  }

  return {
    ok:   true,
    data: {
      idAsisten:    String(idAsisten).trim(),
      npm:          String(npm).trim(),
      nama:         String(nama).trim(),
      email:        email ? String(email).trim().toLowerCase() : undefined,
      kelasSaatIni: String(kelasSaatIni).trim(),
    },
  };
};

export const importFromFile = async (file) => {
  const rows = parseBuffer(file.buffer, file.mimetype);

  if (!rows.length) {
    const err = new Error('File kosong atau tidak memiliki data');
    err.statusCode = 400;
    throw err;
  }

  const berhasil = [];
  const gagal    = [];

  for (const [i, row] of rows.entries()) {
    const parsed = parseRow(row, i);
    if (!parsed.ok) { gagal.push({ baris: i + 2, alasan: parsed.reason }); continue; }

    // 1. Pengecekan duplikat terlebih dahulu sesuai aturan yang diinginkan
    const exist = await Asisten.exists({
      $or: [{ idAsisten: parsed.data.idAsisten }, { npm: parsed.data.npm }]
    });

    if (exist) {
      gagal.push({ baris: i + 2, alasan: 'Dilewati: idAsisten atau npm sudah terdaftar di database' });
      continue;
    }

    try {
      const asisten = await Asisten.create({
        ...parsed.data,
        password:           getDefaultPassword(),
        wajibGantiPassword: true,
      });
      berhasil.push(sanitizeAsisten(asisten));
    } catch (e) {
      let alasan = e.message;
      if (e.code === 11000) {
        const dupField = Object.keys(e.keyPattern || {})[0] || 'data';
        alasan = `Duplikat — ${dupField} sudah terdaftar`;
      }
      gagal.push({ baris: i + 2, alasan });
    }
  }

  return { total: rows.length, berhasil: berhasil.length, gagal };
};

export const generateImportTemplate = () => {
  const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template');
  return XLSX.write(wb, { type: 'buffer', bookType: 'csv' });
};
