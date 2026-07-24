export const createSchema = {
  type: 'object',
  required: ['judulSoal', 'materiRef', 'tingkat'],
  additionalProperties: false,
  properties: {
    judulSoal: { type: 'string', minLength: 1 },
    materiRef: { type: 'string', minLength: 1 },
    tingkat:   { type: 'integer', enum: [1, 2, 3] },
  },
};

export const updateSchema = {
  type: 'object',
  additionalProperties: false,
  minProperties: 1,
  properties: {
    judulSoal: { type: 'string', minLength: 1 },
    materiRef: { type: 'string', minLength: 1 },
    tingkat:   { type: 'integer', enum: [1, 2, 3] },
  },
};
