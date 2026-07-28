import * as XLSX from 'xlsx';
import Asisten from '../../models/asisten.model.js';

/**
 * Generate Excel (.xlsx) buffer containing all asisten data
 */
export const generateExportExcel = async () => {
  // Fetch all asisten sorted by nama
  const asistenList = await Asisten.find().sort({ nama: 1 }).lean();

  // Map to the required export structure
  // Based on template: idAsisten, npm, nama, email, kelasSaatIni
  const data = asistenList.map(a => ({
    'ID Asisten': a.idAsisten || '',
    'NPM': a.npm || '',
    'Nama': a.nama || '',
    'Email': a.email || '',
    'Kelas': a.kelasSaatIni || '',
    'Role': a.role || '',
    'Status Aktif': a.isActive ? 'Aktif' : 'Nonaktif',
  }));

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(data);

  // Set column widths
  ws['!cols'] = [
    { wch: 15 }, // ID Asisten
    { wch: 12 }, // NPM
    { wch: 30 }, // Nama
    { wch: 30 }, // Email
    { wch: 15 }, // Kelas
    { wch: 20 }, // Role
    { wch: 15 }, // Status
  ];

  // Create workbook and append worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data Asisten');

  // Write to buffer
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return buffer;
};
