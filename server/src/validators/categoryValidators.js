const { body } = require('express-validator');

const create = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({
      min: 2,
      max: 50,
    })
    .withMessage('Name must be 2-50 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({
      max: 300,
    })
    .withMessage(
      'Description cannot exceed 300 characters'
    ),

  body('icon')
    .optional()
    .trim()
    .isLength({
      max: 100,
    })
    .withMessage(
      'Icon name cannot exceed 100 characters'
    ),

  body('color')
    .optional()
    .trim()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage(
      'Color must be a valid hex color'
    ),
];

const update = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category name cannot be empty')
    .isLength({
      min: 2,
      max: 50,
    })
    .withMessage('Name must be 2-50 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({
      max: 300,
    })
    .withMessage(
      'Description cannot exceed 300 characters'
    ),

  body('icon')
    .optional()
    .trim()
    .isLength({
      max: 100,
    })
    .withMessage(
      'Icon name cannot exceed 100 characters'
    ),

  body('color')
    .optional()
    .trim()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage(
      'Color must be a valid hex color'
    ),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage(
      'isActive must be true or false'
    )
    .toBoolean(),
];

module.exports = {
  create,
  update,
};