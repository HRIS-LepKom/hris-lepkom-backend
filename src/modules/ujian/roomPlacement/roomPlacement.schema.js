export const createRoomPlacementSchema = {
  type: 'object',
  required: ['examSessionRef', 'ruangan'],
  additionalProperties: false,
  properties: {
    examSessionRef: { type: 'string', minLength: 1 },
    ruangan:        { type: 'number', enum: [121, 122, 124, 125] },
  },
};

export const addCalasSchema = {
  type: 'object',
  required: ['calasId'],
  additionalProperties: false,
  properties: {
    calasId: { type: 'string', minLength: 1 },
  },
};

export const addPenilaiSchema = {
  type: 'object',
  required: ['asistenId'],
  additionalProperties: false,
  properties: {
    asistenId: { type: 'string', minLength: 1 },
  },
};
