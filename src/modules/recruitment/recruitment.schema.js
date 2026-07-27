export const createSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['gelombangAktif'],
  properties: {
    gelombangAktif: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
    },
    keterangan: {
      type: 'string',
      maxLength: 500,
    },
  },
};

export const updateSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    gelombangAktif: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
    },
    keterangan: {
      type: 'string',
      maxLength: 500,
    },
  },
};

