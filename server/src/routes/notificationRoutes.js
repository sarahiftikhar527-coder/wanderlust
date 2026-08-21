const express = require('express');

const router = express.Router();

const { protect } = require('../middleware/auth');

const notificationController = require('../controllers/notificationController');

router.use(protect);

router.get(
  '/',
  notificationController.getMyNotifications
);

router.put(
  '/read-all',
  notificationController.markAllAsRead
);

router.put(
  '/:id/read',
  notificationController.markAsRead
);

router.delete(
  '/',
  notificationController.clearAll
);

router.delete(
  '/:id',
  notificationController.deleteNotification
);

module.exports = router;