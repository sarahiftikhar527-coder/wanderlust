const config = require('../config');

exports.success = (
  res,
  data = null,
  message = 'Success',
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

exports.error = (
  res,
  message = 'Something went wrong',
  statusCode = 500,
  errors = null
) => {
  const response = {
    success: false,
    message,
  };

  if (errors !== null) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

exports.paginate = (query = {}) => {
  const defaultPage =
    config.pagination?.defaultPage || 1;

  const defaultLimit =
    config.pagination?.defaultLimit || 10;

  const maxLimit =
    config.pagination?.maxLimit || 100;

  const parsedPage = Number.parseInt(
    query.page,
    10
  );

  const parsedLimit = Number.parseInt(
    query.limit,
    10
  );

  const page = Math.max(
    1,
    Number.isNaN(parsedPage)
      ? defaultPage
      : parsedPage
  );

  const limit = Math.min(
    maxLimit,
    Math.max(
      1,
      Number.isNaN(parsedLimit)
        ? defaultLimit
        : parsedLimit
    )
  );

  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
};

exports.paginationMeta = (
  total,
  page,
  limit
) => {
  const totalItems = Math.max(
    0,
    Number(total) || 0
  );

  const currentPage = Math.max(
    1,
    Number(page) || 1
  );

  const currentLimit = Math.max(
    1,
    Number(limit) || 1
  );

  const totalPages = Math.ceil(
    totalItems / currentLimit
  );

  return {
    total: totalItems,
    page: currentPage,
    limit: currentLimit,
    totalPages,
    hasNext:
      currentPage < totalPages,
    hasPrev:
      currentPage > 1,
  };
};

exports.slugify = (str = '') => {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};