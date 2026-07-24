export const activateSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    gelombangAktif: {
      type:      'string',
      minLength: 1,
      maxLength: 100,
    },
  },
};
