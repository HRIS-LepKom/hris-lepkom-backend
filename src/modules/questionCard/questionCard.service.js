import QuestionCard from '../../models/questionCard.model.js';
import { getPaginationParams, buildPaginationMeta } from '../../utils/paginate.js';
import { buildSmartFilter } from '../../utils/buildSmartFilter.js';

// ─── Get All ──────────────────────────────────────────────────────────────────
export const getAll = async (query) => {
  const { page, limit, skip } = getPaginationParams(query);

  const smartFilter = buildSmartFilter(query, {
    tingkat:    { type: 'number' },
    kategori:   { type: 'string' },
    namaMateri: { type: 'string' },
    dibuatOleh: { type: 'string' },
  });

  const filter = { ...smartFilter };

  if (query.search) {
    filter.judulPertanyaan = { $regex: query.search, $options: 'i' };
  }

  const ALLOWED_SORT = ['judulPertanyaan', 'tingkat', 'kategori', 'createdAt'];
  const sortField    = ALLOWED_SORT.includes(query.sortBy) ? query.sortBy : 'judulPertanyaan';
  const sortDir      = query.sortOrder === 'desc' ? -1 : 1;

  const [data, total] = await Promise.all([
    QuestionCard.find(filter)
      .populate('dibuatOleh', 'nama idAsisten')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    QuestionCard.countDocuments(filter),
  ]);

  return { data, meta: buildPaginationMeta(total, page, limit) };
};

// ─── Get One ──────────────────────────────────────────────────────────────────
export const getOne = async (id) => {
  const qc = await QuestionCard.findById(id)
    .populate('dibuatOleh', 'nama idAsisten')
    .lean();

  if (!qc) {
    const err = new Error('Question Card tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  return qc;
};

// ─── Create ───────────────────────────────────────────────────────────────────
export const create = async (data, asistenId) => {
  const qc = await QuestionCard.create({ ...data, dibuatOleh: asistenId });
  return await qc.populate('dibuatOleh', 'nama idAsisten');
};

// ─── Update ───────────────────────────────────────────────────────────────────
export const update = async (id, data) => {
  const qc = await QuestionCard.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate('dibuatOleh', 'nama idAsisten');

  if (!qc) {
    const err = new Error('Question Card tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  return qc;
};

// ─── Hard Delete ──────────────────────────────────────────────────────────────
export const hardDelete = async (id) => {
  const qc = await QuestionCard.findByIdAndDelete(id);
  if (!qc) {
    const err = new Error('Question Card tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  return { deletedId: id };
};
