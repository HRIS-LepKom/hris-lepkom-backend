import Penilaian from '../models/penilaian.model.js';

export const getPenilaianCalas = async (calasRef, jenisUjian) => {
  return Penilaian.find({ calasRef, jenisUjian }).populate('penilaiRef', 'nama idAsisten');
};

// Nilai akhir = rata-rata skorKeseluruhan dari semua penilai untuk calas ini
export const hitungNilaiAkhir = (daftarPenilaian) => {
  if (!daftarPenilaian.length) return null;

  const total = daftarPenilaian.reduce((sum, p) => sum + p.skorKeseluruhan, 0);
  return total / daftarPenilaian.length;
};

export const hitungRataRataPerKriteria = (daftarPenilaian) => {
  const akumulasi = {};

  daftarPenilaian.forEach((penilaian) => {
    for (const [kriteria, nilai] of penilaian.kriteria.entries()) {
      if (!akumulasi[kriteria]) akumulasi[kriteria] = [];
      akumulasi[kriteria].push(nilai);
    }
  });

  const rataRata = {};
  for (const [kriteria, nilaiList] of Object.entries(akumulasi)) {
    rataRata[kriteria] = nilaiList.reduce((sum, n) => sum + n, 0) / nilaiList.length;
  }

  return rataRata;
};

export const getRingkasanPenilaianCalas = async (calasRef, jenisUjian) => {
  const daftarPenilaian = await getPenilaianCalas(calasRef, jenisUjian);

  return {
    nilaiAkhir: hitungNilaiAkhir(daftarPenilaian),
    rataRataPerKriteria: hitungRataRataPerKriteria(daftarPenilaian),
    detailPerPenilai: daftarPenilaian.map((p) => ({
      penilai: p.penilaiRef,
      skorKeseluruhan: p.skorKeseluruhan,
      kriteria: Object.fromEntries(p.kriteria),
      deskripsi: p.deskripsi,
    })),
  };
};