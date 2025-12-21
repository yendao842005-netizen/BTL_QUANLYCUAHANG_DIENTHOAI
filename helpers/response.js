export const errorResponse = (status, message, validation = {}, data = {}) => ({
  status,
  message,
  validation,
  data,
});

export const successResponse = (status, message, data = {}) => ({
  status,
  message,
  data,
});
