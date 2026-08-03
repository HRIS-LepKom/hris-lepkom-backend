import xlsx from 'xlsx';
import Calas from '../../../models/calas.model.js';
import { buildSmartFilter } from '../../../utils/buildSmartFilter.js';
import { sanitizeCalas } from './management.service.js';

export const exportCalasToExcel = async (query) => {
  const filterConfigs = {
    jurusan:           { type: 'string' },
    semesterKursusDel: { type: 'boolean' },
    kelas:             { type: 'string' },
  };

  const filter = buildSmartFilter(query, filterConfigs);
  
  if (query.tahapSaatIni) filter['statusRekrutmen.tahapSaatIni'] = query.tahapSaatIni;
  if (query.hasil) filter['statusRekrutmen.hasil'] = query.hasil;
  if (query.isBanned !== undefined) filter.isBanned = query.isBanned === 'true';
  if (query.search) {
    filter.$or = [
      { namaCalas:  { $regex: query.search, $options: 'i' } },
      { idCalas:    { $regex: query.search, $options: 'i' } },
      { npm:        { $regex: query.search, $options: 'i' } },
      { emailCalas: { $regex: query.search, $options: 'i' } },
    ];
  }

  const sort = {};
  if (query.sortField) {
    sort[query.sortField] = query.sortOrder === 'z-a' ? -1 : 1;
  } else {
    sort.createdAt = -1;
  }

  const pipeline = [
    { $match: filter },
    {
      $addFields: {
        skorAkhirNilai: {
          $let: {
            vars: {
              avgScore: {
                $avg: [
                  { $cond: [{ $gt: ["$nilaiUjian.praktek.total", 0] }, "$nilaiUjian.praktek.total", null] },
                  { $cond: [{ $gt: ["$nilaiUjian.project.total", 0] }, "$nilaiUjian.project.total", null] }
                ]
              }
            },
            in: { $cond: [{ $eq: ["$$avgScore", null] }, null, "$$avgScore"] }
          }
        }
      }
    },
    { $project: { password: 0, refreshToken: 0, resetPasswordToken: 0 } },
    { $sort: sort }
  ];

  const rawData = await Calas.aggregate(pipeline);
  const sanitizedData = rawData.map(sanitizeCalas);

  // Formatting for Excel
  const excelData = sanitizedData.map((calas, index) => ({
    No: index + 1,
    ID: calas.idCalas,
    NPM: calas.npm,
    Nama: calas.namaCalas,
    Email: calas.emailCalas,
    Kelas: calas.kelas,
    Jurusan: calas.jurusan,
    Semester: calas.semesterKursusDel,
    Gelombang: calas.gelombangDaftar,
    'Tahap Saat Ini': calas.statusRekrutmen?.tahapSaatIni || '-',
    'Hasil Tahap': calas.statusRekrutmen?.hasil || '-',
    'Alasan Tidak Lolos': calas.statusRekrutmen?.alasanTidakLolos || '-',
    'Skor Akhir Penilaian': calas.skorAkhirNilai !== null ? calas.skorAkhirNilai.toFixed(2) : 'Belum Ada',
    'Terblokir': calas.isBanned ? 'Ya' : 'Tidak',
    'Tanggal Daftar': calas.createdAt ? new Date(calas.createdAt).toLocaleDateString('id-ID') : '-',
  }));

  const worksheet = xlsx.utils.json_to_sheet(excelData);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Data Calas');

  // Return buffer
  return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};
