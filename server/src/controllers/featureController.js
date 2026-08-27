const Feature = require("../models/Feature");

const getFeatures = async (req, res, next) => {
  try {
    const features = await Feature.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: features.length,
      features,
    });
  } catch (error) {
    next(error);
  }
};

const getAllFeatures = async (req, res, next) => {
  try {
    const features = await Feature.find()
      .sort({ order: 1, createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: features.length,
      features,
    });
  } catch (error) {
    next(error);
  }
};

const getFeatureById = async (req, res, next) => {
  try {
    const feature = await Feature.findById(req.params.id);

    if (!feature) {
      return res.status(404).json({
        success: false,
        message: "Feature not found",
      });
    }

    res.status(200).json({
      success: true,
      feature,
    });
  } catch (error) {
    next(error);
  }
};

const createFeature = async (req, res, next) => {
  try {
    const {
      title,
      description,
      icon,
      image,
      order,
      isActive,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    const feature = await Feature.create({
      title,
      description,
      icon,
      image,
      order,
      isActive,
    });

    res.status(201).json({
      success: true,
      message: "Feature created successfully",
      feature,
    });
  } catch (error) {
    next(error);
  }
};

const updateFeature = async (req, res, next) => {
  try {
    const feature = await Feature.findById(req.params.id);

    if (!feature) {
      return res.status(404).json({
        success: false,
        message: "Feature not found",
      });
    }

    const {
      title,
      description,
      icon,
      image,
      order,
      isActive,
    } = req.body;

    if (title !== undefined) feature.title = title;
    if (description !== undefined) {
      feature.description = description;
    }
    if (icon !== undefined) feature.icon = icon;
    if (image !== undefined) feature.image = image;
    if (order !== undefined) feature.order = order;
    if (isActive !== undefined) {
      feature.isActive = isActive;
    }

    await feature.save();

    res.status(200).json({
      success: true,
      message: "Feature updated successfully",
      feature,
    });
  } catch (error) {
    next(error);
  }
};

const deleteFeature = async (req, res, next) => {
  try {
    const feature = await Feature.findById(req.params.id);

    if (!feature) {
      return res.status(404).json({
        success: false,
        message: "Feature not found",
      });
    }

    await feature.deleteOne();

    res.status(200).json({
      success: true,
      message: "Feature deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const toggleFeature = async (req, res, next) => {
  try {
    const feature = await Feature.findById(req.params.id);

    if (!feature) {
      return res.status(404).json({
        success: false,
        message: "Feature not found",
      });
    }

    feature.isActive = !feature.isActive;

    await feature.save();

    res.status(200).json({
      success: true,
      message: `Feature ${
        feature.isActive ? "activated" : "deactivated"
      } successfully`,
      feature,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFeatures,
  getAllFeatures,
  getFeatureById,
  createFeature,
  updateFeature,
  deleteFeature,
  toggleFeature,
};