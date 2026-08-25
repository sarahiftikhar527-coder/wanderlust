const express = require("express");

const router = express.Router();

const authController = require("../controllers/authController");

router.post(
  "/register",
  authController.register
);

router.post(
  "/login",
  authController.login
);

router.post(
  "/logout",
  authController.logout
);

router.get(
  "/me",
  authController.getMe
);

router.put(
  "/profile",
  authController.updateProfile
);

router.put(
  "/password",
  authController.changePassword
);

router.post(
  "/favorites/:experienceId",
  authController.toggleFavorite
);

router.get(
  "/favorites",
  authController.getFavorites
);

router.delete(
  "/account",
  authController.deleteAccount
);

module.exports = router;