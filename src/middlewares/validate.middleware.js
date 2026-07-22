import { sendError } from '../utils/apiResponse.js';

export const validate = (schema, target = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[target]);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      message: `${issue.path.join('.')}: ${issue.message}`,
      code: 400,
    }));

    return sendError(res, 'Validasi data gagal', 400, errors, 'ValidationError');
  }

  req[target] = result.data;
  next();
};