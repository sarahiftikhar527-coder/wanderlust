const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

exports.validate = (req, _res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formatted = errors.array().reduce((acc, err) => {
      const key = err.path || err.param || 'value';

      if (!acc[key]) {
        acc[key] = err.msg;
      }

      return acc;
    }, {});

    return next(
      new AppError(
        'Validation failed',
        400,
        formatted
      )
    );
  }

  next();
};