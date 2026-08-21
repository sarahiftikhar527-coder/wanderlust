const AppError = require('../utils/AppError');

/**
 * Admin-only middleware
 *
 * User model uses uppercase roles:
 * USER
 * ADMIN
 */
const adminOnly = (req, res, next) => {
  try {
    if (!req.user) {
      return next(
        new AppError(
          'Authentication required',
          401
        )
      );
    }

    const role = String(
      req.user.role || ''
    )
      .trim()
      .toUpperCase();

    if (role !== 'ADMIN') {
      return next(
        new AppError(
          'Admin access required',
          403
        )
      );
    }

    return next();
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  adminOnly,
};