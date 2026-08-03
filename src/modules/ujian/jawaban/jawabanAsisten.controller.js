import mongoose from 'mongoose';
import Calas from '../../../models/calas.model.js';
import { downloadJawaban } from './jawaban.service.js';

export const listJawabanCalas = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      namaCalas,
      npm,
      jenisUjian, 
      tanggal,
      sortBy = 'tanggal',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const sortDir = sortOrder === 'asc' ? 1 : -1;

    // Build the match conditions
    let matchQuery = {};

    // 1. Search filter
    if (search) {
      matchQuery.$or = [
        { namaCalas: { $regex: search, $options: 'i' } },
        { npm: { $regex: search, $options: 'i' } },
      ];
    }
    
    // 1a. Column Search
    if (namaCalas) {
      matchQuery.namaCalas = { $regex: namaCalas, $options: 'i' };
    }
    if (npm) {
      matchQuery.npm = { $regex: npm, $options: 'i' };
    }

    // 2. Exam Type Filter & Target Field
    // If jenisUjian is specified, we only show those. Otherwise we show any uploaded file.
    if (jenisUjian === 'praktek') {
      matchQuery.jawabanPraktek = { $ne: null };
    } else if (jenisUjian === 'project') {
      matchQuery.jawabanProject = { $ne: null };
    } else {
      matchQuery.$or = [
        ...(matchQuery.$or || []),
        { jawabanPraktek: { $ne: null } },
        { jawabanProject: { $ne: null } }
      ];
    }

    // Aggregation Pipeline
    const pipeline = [];

    // Stage 1: Initial Match
    pipeline.push({ $match: matchQuery });

    // Stage 2: We need to normalize documents into a generic format because 
    // a single calas might have BOTH praktek and project. 
    // We should project them into separate rows or just display them based on jenisUjian.
    // If they ask for 'praktek', we show praktek row. 
    // If no jenisUjian filter, we might need to use $facet or $project to determine what to show.
    // But let's keep it simple: The front-end expects a table. 
    // Usually it's better to unwind if they have both.
    
    pipeline.push({
      $project: {
        _id: 1,
        namaCalas: 1,
        npm: 1,
        jawabanPraktek: 1,
        jawabanProject: 1,
        jawabanPraktekUploadedAt: 1,
        jawabanProjectUploadedAt: 1
      }
    });

    // Expand the rows so that if a Calas uploaded both, it appears as two rows
    // To do this, we can create an array of "submissions" and unwind it
    pipeline.push({
      $addFields: {
        submissions: {
          $filter: {
            input: [
              {
                jenisUjian: 'praktek',
                fileUrl: '$jawabanPraktek',
                uploadedAt: '$jawabanPraktekUploadedAt'
              },
              {
                jenisUjian: 'project',
                fileUrl: '$jawabanProject',
                uploadedAt: '$jawabanProjectUploadedAt'
              }
            ],
            as: 'sub',
            cond: { $ne: ['$$sub.fileUrl', null] }
          }
        }
      }
    });

    pipeline.push({ $unwind: '$submissions' });

    // If jenisUjian filter is active, filter the unwound rows
    if (jenisUjian === 'praktek' || jenisUjian === 'project') {
      pipeline.push({
        $match: { 'submissions.jenisUjian': jenisUjian }
      });
    }

    // Date Filter (after unwinding)
    if (tanggal) {
      const startOfDay = new Date(tanggal);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(tanggal);
      endOfDay.setHours(23, 59, 59, 999);
      
      pipeline.push({
        $match: {
          'submissions.uploadedAt': {
            $gte: startOfDay,
            $lte: endOfDay
          }
        }
      });
    }

    // Stage 3: Lookup Room Placement
    // We need to find the room for this specific jenisUjian
    pipeline.push({
      $lookup: {
        from: 'roomplacements',
        let: { calasId: '$_id', ujianTipe: '$submissions.jenisUjian' },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: ['$$calasId', '$calasList']
              }
            }
          },
          {
            $lookup: {
              from: 'examsessions',
              localField: 'examSessionRef',
              foreignField: '_id',
              as: 'session'
            }
          },
          { $unwind: '$session' },
          {
            $match: {
              $expr: { $eq: ['$session.jenisUjian', '$$ujianTipe'] }
            }
          }
        ],
        as: 'roomInfo'
      }
    });

    pipeline.push({
      $addFields: {
        ruangan: {
          $ifNull: [{ $arrayElemAt: ['$roomInfo.ruangan', 0] }, null]
        }
      }
    });

    // Formatting fields to the top level for sorting
    pipeline.push({
      $project: {
        _id: 1,
        namaCalas: 1,
        npm: 1,
        jenisUjian: '$submissions.jenisUjian',
        uploadedAt: '$submissions.uploadedAt',
        fileUrl: '$submissions.fileUrl',
        ruangan: 1,
      }
    });

    // Determine sort field
    const sortFieldMap = {
      nama: 'namaCalas',
      namaCalas: 'namaCalas',
      npm: 'npm',
      ruangan: 'ruangan',
      tanggal: 'uploadedAt',
      uploadedAt: 'uploadedAt',
      jenisUjian: 'jenisUjian'
    };
    
    const activeSortField = sortFieldMap[sortBy] || 'uploadedAt';
    pipeline.push({
      $sort: { [activeSortField]: sortDir }
    });

    // Pagination
    // We need facet to get both data and total count
    pipeline.push({
      $facet: {
        data: [
          { $skip: (pageNum - 1) * limitNum },
          { $limit: limitNum }
        ],
        totalCount: [
          { $count: 'count' }
        ]
      }
    });

    const result = await Calas.aggregate(pipeline);

    const data = result[0].data;
    const total = result[0].totalCount[0] ? result[0].totalCount[0].count : 0;
    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil daftar upload jawaban',
      data,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

export const downloadJawabanCalas = async (req, res, next) => {
  try {
    const { calasId, jenisUjian } = req.query;
    if (!calasId || !jenisUjian) {
      const err = new Error("Parameter calasId dan jenisUjian wajib disertakan");
      err.statusCode = 400;
      throw err;
    }

    // Reuse service layer logic which generates SignedUrl
    const data = await downloadJawaban(calasId, jenisUjian);

    res.status(200).json({
      success: true,
      message: 'Berhasil generate link download',
      data
    });
  } catch (error) {
    next(error);
  }
};
