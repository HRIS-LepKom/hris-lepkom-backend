import Ajv from 'ajv';
import { sendError } from '../utils/apiResponse.js';

const ajv = new Ajv({ allErrors: true, coerceTypes: true });

const compiledCache = new WeakMap();
const getValidator = (schema) => {
  if (!compiledCache.has(schema)) {
    compiledCache.set(schema, ajv.compile(schema));
  }
  return compiledCache.get(schema);
};

export const validate = (schema, target = 'body') => (req, res, next) => {
  const validateFn = getValidator(schema);
  const valid = validateFn(req[target]);

  if (!valid) {
    const errors = validateFn.errors.map((e) => ({
      message: `${e.instancePath.replace(/^\//, '') || e.params?.missingProperty || target}: ${e.message}`,
      code: 400,
    }));
    return sendError(res, 'Validasi data gagal', 400, errors, 'ValidationError');
  }

  next();
};