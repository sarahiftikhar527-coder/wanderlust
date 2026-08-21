const Review = require("../models/Review");
const Experience = require("../models/Experience");

const getReviews = async (req, res) => {
  try {
    const { experienceId } = req.params;

    const reviews = await Review.find({
      experience: experienceId,
      status: "published",
    })
      .populate("user", "name email avatar")
      .sort({ createdAt: -1 });

    const stats = await Review.aggregate([
      {
        $match: {
          experience: new (require("mongoose").Types.ObjectId)(experienceId),
          status: "published",
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      reviews,
      stats: {
        averageRating: stats.length
          ? Number(stats[0].averageRating.toFixed(1))
          : 0,
        totalReviews: stats.length ? stats[0].totalReviews : 0,
      },
    });
  } catch (error) {
    console.error("Get reviews error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
    });
  }
};

const createReview = async (req, res) => {
  try {
    const { experienceId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Rating and comment are required",
      });
    }

    const numericRating = Number(rating);

    if (
      Number.isNaN(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (comment.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Review comment is too short",
      });
    }

    const experience = await Experience.findById(experienceId);

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: "Experience not found",
      });
    }

    const existingReview = await Review.findOne({
      user: req.user._id,
      experience: experienceId,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this experience",
      });
    }

    const review = await Review.create({
      user: req.user._id,
      experience: experienceId,
      rating: numericRating,
      comment: comment.trim(),
      status: "published",
    });

    const populatedReview = await Review.findById(review._id).populate(
      "user",
      "name email avatar"
    );

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review: populatedReview,
    });
  } catch (error) {
    console.error("Create review error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create review",
    });
  }
};

const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this review",
      });
    }

    if (rating !== undefined) {
      const numericRating = Number(rating);

      if (
        Number.isNaN(numericRating) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5",
        });
      }

      review.rating = numericRating;
    }

    if (comment !== undefined) {
      const trimmedComment = comment.trim();

      if (trimmedComment.length < 2) {
        return res.status(400).json({
          success: false,
          message: "Review comment is too short",
        });
      }

      review.comment = trimmedComment;
    }

    await review.save();

    const updatedReview = await Review.findById(review._id).populate(
      "user",
      "name email avatar"
    );

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review: updatedReview,
    });
  } catch (error) {
    console.error("Update review error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update review",
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    const isOwner =
      review.user.toString() === req.user._id.toString();

    const isAdmin =
      req.user.role === "admin" || req.user.isAdmin === true;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this review",
      });
    }

    await Review.findByIdAndDelete(reviewId);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete review",
    });
  }
};

const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name email avatar")
      .populate(
        "experience",
        "title slug location images coverImage"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Get all reviews error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch all reviews",
    });
  }
};

const toggleReviewStatus = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    review.status =
      review.status === "published" ? "hidden" : "published";

    await review.save();

    res.status(200).json({
      success: true,
      message: `Review ${
        review.status === "published" ? "published" : "hidden"
      } successfully`,
      review,
    });
  } catch (error) {
    console.error("Toggle review status error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update review status",
    });
  }
};

module.exports = {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  getAllReviews,
  toggleReviewStatus,
};