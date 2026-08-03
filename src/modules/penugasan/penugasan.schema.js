export const availablePjSchema = {
  type: 'object',
  required: ['tanggal', 'jenisUjian', 'ruangan'],
  additionalProperties: true,
  properties: {
    tanggal: { type: 'string' },
    jenisUjian: { type: 'string', enum: ['praktek', 'project'] },
    ruangan: { type: 'string', enum: ['121', '122', '124', '125'] },
    search: { type: 'string' }
  }
};

export const availablePenilaiSchema = {
  type: 'object',
  required: ['tanggal', 'jenisUjian', 'ruangan'],
  additionalProperties: true,
  properties: {
    tanggal: { type: 'string' },
    jenisUjian: { type: 'string', enum: ['praktek', 'project'] },
    ruangan: { type: 'string', enum: ['121', '122', '124', '125'] },
    search: { type: 'string' }
  }
};

export const availableCalasSchema = {
  type: 'object',
  required: ['tanggal', 'jenisUjian', 'ruangan'],
  additionalProperties: true,
  properties: {
    tanggal: { type: 'string' },
    jenisUjian: { type: 'string', enum: ['praktek', 'project'] },
    ruangan: { type: 'string', enum: ['121', '122', '124', '125'] },
    search: { type: 'string' }
  }
};

export const createAsistenPlacementSchema = {
  type: 'object',
  required: ['tanggal', 'jenisUjian', 'ruangan', 'pjRuanganIds', 'penilaiIds'],
  additionalProperties: true,
  properties: {
    tanggal: { type: 'string' },
    jenisUjian: { type: 'string', enum: ['praktek', 'project'] },
    ruangan: { type: 'number', enum: [121, 122, 124, 125] },
    pjRuanganIds: { type: 'array', items: { type: 'string' } },
    penilaiIds: { type: 'array', items: { type: 'string' } }
  }
};

export const updateAsistenPlacementSchema = {
  type: 'object',
  required: ['pjRuanganIds', 'penilaiIds'],
  additionalProperties: true,
  properties: {
    pjRuanganIds: { type: 'array', items: { type: 'string' } },
    penilaiIds: { type: 'array', items: { type: 'string' } }
  }
};

export const updateCalasPlacementSchema = {
  type: 'object',
  required: ['calasIds'],
  additionalProperties: true,
  properties: {
    calasIds: { type: 'array', items: { type: 'string' } }
  }
};
