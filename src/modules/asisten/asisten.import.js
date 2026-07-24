import * as XLSX           from 'xlsx';
import Asisten            from '../../models/asisten.model.js';
import { getDefaultPassword } from '../../utils/defaultPassword.js';
import { sanitizeAsisten }    from './asisten.service.js';


// Kolom wajib yang harus ada di file import
const REQUIRED_COLS = ['idAsisten', 'npm', 'nama'];

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
  const missing = REQUIRED_COLS.filter((col) => !String(row[col] ?? '').trim());
  if (missing.length) {
    return { ok: false, reason: `Baris ${index + 2}: kolom wajib kosong — ${missing.join(', ')}` };
  }
  return {
    ok:   true,
    data: {
      idAsisten:    String(row.idAsisten).trim(),
      npm:          String(row.npm).trim(),
      nama:         String(row.nama).trim(),
      email:        row.email    ? String(row.email).trim().toLowerCase()    : undefined,
      kelasSaatIni: row.kelasSaatIni ? String(row.kelasSaatIni).trim() : undefined,
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

    try {
      const asisten = await Asisten.create({
        ...parsed.data,
        password:           getDefaultPassword(),
        wajibGantiPassword: true,
      });
      berhasil.push(sanitizeAsisten(asisten));
    } catch (e) {
      const alasan = e.code === 11000
        ? `Duplikat — idAsisten atau npm sudah terdaftar`
        : e.message;
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
