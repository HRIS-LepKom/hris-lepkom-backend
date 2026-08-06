const HTTP_ERROR_TYPES = {
  400: 'BadRequest',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'NotFound',
  409: 'Conflict',
  410: 'Gone',
  422: 'UnprocessableEntity',
  429: 'TooManyRequests',
  500: 'InternalServerError',
};

export const sendSuccess = (res, data = null, message = 'Berhasil', statusCode = 200, meta = null) => {
  const response = { errorStatus: false, message, data };
  if (meta) {
    response.totalData = meta.total;
    response.totalPage = meta.totalPages;
  }
  return res.status(statusCode).json(response);
};

export const sendError = (res, message = 'Terjadi kesalahan', statusCode = 500, errors = null, errorType = null) => {
  return res.status(statusCode).json({
    errorStatus: true,
    message,
    errorType:   errorType || HTTP_ERROR_TYPES[statusCode] || 'InternalServerError',
    errors:      errors || [{ message, code: statusCode }],
  });
};