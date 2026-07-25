export const createSessionSchema = {
  type: 'object',
  required: ['tanggal', 'jenisUjian'],
  additionalProperties: false,
  properties: {
    tanggal:     { type: 'string' },
    jenisUjian:  { type: 'string', enum: ['praktek', 'project'] },
    catatan:     { type: 'string' },
  },
};

export const updateSessionSchema = {
  type: 'object',
  additionalProperties: false,
  minProperties: 1,
  properties: {
    tanggal:     { type: 'string' },
    jenisUjian:  { type: 'string', enum: ['praktek', 'project'] },
    catatan:     { type: 'string' },
  },
};
