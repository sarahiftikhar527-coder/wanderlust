const express = require('express');

const router = express.Router();

const {
  create,
  update,
} = require('../validators/experienceValidators');

const {
  review,
} = require('../validators/bookingValidators');

const {
  validate,
} = require('../middleware/validate');

const {
  protect,
  restrictTo,
  optionalAuth,
} = require('../middleware/auth');

const expController = require('../controllers/experienceController');

router.get(
  '/',
  optionalAuth,
  expController.getExperiences
);

router.get(
  '/featured',
  optionalAuth,
  expController.getFeatured
);

router.get(
  '/stats',
  protect,
  restrictTo('ADMIN'),
  expController.getStats
);

router.get(
  '/reviews/all',
  protect,
  restrictTo('ADMIN'),
  expController.getAllReviews
);

router.post(
  '/',
  protect,
  restrictTo('ADMIN'),
  create,
  validate,
  expController.createExperience
);

router.put(
  '/:id',
  protect,
  restrictTo('ADMIN'),
  update,
  validate,
  expController.updateExperience
);

router.delete(
  '/:id',
  protect,
  restrictTo('ADMIN'),
  expController.deleteExperience
);

router.post(
  '/:id/reviews',
  protect,
  review,
  validate,
  expController.addReview
);

router.get(
  '/:id/reviews',
  optionalAuth,
  expController.getExperienceReviews
);

router.delete(
  '/:id/reviews/:reviewId',
  protect,
  restrictTo('ADMIN'),
  expController.adminDeleteReview
);

router.delete(
  '/:id/reviews/:reviewId/user',
  protect,
  expController.deleteReview
);

router.get(
  '/:slug',
  optionalAuth,
  expController.getExperience
);

module.exports = router;