export const createRoomAssignmentSchema = {
  type: 'object',
  required: ['examSessionRef', 'ruangan', 'pjRuanganRef'],
  additionalProperties: false,
  properties: {
    examSessionRef: { type: 'string', minLength: 1 },
    ruangan:        { type: 'number', enum: [121, 122, 124, 125] },
    pjRuanganRef:   { type: 'string', minLength: 1 },
  },
};

export const updateRoomAssignmentSchema = {
  type: 'object',
  required: ['pjRuanganRef'],
  additionalProperties: false,
  properties: {
    pjRuanganRef: { type: 'string', minLength: 1 },
  },
};
