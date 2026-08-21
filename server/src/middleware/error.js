const AppError = require('../utils/AppError');

const notFound = (
  req,
  _res,
  next
) => {
  return next(
    new AppError(
      `Route not found: ${req.originalUrl}`,
      404
    )
  );
};

const errorHandler = (
  err,
  req,
  res,
  _next
) => {
  let statusCode =
    err.statusCode || 500;

  let message =
    err.message ||
    'Internal server error';

  let errors =
    err.errors || null;

  if (err.name === 'CastError') {
    statusCode = 400;

    message = `Invalid ${err.path}: ${err.value}`;
  }

  if (
    err.code === 11000 ||
    (
      err.name === 'MongoServerError' &&
      err.codeName === 'DuplicateKey'
    )
  ) {
    statusCode = 409;

    const duplicateFields =
      Object.keys(
        err.keyPattern ||
        err.keyValue ||
        {}
      );

    const field =
      duplicateFields[0] ||
      'field';

    message =
      `A record with that ${field} already exists`;

    errors = null;
  }

  if (
    err.name ===
    'ValidationError'
  ) {
    statusCode = 400;

    message =
      'Validation failed';

    errors =
      Object.values(
        err.errors || {}
      ).reduce(
        (acc, error) => {
          acc[error.path] =
            error.message;

          return acc;
        },
        {}
      );
  }

  if (
    err.name ===
    'JsonWebTokenError'
  ) {
    statusCode = 401;

    message =
      'Invalid authentication token';

    errors = null;
  }

  if (
    err.name ===
    'TokenExpiredError'
  ) {
    statusCode = 401;

    message =
      'Authentication token has expired';

    errors = null;
  }

  if (
    err.type ===
    'entity.too.large'
  ) {
    statusCode = 413;

    message =
      'Request payload is too large';

    errors = null;
  }

  if (
    err.type ===
    'entity.parse.failed'
  ) {
    statusCode = 400;

    message =
      'Invalid JSON payload';

    errors = null;
  }

  if (
    err.name ===
    'MulterError'
  ) {
    statusCode = 400;

    if (
      err.code ===
      'LIMIT_FILE_SIZE'
    ) {
      message =
        'Uploaded file is too large';
    } else if (
      err.code ===
      'LIMIT_FILE_COUNT'
    ) {
      message =
        'Too many files uploaded';
    } else if (
      err.code ===
      'LIMIT_UNEXPECTED_FILE'
    ) {
      message =
        'Unexpected file uploaded';
    } else {
      message =
        err.message ||
        'File upload failed';
    }

    errors = null;
  }

  if (
    statusCode < 400
  ) {
    statusCode = 500;

    message =
      'Internal server error';
  }

  const response = {
    success: false,
    message,
  };

  if (
    errors &&
    typeof errors === 'object' &&
    Object.keys(errors).length > 0
  ) {
    response.errors = errors;
  }

  if (
    process.env.NODE_ENV ===
    'development'
  ) {
    response.stack =
      err.stack;
  }

  if (
    statusCode >= 500
  ) {
    console.error(
      '[ERROR]',
      err
    );
  }

  return res
    .status(statusCode)
    .json(response);
};

module.exports = {
  notFound,
  errorHandler,
};