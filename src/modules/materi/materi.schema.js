export const createSchema = {
  type: 'object',
  required: ['namaMateri', 'tingkat'],
  additionalProperties: false,
  properties: {
    namaMateri: { type: 'string', minLength: 2, maxLength: 100 },
    tingkat:    { type: 'number', enum: [1, 2, 3] },
    deskripsi:  { type: 'string', maxLength: 500 },
  },
};

export const updateSchema = {
  type: 'object',
  additionalProperties: false,
  minProperties: 1,
  properties: {
    namaMateri: { type: 'string', minLength: 2, maxLength: 100 },
    tingkat:    { type: 'number', enum: [1, 2, 3] },
    deskripsi:  { type: 'string', maxLength: 500 },
  },
};
