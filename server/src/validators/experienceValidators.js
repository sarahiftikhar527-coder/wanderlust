const { body } = require('express-validator');

const create = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({
      min: 5,
      max: 120,
    })
    .withMessage('Title must be 5-120 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({
      min: 20,
    })
    .withMessage('Description must be at least 20 characters'),

  body('shortDescription')
    .optional()
    .trim()
    .isLength({
      max: 200,
    })
    .withMessage(
      'Short description cannot exceed 200 characters'
    ),

  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isMongoId()
    .withMessage('Invalid category ID'),

  body('location')
    .notEmpty()
    .withMessage('Location is required')
    .isObject()
    .withMessage('Location must be an object'),

  body('location.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),

  body('location.country')
    .trim()
    .notEmpty()
    .withMessage('Country is required'),

  body('location.address')
    .optional()
    .trim()
    .isLength({
      max: 300,
    })
    .withMessage(
      'Address cannot exceed 300 characters'
    ),

  body('location.coordinates')
    .optional()
    .isObject()
    .withMessage(
      'Coordinates must be an object'
    ),

  body('location.coordinates.lat')
    .optional({
      nullable: true,
    })
    .isFloat({
      min: -90,
      max: 90,
    })
    .withMessage('Invalid latitude')
    .toFloat(),

  body('location.coordinates.lng')
    .optional({
      nullable: true,
    })
    .isFloat({
      min: -180,
      max: 180,
    })
    .withMessage('Invalid longitude')
    .toFloat(),

  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({
      min: 0,
    })
    .withMessage('Price must be a positive number')
    .toFloat(),

  body('duration')
    .trim()
    .notEmpty()
    .withMessage('Duration is required')
    .isLength({
      max: 100,
    })
    .withMessage(
      'Duration cannot exceed 100 characters'
    ),

  body('groupSize')
    .optional()
    .isObject()
    .withMessage(
      'Group size must be an object'
    ),

  body('groupSize.min')
    .optional()
    .isInt({
      min: 1,
    })
    .withMessage(
      'Minimum group size must be at least 1'
    )
    .toInt(),

  body('groupSize.max')
    .optional()
    .isInt({
      min: 1,
    })
    .withMessage(
      'Maximum group size must be at least 1'
    )
    .toInt(),

  body('coverImage')
    .optional()
    .trim()
    .isString()
    .withMessage(
      'Cover image must be a string'
    ),

  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),

  body('images.*')
    .optional()
    .trim()
    .isString()
    .withMessage(
      'Each image must be a string'
    ),

  body('highlights')
    .optional()
    .isArray()
    .withMessage(
      'Highlights must be an array'
    ),

  body('highlights.*')
    .optional()
    .trim()
    .isString()
    .withMessage(
      'Each highlight must be a string'
    ),

  body('included')
    .optional()
    .isArray()
    .withMessage(
      'Included items must be an array'
    ),

  body('included.*')
    .optional()
    .trim()
    .isString()
    .withMessage(
      'Each included item must be a string'
    ),

  body('excluded')
    .optional()
    .isArray()
    .withMessage(
      'Excluded items must be an array'
    ),

  body('excluded.*')
    .optional()
    .trim()
    .isString()
    .withMessage(
      'Each excluded item must be a string'
    ),

  body('itinerary')
    .optional()
    .isArray()
    .withMessage(
      'Itinerary must be an array'
    ),

  body('itinerary.*')
    .optional()
    .isObject()
    .withMessage(
      'Each itinerary item must be an object'
    ),

  body('itinerary.*.day')
    .notEmpty()
    .withMessage(
      'Itinerary day is required'
    )
    .isInt({
      min: 1,
    })
    .withMessage(
      'Itinerary day must be at least 1'
    )
    .toInt(),

  body('itinerary.*.title')
    .trim()
    .notEmpty()
    .withMessage(
      'Itinerary title is required'
    )
    .isLength({
      max: 150,
    })
    .withMessage(
      'Itinerary title cannot exceed 150 characters'
    ),

  body('itinerary.*.description')
    .trim()
    .notEmpty()
    .withMessage(
      'Itinerary description is required'
    )
    .isLength({
      max: 1000,
    })
    .withMessage(
      'Itinerary description cannot exceed 1000 characters'
    ),

  body('availableDates')
    .optional()
    .isArray()
    .withMessage(
      'Available dates must be an array'
    ),

  body('availableDates.*')
    .optional()
    .isISO8601()
    .withMessage(
      'Each available date must be a valid date'
    ),

  body('status')
    .optional()
    .isIn([
      'DRAFT',
      'PUBLISHED',
      'ARCHIVED',
    ])
    .withMessage('Invalid status'),

  body('featured')
    .optional()
    .isBoolean()
    .withMessage(
      'Featured must be true or false'
    )
    .toBoolean(),

  body('host')
    .notEmpty()
    .withMessage('Host is required')
    .isObject()
    .withMessage('Host must be an object'),

  body('host.name')
    .trim()
    .notEmpty()
    .withMessage('Host name is required')
    .isLength({
      max: 100,
    })
    .withMessage(
      'Host name cannot exceed 100 characters'
    ),

  body('host.bio')
    .optional()
    .trim()
    .isLength({
      max: 500,
    })
    .withMessage(
      'Host bio cannot exceed 500 characters'
    ),

  body('host.avatar')
    .optional()
    .trim()
    .isString()
    .withMessage(
      'Host avatar must be a string'
    ),
];

const update = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({
      min: 5,
      max: 120,
    })
    .withMessage('Title must be 5-120 characters'),

  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage(
      'Description cannot be empty'
    )
    .isLength({
      min: 20,
    })
    .withMessage(
      'Description must be at least 20 characters'
    ),

  body('shortDescription')
    .optional()
    .trim()
    .isLength({
      max: 200,
    })
    .withMessage(
      'Short description cannot exceed 200 characters'
    ),

  body('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID'),

  body('location')
    .optional()
    .isObject()
    .withMessage(
      'Location must be an object'
    ),

  body('location.city')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('City cannot be empty'),

  body('location.country')
    .optional()
    .trim()
    .notEmpty()
    .withMessage(
      'Country cannot be empty'
    ),

  body('location.address')
    .optional()
    .trim()
    .isLength({
      max: 300,
    })
    .withMessage(
      'Address cannot exceed 300 characters'
    ),

  body('location.coordinates')
    .optional()
    .isObject()
    .withMessage(
      'Coordinates must be an object'
    ),

  body('location.coordinates.lat')
    .optional({
      nullable: true,
    })
    .isFloat({
      min: -90,
      max: 90,
    })
    .withMessage('Invalid latitude')
    .toFloat(),

  body('location.coordinates.lng')
    .optional({
      nullable: true,
    })
    .isFloat({
      min: -180,
      max: 180,
    })
    .withMessage('Invalid longitude')
    .toFloat(),

  body('price')
    .optional()
    .isFloat({
      min: 0,
    })
    .withMessage('Price must be a positive number')
    .toFloat(),

  body('duration')
    .optional()
    .trim()
    .notEmpty()
    .withMessage(
      'Duration cannot be empty'
    )
    .isLength({
      max: 100,
    })
    .withMessage(
      'Duration cannot exceed 100 characters'
    ),

  body('groupSize')
    .optional()
    .isObject()
    .withMessage(
      'Group size must be an object'
    ),

  body('groupSize.min')
    .optional()
    .isInt({
      min: 1,
    })
    .withMessage(
      'Minimum group size must be at least 1'
    )
    .toInt(),

  body('groupSize.max')
    .optional()
    .isInt({
      min: 1,
    })
    .withMessage(
      'Maximum group size must be at least 1'
    )
    .toInt(),

  body('coverImage')
    .optional()
    .trim()
    .isString()
    .withMessage(
      'Cover image must be a string'
    ),

  body('images')
    .optional()
    .isArray()
    .withMessage(
      'Images must be an array'
    ),

  body('images.*')
    .optional()
    .trim()
    .isString()
    .withMessage(
      'Each image must be a string'
    ),

  body('highlights')
    .optional()
    .isArray()
    .withMessage(
      'Highlights must be an array'
    ),

  body('highlights.*')
    .optional()
    .trim()
    .isString()
    .withMessage(
      'Each highlight must be a string'
    ),

  body('included')
    .optional()
    .isArray()
    .withMessage(
      'Included items must be an array'
    ),

  body('included.*')
    .optional()
    .trim()
    .isString()
    .withMessage(
      'Each included item must be a string'
    ),

  body('excluded')
    .optional()
    .isArray()
    .withMessage(
      'Excluded items must be an array'
    ),

  body('excluded.*')
    .optional()
    .trim()
    .isString()
    .withMessage(
      'Each excluded item must be a string'
    ),

  body('itinerary')
    .optional()
    .isArray()
    .withMessage(
      'Itinerary must be an array'
    ),

  body('itinerary.*')
    .optional()
    .isObject()
    .withMessage(
      'Each itinerary item must be an object'
    ),

  body('itinerary.*.day')
    .optional()
    .isInt({
      min: 1,
    })
    .withMessage(
      'Itinerary day must be at least 1'
    )
    .toInt(),

  body('itinerary.*.title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage(
      'Itinerary title cannot be empty'
    )
    .isLength({
      max: 150,
    })
    .withMessage(
      'Itinerary title cannot exceed 150 characters'
    ),

  body('itinerary.*.description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage(
      'Itinerary description cannot be empty'
    )
    .isLength({
      max: 1000,
    })
    .withMessage(
      'Itinerary description cannot exceed 1000 characters'
    ),

  body('availableDates')
    .optional()
    .isArray()
    .withMessage(
      'Available dates must be an array'
    ),

  body('availableDates.*')
    .optional()
    .isISO8601()
    .withMessage(
      'Each available date must be a valid date'
    ),

  body('status')
    .optional()
    .isIn([
      'DRAFT',
      'PUBLISHED',
      'ARCHIVED',
    ])
    .withMessage('Invalid status'),

  body('featured')
    .optional()
    .isBoolean()
    .withMessage(
      'Featured must be true or false'
    )
    .toBoolean(),

  body('host')
    .optional()
    .isObject()
    .withMessage(
      'Host must be an object'
    ),

  body('host.name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage(
      'Host name cannot be empty'
    )
    .isLength({
      max: 100,
    })
    .withMessage(
      'Host name cannot exceed 100 characters'
    ),

  body('host.bio')
    .optional()
    .trim()
    .isLength({
      max: 500,
    })
    .withMessage(
      'Host bio cannot exceed 500 characters'
    ),

  body('host.avatar')
    .optional()
    .trim()
    .isString()
    .withMessage(
      'Host avatar must be a string'
    ),
];

const review = [
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({
      min: 1,
      max: 5,
    })
    .withMessage(
      'Rating must be between 1 and 5'
    )
    .toInt(),

  body('comment')
    .trim()
    .notEmpty()
    .withMessage(
      'Review comment is required'
    )
    .isLength({
      min: 10,
      max: 500,
    })
    .withMessage(
      'Review must be between 10 and 500 characters'
    ),
];

module.exports = {
  create,
  update,
  review,
};