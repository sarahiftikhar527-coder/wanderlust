const jwt = require('jsonwebtoken');

const config = require('../config');

const signToken = (userId) => {
  if (!userId) {
    throw new Error(
      'User ID is required to generate token'
    );
  }

  if (!config.jwt.secret) {
    throw new Error(
      'JWT secret is not configured'
    );
  }

  return jwt.sign(
    {
      id: userId.toString(),
    },
    config.jwt.secret,
    {
      expiresIn: config.jwt.expire,
    }
  );
};

const verifyToken = (token) => {
  if (!token) {
    throw new Error('Token is required');
  }

  if (!config.jwt.secret) {
    throw new Error(
      'JWT secret is not configured'
    );
  }

  return jwt.verify(
    token,
    config.jwt.secret
  );
};

const decodeToken = (token) => {
  if (!token) {
    return null;
  }

  return jwt.decode(token);
};

module.exports = {
  signToken,
  verifyToken,
  decodeToken,
};