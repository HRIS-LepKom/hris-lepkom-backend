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
