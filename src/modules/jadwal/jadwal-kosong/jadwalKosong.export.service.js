import xlsx from 'xlsx';
import { JadwalKosong, JadwalKosongEntri, HARI_LIST } from '../../../models/jadwalKosong.model.js';

// ─── Konstanta jam sesi ──────────────────────────────────────────────────────

const JAM_SESI_REGULER = {
  0: '07.30 - 10.00',
  1: '10.00 - 12.30',
  2: '13.00 - 15.30',
  3: '15.45 - 18.15',
};

const JAM_SESI_JUMAT = {
  0: '07.00 - 09.00',
  1: '09.00 - 11.30',
  2: '13.30 - 16.00',
  3: '16.00 - 18.30',
};

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

// ─── Format jadwal kosong jadi string yang terbaca ──────────────────────────

const formatJadwalKosong = (jadwalKosong) => {
  if (!jadwalKosong || jadwalKosong.length === 0) return '-';

  // Cek full kosong (semua hari, semua sesi)
  const allHari  = HARI_LIST.every((h) => jadwalKosong.some((j) => j.hari === h));
  const allSesi  = jadwalKosong.every((j) => j.sesi?.length === 4);
  if (allHari && allSesi) return 'Full Kosong (Senin - Sabtu, Sesi 0-3)';

  return jadwalKosong
    .map((slot) => {
      const sesiStr = slot.sesi?.length
        ? `Sesi ${slot.sesi.join(', ')}`
        : 'Semua Sesi';
      return `${capitalize(slot.hari)} (${sesiStr})`;
    })
    .join('; ');
};

// ─── Format kursus lepkom jadi string ────────────────────────────────────────

const formatKursus = (kursusLepkom) => {
  if (!kursusLepkom || kursusLepkom.length === 0) return '-';
  return kursusLepkom
    .map((k) => `${k.namaMateri} (Tingkat ${k.tingkat})`)
    .join(', ');
};

// ─── Format jadwal materi lepkom ─────────────────────────────────────────────

const formatJadwalMateri = (jml, isNonClass) => {
  if (isNonClass) return 'NON CLASS';
  if (!jml) return '-';
  const jam = jml.hari === 'jumat' ? JAM_SESI_JUMAT[jml.sesi] : JAM_SESI_REGULER[jml.sesi];
  return `${jml.namaMateri} (Tingkat ${jml.tingkat}) - ${capitalize(jml.hari)} Sesi ${jml.sesi} (${jam})`;
};

// ─── Export utama ─────────────────────────────────────────────────────────────

export const generateExportExcel = async (jadwalId) => {
  // Ambil header jadwal
  const jadwal = await JadwalKosong.findById(jadwalId)
    .populate('dibuatOleh', 'nama idAsisten')
    .lean();
  if (!jadwal) {
    const err = new Error('Jadwal kosong tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  // Ambil semua entri dengan data asisten
  const entris = await JadwalKosongEntri.find({ jadwalKosongRef: jadwalId })
    .populate('asistenRef', 'idAsisten npm nama kelasSaatIni')
    .lean();

  const wb = xlsx.utils.book_new();

  // ─── Sheet 1: Data Jadwal Kosong ─────────────────────────────────────────

  const headers = [
    'NO.',
    'ID ASISTEN',
    'NPM',
    'NAMA',
    'KELAS SAAT INI',
    'KURSUS LEPKOM (PERNAH DIIKUTI)',
    'JADWAL KOSONG (DI LUAR JAM PERKULIAHAN & PRAKTIKUM)',
    'JADWAL DAN MATERI LEPKOM',
    'STATUS PENGISIAN',
  ];

  const rows = entris.map((e, i) => {
    const a        = e.asistenRef;
    const isNonClass = !a?.kelasSaatIni || a.kelasSaatIni.toUpperCase() === 'NON CLASS';
    return [
      i + 1,
      a?.idAsisten  ?? '-',
      a?.npm         ?? '-',
      a?.nama        ?? '-',
      a?.kelasSaatIni ?? 'NON CLASS',
      formatKursus(e.kursusLepkom),
      formatJadwalKosong(e.jadwalKosong),
      formatJadwalMateri(e.jadwalMateriLepkom, isNonClass),
      e.statusPengisian.replace('_', ' ').toUpperCase(),
    ];
  });

  const wsData   = xlsx.utils.aoa_to_sheet([headers, ...rows]);

  // Lebar kolom agar informatif
  wsData['!cols'] = [
    { wch: 5 },  // NO
    { wch: 12 }, // ID ASISTEN
    { wch: 12 }, // NPM
    { wch: 30 }, // NAMA
    { wch: 12 }, // KELAS
    { wch: 50 }, // KURSUS LEPKOM
    { wch: 50 }, // JADWAL KOSONG
    { wch: 55 }, // JADWAL MATERI LEPKOM
    { wch: 15 }, // STATUS
  ];

  xlsx.utils.book_append_sheet(wb, wsData, 'Jadwal Kosong');

  // ─── Sheet 2: Referensi Sesi ──────────────────────────────────────────────

  const sesiData = [
    ['REFERENSI SESI KURSUS LEPKOM', '', ''],
    ['', '', ''],
    ['SESI', 'SENIN - KAMIS & SABTU', 'KHUSUS HARI JUMAT'],
    ['0', '07.30 - 10.00', '07.00 - 09.00'],
    ['1', '10.00 - 12.30', '09.00 - 11.30'],
    ['2', '13.00 - 15.30', '13.30 - 16.00'],
    ['3', '15.45 - 18.15', '16.00 - 18.30'],
    ['', '', ''],
    ['Dibuat oleh:', jadwal.dibuatOleh?.nama ?? '-', ''],
    ['Tanggal Export:', new Date().toLocaleDateString('id-ID'), ''],
    ['Judul Jadwal:', jadwal.judul, ''],
    ['Total Asisten:', entris.length, ''],
  ];

  const wsSesi = xlsx.utils.aoa_to_sheet(sesiData);
  wsSesi['!cols'] = [{ wch: 20 }, { wch: 25 }, { wch: 25 }];
  xlsx.utils.book_append_sheet(wb, wsSesi, 'Referensi Sesi');

  return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
};
