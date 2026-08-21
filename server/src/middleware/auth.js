const mongoose = require('mongoose');

const User = require('../models/User');
const { verifyToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');

/**
 * Get Bearer token from Authorization header
 */
const getTokenFromRequest = (req) => {
  const authorization =
    req.headers.authorization;

  if (
    !authorization ||
    typeof authorization !== 'string'
  ) {
    return null;
  }

  if (
    !authorization.startsWith('Bearer ')
  ) {
    return null;
  }

  const token =
    authorization
      .slice(7)
      .trim();

  return token || null;
};

/**
 * Get authenticated user from JWT
 */
const getUserFromToken = async (
  token
) => {
  let decoded;

  try {
    decoded = verifyToken(token);
  } catch (err) {
    if (
      err &&
      err.name === 'TokenExpiredError'
    ) {
      throw new AppError(
        'Your session has expired. Please log in again.',
        401
      );
    }

    throw new AppError(
      'Invalid authentication token.',
      401
    );
  }

  if (
    !decoded ||
    !decoded.id
  ) {
    throw new AppError(
      'Invalid authentication token.',
      401
    );
  }

  if (
    !mongoose.Types.ObjectId.isValid(
      decoded.id
    )
  ) {
    throw new AppError(
      'Invalid authentication token.',
      401
    );
  }

  const user =
    await User.findById(
      decoded.id
    );

  if (!user) {
    throw new AppError(
      'The user belonging to this token no longer exists.',
      401
    );
  }

  if (!user.isActive) {
    throw new AppError(
      'Your account has been deactivated. Please contact support.',
      403
    );
  }

  return user;
};

/**
 * Protect private routes
 */
exports.protect = async (
  req,
  res,
  next
) => {
  try {
    const token =
      getTokenFromRequest(req);

    if (!token) {
      return next(
        new AppError(
          'You are not logged in. Please log in to access this resource.',
          401
        )
      );
    }

    const user =
      await getUserFromToken(
        token
      );

    req.user = user;

    return next();
  } catch (err) {
    return next(err);
  }
};

/**
 * Restrict route to specific roles
 *
 * Example:
 * router.get(
 *   '/admin',
 *   protect,
 *   restrictTo('ADMIN'),
 *   controller
 * );
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new AppError(
          'Authentication required.',
          401
        )
      );
    }

    if (
      !Array.isArray(roles) ||
      roles.length === 0
    ) {
      return next(
        new AppError(
          'No allowed roles specified.',
          500
        )
      );
    }

    const currentRole =
      String(
        req.user.role || ''
      )
        .trim()
        .toUpperCase();

    const allowedRoles =
      roles.map((role) =>
        String(role)
          .trim()
          .toUpperCase()
      );

    if (
      !allowedRoles.includes(
        currentRole
      )
    ) {
      return next(
        new AppError(
          'You do not have permission to perform this action.',
          403
        )
      );
    }

    return next();
  };
};

/**
 * Optional authentication
 *
 * If token exists and is valid,
 * req.user will contain the user.
 *
 * Otherwise request continues
 * without authentication.
 */
exports.optionalAuth = async (
  req,
  res,
  next
) => {
  try {
    req.user = undefined;

    const token =
      getTokenFromRequest(req);

    if (!token) {
      return next();
    }

    try {
      const user =
        await getUserFromToken(
          token
        );

      req.user = user;
    } catch (err) {
      req.user = undefined;
    }

    return next();
  } catch (err) {
    req.user = undefined;

    return next();
  }
};

module.exports = exports;