const express = require("express");

const router = express.Router();

const {
  register,
  login,
  updateProfile,
  changePassword,
} = require("../validators/authValidators");

const { validate } = require("../middleware/validate");
const { protect } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimitMiddleware");
const authController = require("../controllers/authController");

router.post(
  "/register",
  authLimiter,
  register,
  validate,
  authController.register
);

router.post(
  "/login",
  authLimiter,
  login,
  validate,
  authController.login
);

router.post(
  "/logout",
  protect,
  authController.logout
);

router.get(
  "/me",
  protect,
  authController.getMe
);

router.put(
  "/profile",
  protect,
  updateProfile,
  validate,
  authController.updateProfile
);

router.put(
  "/password",
  protect,
  changePassword,
  validate,
  authController.changePassword
);

router.post(
  "/favorites/:experienceId",
  protect,
  authController.toggleFavorite
);

router.get(
  "/favorites",
  protect,
  authController.getFavorites
);

router.delete(
  "/account",
  protect,
  authController.deleteAccount
);

module.exports = router;