const express = require("express");
const {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  getAllReviews,
  toggleReviewStatus,
} = require("../controllers/reviewController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/experience/:experienceId", getReviews);

router.post("/experience/:experienceId", protect, createReview);

router.put("/:reviewId", protect, updateReview);

router.delete("/:reviewId", protect, deleteReview);

router.get("/admin/all", protect, adminOnly, getAllReviews);

router.patch(
  "/admin/:reviewId/status",
  protect,
  adminOnly,
  toggleReviewStatus
);

module.exports = router;