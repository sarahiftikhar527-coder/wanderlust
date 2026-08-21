const express = require('express');

const {
  getAdminDashboard,
  getAdminStats,
  getAllUsers,
  getUserById,
  getUserLoginActivity,
  updateUserStatus,
  deleteUser,
} = require('../controllers/adminController');

const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get('/dashboard', getAdminDashboard);

router.get('/stats', getAdminStats);

router.get('/users', getAllUsers);

router.get('/users/:id', getUserById);

router.get(
  '/users/:id/login-activity',
  getUserLoginActivity
);

router.patch(
  '/users/:id/status',
  updateUserStatus
);

router.delete(
  '/users/:id',
  deleteUser
);

module.exports = router;