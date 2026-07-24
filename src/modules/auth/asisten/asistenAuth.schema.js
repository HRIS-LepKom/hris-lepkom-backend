export const loginSchema = {
  type: 'object',
  required: ['identifier', 'password'],
  additionalProperties: false,
  properties: {
    identifier: { type: 'string', minLength: 1 },
    password:   { type: 'string', minLength: 1 },
  },
};

export const requestHardResetSchema = {
  type: 'object',
  required: ['identifier'],
  additionalProperties: false,
  properties: {
    identifier: { type: 'string', minLength: 1 },
  },
};

export const changePasswordSchema = {
  type: 'object',
  required: ['newPassword'],
  additionalProperties: false,
  properties: {
    newPassword: { type: 'string', minLength: 8 },
  },
};
