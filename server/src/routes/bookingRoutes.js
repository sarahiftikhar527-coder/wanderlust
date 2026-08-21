const express = require('express');

const router = express.Router();

const {
  create,
} = require('../validators/bookingValidators');

const {
  validate,
} = require('../middleware/validate');

const {
  protect,
  restrictTo,
} = require('../middleware/auth');

const bookingController = require('../controllers/bookingController');

router.post(
  '/',
  protect,
  create,
  validate,
  bookingController.createBooking
);

router.get(
  '/me',
  protect,
  bookingController.getMyBookings
);

router.get(
  '/',
  protect,
  restrictTo('ADMIN'),
  bookingController.getAllBookings
);

router.get(
  '/:id',
  protect,
  bookingController.getBooking
);

router.put(
  '/:id/cancel',
  protect,
  bookingController.cancelBooking
);

router.put(
  '/:id/status',
  protect,
  restrictTo('ADMIN'),
  bookingController.updateBookingStatus
);

module.exports = router;