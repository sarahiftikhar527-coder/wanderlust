const { body } = require('express-validator');

const register = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({
      min: 2,
      max: 60,
    })
    .withMessage('Name must be 2-60 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({
      min: 6,
      max: 100,
    })
    .withMessage(
      'Password must be 6-100 characters'
    ),
];

const login = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const updateProfile = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({
      min: 2,
      max: 60,
    })
    .withMessage(
      'Name must be 2-60 characters'
    ),

  body('bio')
    .optional()
    .trim()
    .isLength({
      max: 500,
    })
    .withMessage(
      'Bio cannot exceed 500 characters'
    ),

  body('location')
    .optional()
    .trim()
    .isLength({
      max: 150,
    })
    .withMessage(
      'Location cannot exceed 150 characters'
    ),

  body('phone')
    .optional()
    .trim()
    .isLength({
      max: 30,
    })
    .withMessage(
      'Phone cannot exceed 30 characters'
    ),

  body('avatar')
    .optional()
    .trim()
    .isLength({
      max: 500,
    })
    .withMessage(
      'Avatar URL cannot exceed 500 characters'
    ),
];

const changePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage(
      'Current password is required'
    ),

  body('newPassword')
    .notEmpty()
    .withMessage(
      'New password is required'
    )
    .isLength({
      min: 6,
      max: 100,
    })
    .withMessage(
      'New password must be 6-100 characters'
    )
    .custom(
      (value, { req }) => {
        if (
          value ===
          req.body.currentPassword
        ) {
          throw new Error(
            'New password must be different from current password'
          );
        }

        return true;
      }
    ),
];

module.exports = {
  register,
  login,
  updateProfile,
  changePassword,
};