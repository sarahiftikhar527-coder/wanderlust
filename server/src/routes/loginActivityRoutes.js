const express = require('express');

const router = express.Router();

const {
  protect,
  restrictTo,
} = require('../middleware/auth');

const {
  getLoginActivities,
  getUserLoginActivities,
  getLoginActivityStats,
} = require('../controllers/loginActivityController');

router.use(protect);
router.use(restrictTo('ADMIN'));

router.get(
  '/stats',
  getLoginActivityStats
);

router.get(
  '/user/:userId',
  getUserLoginActivities
);

router.get(
  '/',
  getLoginActivities
);

module.exports = router;