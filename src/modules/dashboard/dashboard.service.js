import Calas from '../../models/calas.model.js';
import Penilaian from '../../models/penilaian.model.js';

export const getAdminStats = async (query) => {
  const matchFilter = {};
  if (query.gelombangDaftar) {
    matchFilter.gelombangDaftar = Number(query.gelombangDaftar);
  }

  const funnel = await Calas.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: '$statusRekrutmen.tahapSaatIni',
        count: { $sum: 1 },
      },
    },
  ]);

  const jurusan = await Calas.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: '$jurusan',
        count: { $sum: 1 },
      },
    },
  ]);

  const globalScore = await Penilaian.aggregate([
    {
      $group: {
        _id: null,
        rataRataPraktek: {
          $avg: {
            $cond: [{ $eq: ['$jenisUjian', 'praktek'] }, '$skorKeseluruhan', null]
          }
        },
        rataRataProject: {
          $avg: {
            $cond: [{ $eq: ['$jenisUjian', 'project'] }, '$skorKeseluruhan', null]
          }
        }
      }
    }
  ]);

  return {
    funnel: funnel.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {}),
    jurusan: jurusan.reduce((acc, curr) => {
      acc[curr._id || 'Tidak Diketahui'] = curr.count;
      return acc;
    }, {}),
    globalScore: globalScore.length > 0 ? {
      praktek: globalScore[0].rataRataPraktek || 0,
      project: globalScore[0].rataRataProject || 0,
    } : { praktek: 0, project: 0 }
  };
};

export const getKoordinatorStats = async (query) => {
  const { Asisten } = await import('../../models/asisten.model.js');
  const { default: RoomPlacement } = await import('../../models/roomPlacement.model.js');
  const { default: Soal } = await import('../../models/soal.model.js');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Look for today's exams
  const todaysRooms = await RoomPlacement.find({})
    .populate({
      path: 'examSessionRef',
      match: { tanggal: { $gte: today, $lt: tomorrow } },
    })
    .populate('calasList', 'namaCalas idCalas')
    .populate('penilaiList', 'nama idAsisten');

  // Filter out those where examSessionRef didn't match (so it's null)
  const activeRooms = todaysRooms.filter((r) => r.examSessionRef !== null);

  const totalSoal = await Soal.countDocuments();

  return {
    todaySchedule: activeRooms.map(r => ({
      ruangan: r.ruangan,
      jenisUjian: r.examSessionRef.jenisUjian,
      waktu: r.examSessionRef.tanggal,
      kapasitasTerisi: r.calasList.length,
      jumlahPenilai: r.penilaiList.length,
    })),
    totalSoal,
  };
};

export const getPenilaiStats = async (asistenId) => {
  const { default: RoomPlacement } = await import('../../models/roomPlacement.model.js');
  const { default: Penilaian } = await import('../../models/penilaian.model.js');
  const { default: Calas } = await import('../../models/calas.model.js');

  // Find all room placements where this asisten is a penilai
  const myRooms = await RoomPlacement.find({ penilaiList: asistenId })
    .populate('examSessionRef')
    .populate('calasList', 'namaCalas idCalas');

  let totalToEvaluate = 0;
  let evaluated = 0;
  let waitingList = [];

  for (const room of myRooms) {
    if (!room.examSessionRef) continue;

    const jenisUjian = room.examSessionRef.jenisUjian;
    
    for (const calas of room.calasList) {
      // Check if penilai has submitted a score for this calas on this exam session
      const existingNilai = await Penilaian.findOne({
        calasRef: calas._id,
        penilaiRef: asistenId,
        jenisUjian: jenisUjian,
        examSessionRef: room.examSessionRef._id
      });

      totalToEvaluate++;
      if (existingNilai) {
        evaluated++;
      } else {
        waitingList.push({
          calasId: calas.idCalas,
          calasRef: calas._id,
          namaCalas: calas.namaCalas,
          jenisUjian,
          ruangan: room.ruangan,
          examSessionId: room.examSessionRef._id
        });
      }
    }
  }

  return {
    totalToEvaluate,
    evaluated,
    waitingList
  };
};

export const getCalasStats = async (calasId) => {
  const { default: Calas } = await import('../../models/calas.model.js');
  const { default: RoomPlacement } = await import('../../models/roomPlacement.model.js');

  const calas = await Calas.findById(calasId).select('statusRekrutmen idCalas namaCalas');
  if (!calas) throw new Error("Calas tidak ditemukan");

  // Get next exam schedule
  const myRooms = await RoomPlacement.find({ calasList: calasId })
    .populate('examSessionRef')
    .sort({ 'examSessionRef.tanggal': 1 }); // nearest first

  const upcomingExams = myRooms
    .filter(r => r.examSessionRef && new Date(r.examSessionRef.tanggal) >= new Date())
    .map(r => ({
      ruangan: r.ruangan,
      jenisUjian: r.examSessionRef.jenisUjian,
      waktu: r.examSessionRef.tanggal
    }));

  return {
    statusRekrutmen: calas.statusRekrutmen,
    upcomingExams
  };
};
