import { ASISTEN_ROLES } from '../../models/asisten.model.js';

const ALLOWED_ROLES = ASISTEN_ROLES.filter((r) => r !== 'super_admin');

export const createSchema = {
  type: 'object',
  required: ['idAsisten', 'npm', 'nama'],
  additionalProperties: false,
  properties: {
    idAsisten:    { type: 'string', minLength: 1, maxLength: 50 },
    npm:          { type: 'string', minLength: 1, maxLength: 20 },
    nama:         { type: 'string', minLength: 2, maxLength: 100 },
    email:        { type: 'string', pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' },
    kelasSaatIni: { type: 'string', maxLength: 20 },
    role:         { type: 'string', enum: ALLOWED_ROLES },
  },
};

export const updateSchema = {
  type: 'object',
  additionalProperties: false,
  minProperties: 1,
  properties: {
    nama:         { type: 'string', minLength: 2, maxLength: 100 },
    email:        { type: 'string', pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' },
    kelasSaatIni: { type: 'string', maxLength: 20 },
  },
};

export const updateMeSchema = {
  type: 'object',
  additionalProperties: false,
  minProperties: 1,
  properties: {
    idAsisten:    { type: 'string', minLength: 1 },
    npm:          { type: 'string', minLength: 1 },
    nama:         { type: 'string', minLength: 1 },
    email:        { type: 'string', format: 'email' },
    kelasSaatIni: { type: 'string' },
  },
};

export const updateRoleSchema = {
  type: 'object',
  required: ['role'],
  additionalProperties: false,
  properties: {
    role: { type: 'string', enum: ALLOWED_ROLES },
  },
};

export const convertCalasSchema = {
  type: 'object',
  required: ['idAsisten'],
  additionalProperties: false,
  properties: {
    idAsisten:    { type: 'string', minLength: 1, maxLength: 50 },
    kelasSaatIni: { type: 'string', maxLength: 20 },
  },
};
