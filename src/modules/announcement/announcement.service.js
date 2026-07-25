import Announcement from '../../models/announcement.model.js';
import Calas from '../../models/calas.model.js';
import { getPaginationParams, buildPaginationMeta } from '../../utils/paginate.js';

export const create = async (data, asistenId) => {
  const announcement = await Announcement.create({
    ...data,
    penulisRef: asistenId,
  });
  return announcement.populate('penulisRef', 'nama idAsisten role');
};

export const getAll = async (query) => {
  const { page, limit, skip } = getPaginationParams(query);

  const filter = {};
  if (query.targetGelombang) filter.targetGelombang = Number(query.targetGelombang);
  if (query.targetTahap) filter.targetTahap = query.targetTahap;
  if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';

  const [data, total] = await Promise.all([
    Announcement.find(filter)
      .populate('penulisRef', 'nama idAsisten')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Announcement.countDocuments(filter)
  ]);

  return {
    data,
    meta: buildPaginationMeta(total, page, limit),
  };
};

export const getOne = async (id) => {
  const announcement = await Announcement.findById(id).populate('penulisRef', 'nama idAsisten').lean();
  if (!announcement) {
    const err = new Error('Pengumuman tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  return announcement;
};

export const update = async (id, data) => {
  const announcement = await Announcement.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!announcement) {
    const err = new Error('Pengumuman tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  return announcement.populate('penulisRef', 'nama idAsisten');
};

export const remove = async (id) => {
  const announcement = await Announcement.findByIdAndDelete(id);
  if (!announcement) {
    const err = new Error('Pengumuman tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  return { deletedId: id };
};

// Khusus Calas
export const getFeedForCalas = async (calasId, query) => {
  const { page, limit, skip } = getPaginationParams(query);
  
  const calas = await Calas.findById(calasId).select('gelombangDaftar statusRekrutmen');
  if (!calas) {
    const err = new Error('Calas tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  const filter = {
    isActive: true,
    $and: [
      {
        $or: [
          { targetGelombang: null },
          { targetGelombang: calas.gelombangDaftar }
        ]
      },
      {
        $or: [
          { targetTahap: null },
          { targetTahap: calas.statusRekrutmen?.tahapSaatIni }
        ]
      }
    ]
  };

  const [data, total] = await Promise.all([
    Announcement.find(filter)
      .populate('penulisRef', 'nama')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Announcement.countDocuments(filter)
  ]);

  return {
    data,
    meta: buildPaginationMeta(total, page, limit),
  };
};
