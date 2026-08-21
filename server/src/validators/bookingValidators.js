const { body } = require('express-validator');

const create = [
  body('experience')
    .trim()
    .notEmpty()
    .withMessage('Experience ID is required')
    .isMongoId()
    .withMessage('Invalid experience ID'),

  body('bookingDate')
    .notEmpty()
    .withMessage('Booking date is required')
    .isISO8601()
    .withMessage('Invalid booking date')
    .custom((value) => {
      const bookingDate = new Date(value);

      if (Number.isNaN(bookingDate.getTime())) {
        throw new Error('Invalid booking date');
      }

      if (bookingDate <= new Date()) {
        throw new Error('Booking date must be in the future');
      }

      return true;
    }),

  body('guests')
    .optional()
    .isObject()
    .withMessage('Guests must be an object'),

  body('guests.adults')
    .optional()
    .isInt({ min: 1 })
    .withMessage('At least 1 adult is required')
    .toInt(),

  body('guests.children')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Children count cannot be negative')
    .toInt(),

  body('contactPhone')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Phone number cannot exceed 30 characters'),

  body('specialRequests')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage(
      'Special requests cannot exceed 500 characters'
    ),
];

const review = [
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5')
    .toInt(),

  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Comment is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Comment must be 10-500 characters'),
];

module.exports = {
  create,
  review,
};