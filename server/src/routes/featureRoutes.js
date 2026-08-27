const express = require("express");

const {
  getFeatures,
  getAllFeatures,
  getFeatureById,
  createFeature,
  updateFeature,
  deleteFeature,
  toggleFeature,
} = require("../controllers/featureController");

const {
  protect,
  restrictTo,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getFeatures);

router.get(
  "/all",
  protect,
  restrictTo("ADMIN"),
  getAllFeatures
);

router.get("/:id", getFeatureById);

router.post(
  "/",
  protect,
  restrictTo("ADMIN"),
  createFeature
);

router.put(
  "/:id",
  protect,
  restrictTo("ADMIN"),
  updateFeature
);

router.patch(
  "/:id/toggle",
  protect,
  restrictTo("ADMIN"),
  toggleFeature
);

router.delete(
  "/:id",
  protect,
  restrictTo("ADMIN"),
  deleteFeature
);

module.exports = router;