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
  authorize,
} = require("../middleware/auth");

const router = express.Router();

router.get("/", getFeatures);

router.get("/all", protect, authorize("Admin"), getAllFeatures);

router.get("/:id", getFeatureById);

router.post(
  "/",
  protect,
  authorize("Admin"),
  createFeature
);

router.put(
  "/:id",
  protect,
  authorize("Admin"),
  updateFeature
);

router.patch(
  "/:id/toggle",
  protect,
  authorize("Admin"),
  toggleFeature
);

router.delete(
  "/:id",
  protect,
  authorize("Admin"),
  deleteFeature
);

module.exports = router;