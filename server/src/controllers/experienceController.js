const mongoose = require('mongoose');

const Experience = require('../models/Experience');
const Category = require('../models/Category');

const {
  success,
  paginate,
  paginationMeta,
  slugify,
} = require('../utils/response');

const AppError = require('../utils/AppError');

const ALLOWED_STATUSES = [
  'PUBLISHED',
  'DRAFT',
  'ARCHIVED',
];

const createUniqueSlug = async (
  title,
  excludeId = null
) => {
  const baseSlug = slugify(title);

  if (!baseSlug) {
    throw new AppError(
      'Unable to generate experience slug',
      400
    );
  }

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query = { slug };

    if (excludeId) {
      query._id = {
        $ne: excludeId,
      };
    }

    const exists = await Experience.exists(query);

    if (!exists) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
};

const validateExperienceId = (
  id,
  next
) => {
  if (
    !id ||
    !mongoose.Types.ObjectId.isValid(id)
  ) {
    next(
      new AppError(
        'Invalid experience ID',
        400
      )
    );

    return false;
  }

  return true;
};

const validateCategoryId = (
  id,
  next
) => {
  if (
    !id ||
    !mongoose.Types.ObjectId.isValid(id)
  ) {
    next(
      new AppError(
        'Invalid category ID',
        400
      )
    );

    return false;
  }

  return true;
};

const normalizeString = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
};

const parseBoolean = (
  value,
  fieldName,
  next
) => {
  if (
    value !== true &&
    value !== false &&
    value !== 'true' &&
    value !== 'false'
  ) {
    next(
      new AppError(
        `${fieldName} must be true or false`,
        400
      )
    );

    return null;
  }

  return value === true || value === 'true';
};

exports.getExperiences = async (
  req,
  res,
  next
) => {
  try {
    const {
      page,
      limit,
      skip,
    } = paginate(req.query);

    const {
      search,
      category,
      minPrice,
      maxPrice,
      minRating,
      country,
      city,
      sort,
      featured,
      status,
    } = req.query;

    const query = {};

    const isAdmin =
      req.user &&
      req.user.role === 'ADMIN';

    if (isAdmin && status) {
      const normalizedStatus =
        normalizeString(status).toUpperCase();

      if (
        !ALLOWED_STATUSES.includes(
          normalizedStatus
        )
      ) {
        return next(
          new AppError(
            'Invalid experience status',
            400
          )
        );
      }

      query.status = normalizedStatus;
    } else {
      query.status = 'PUBLISHED';
    }

    if (
      typeof search === 'string' &&
      search.trim()
    ) {
      query.$text = {
        $search: search.trim(),
      };
    }

    if (
      typeof category === 'string' &&
      category.trim()
    ) {
      const categoryValue =
        category.trim().toLowerCase();

      let categoryQuery = {
        slug: categoryValue,
        isActive: true,
      };

      if (
        mongoose.Types.ObjectId.isValid(
          categoryValue
        )
      ) {
        categoryQuery = {
          _id: categoryValue,
          isActive: true,
        };
      }

      const cat =
        await Category.findOne(
          categoryQuery
        );

      if (!cat) {
        return success(
          res,
          {
            experiences: [],
            pagination:
              paginationMeta(
                0,
                page,
                limit
              ),
          },
          'Experiences fetched successfully'
        );
      }

      query.category = cat._id;
    }

    if (
      minPrice !== undefined &&
      minPrice !== ''
    ) {
      const parsedMinPrice =
        Number(minPrice);

      if (
        !Number.isFinite(
          parsedMinPrice
        ) ||
        parsedMinPrice < 0
      ) {
        return next(
          new AppError(
            'Invalid minimum price',
            400
          )
        );
      }

      query.price = {
        ...(query.price || {}),
        $gte: parsedMinPrice,
      };
    }

    if (
      maxPrice !== undefined &&
      maxPrice !== ''
    ) {
      const parsedMaxPrice =
        Number(maxPrice);

      if (
        !Number.isFinite(
          parsedMaxPrice
        ) ||
        parsedMaxPrice < 0
      ) {
        return next(
          new AppError(
            'Invalid maximum price',
            400
          )
        );
      }

      query.price = {
        ...(query.price || {}),
        $lte: parsedMaxPrice,
      };
    }

    if (
      query.price &&
      query.price.$gte !== undefined &&
      query.price.$lte !== undefined &&
      query.price.$gte > query.price.$lte
    ) {
      return next(
        new AppError(
          'Minimum price cannot be greater than maximum price',
          400
        )
      );
    }

    if (
      minRating !== undefined &&
      minRating !== ''
    ) {
      const parsedMinRating =
        Number(minRating);

      if (
        !Number.isFinite(
          parsedMinRating
        ) ||
        parsedMinRating < 0 ||
        parsedMinRating > 5
      ) {
        return next(
          new AppError(
            'Minimum rating must be between 0 and 5',
            400
          )
        );
      }

      query.rating = {
        $gte: parsedMinRating,
      };
    }

    if (
      typeof country === 'string' &&
      country.trim()
    ) {
      const escapedCountry =
        country
          .trim()
          .replace(
            /[.*+?^${}()|[\]\\]/g,
            '\\$&'
          );

      query['location.country'] =
        new RegExp(
          escapedCountry,
          'i'
        );
    }

    if (
      typeof city === 'string' &&
      city.trim()
    ) {
      const escapedCity =
        city
          .trim()
          .replace(
            /[.*+?^${}()|[\]\\]/g,
            '\\$&'
          );

      query['location.city'] =
        new RegExp(
          escapedCity,
          'i'
        );
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (featured === 'false') {
      query.featured = false;
    }

    let sortOption = {
      createdAt: -1,
    };

    switch (sort) {
      case 'price-asc':
        sortOption = {
          price: 1,
        };
        break;

      case 'price-desc':
        sortOption = {
          price: -1,
        };
        break;

      case 'rating':
        sortOption = {
          rating: -1,
          numReviews: -1,
        };
        break;

      case 'popular':
        sortOption = {
          numReviews: -1,
          rating: -1,
        };
        break;

      case 'newest':
        sortOption = {
          createdAt: -1,
        };
        break;

      case 'oldest':
        sortOption = {
          createdAt: 1,
        };
        break;

      default:
        sortOption = {
          createdAt: -1,
        };
    }

    const [
      total,
      experiences,
    ] = await Promise.all([
      Experience.countDocuments(query),

      Experience.find(query)
        .populate(
          'category',
          'name slug icon color'
        )
        .populate(
          'reviews.user',
          'name email avatar'
        )
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    return success(
      res,
      {
        experiences,
        pagination:
          paginationMeta(
            total,
            page,
            limit
          ),
      },
      'Experiences fetched successfully'
    );
  } catch (err) {
    next(err);
  }
};

exports.getExperience = async (
  req,
  res,
  next
) => {
  try {
    const slug = normalizeString(
      req.params.slug
    ).toLowerCase();

    if (!slug) {
      return next(
        new AppError(
          'Experience slug is required',
          400
        )
      );
    }

    const exp =
      await Experience.findOne({
        slug,
        status: 'PUBLISHED',
      })
        .populate(
          'category',
          'name slug icon color'
        )
        .populate(
          'reviews.user',
          'name email avatar'
        );

    if (!exp) {
      return next(
        new AppError(
          'Experience not found',
          404
        )
      );
    }

    let related = [];

    if (exp.category) {
      related =
        await Experience.find({
          _id: {
            $ne: exp._id,
          },
          category:
            exp.category._id,
          status: 'PUBLISHED',
        })
          .populate(
            'category',
            'name slug icon color'
          )
          .sort({
            rating: -1,
            numReviews: -1,
            createdAt: -1,
          })
          .limit(4)
          .select(
            'title slug coverImage price rating numReviews location duration'
          )
          .lean();
    }

    return success(
      res,
      {
        experience: exp,
        related,
      },
      'Experience fetched successfully'
    );
  } catch (err) {
    next(err);
  }
};

exports.createExperience = async (
  req,
  res,
  next
) => {
  try {
    const data = {
      ...(req.body || {}),
    };

    if (
      typeof data.title !== 'string' ||
      !data.title.trim()
    ) {
      return next(
        new AppError(
          'Experience title is required',
          400
        )
      );
    }

    data.title =
      data.title.trim();

    if (
      !validateCategoryId(
        data.category,
        next
      )
    ) {
      return;
    }

    const category =
      await Category.findById(
        data.category
      );

    if (!category) {
      return next(
        new AppError(
          'Selected category not found',
          404
        )
      );
    }

    if (!category.isActive) {
      return next(
        new AppError(
          'Selected category is inactive',
          400
        )
      );
    }

    if (
      data.price === undefined ||
      data.price === null ||
      data.price === ''
    ) {
      return next(
        new AppError(
          'Experience price is required',
          400
        )
      );
    }

    const price =
      Number(data.price);

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      return next(
        new AppError(
          'Experience price must be a valid positive number',
          400
        )
      );
    }

    data.price = price;

    data.slug =
      await createUniqueSlug(
        data.title
      );

    if (
      !data.coverImage &&
      Array.isArray(data.images) &&
      data.images.length > 0
    ) {
      data.coverImage =
        data.images[0];
    }

    if (
      !Array.isArray(data.images)
    ) {
      data.images = [];
    }

    if (
      !Array.isArray(data.highlights)
    ) {
      data.highlights = [];
    }

    if (
      !Array.isArray(data.included)
    ) {
      data.included = [];
    }

    if (
      !Array.isArray(data.excluded)
    ) {
      data.excluded = [];
    }

    if (
      !Array.isArray(data.itinerary)
    ) {
      data.itinerary = [];
    }

    if (
      !Array.isArray(
        data.availableDates
      )
    ) {
      data.availableDates = [];
    }

    if (!data.status) {
      data.status = 'DRAFT';
    } else {
      data.status =
        String(data.status).toUpperCase();

      if (
        !ALLOWED_STATUSES.includes(
          data.status
        )
      ) {
        return next(
          new AppError(
            'Invalid experience status',
            400
          )
        );
      }
    }

    if (
      data.featured === undefined
    ) {
      data.featured = false;
    } else {
      const featured =
        parseBoolean(
          data.featured,
          'Featured',
          next
        );

      if (featured === null) {
        return;
      }

      data.featured = featured;
    }

    const exp =
      await Experience.create(data);

    const populated =
      await Experience.findById(
        exp._id
      )
        .populate(
          'category',
          'name slug icon color'
        )
        .populate(
          'reviews.user',
          'name email avatar'
        );

    return success(
      res,
      {
        experience:
          populated,
      },
      'Experience created successfully',
      201
    );
  } catch (err) {
    if (err.code === 11000) {
      return next(
        new AppError(
          'An experience with this slug already exists',
          409
        )
      );
    }

    next(err);
  }
};

exports.updateExperience = async (
  req,
  res,
  next
) => {
  try {
    if (
      !validateExperienceId(
        req.params.id,
        next
      )
    ) {
      return;
    }

    const existing =
      await Experience.findById(
        req.params.id
      );

    if (!existing) {
      return next(
        new AppError(
          'Experience not found',
          404
        )
      );
    }

    const data = {
      ...(req.body || {}),
    };

    if (
      data.title !== undefined
    ) {
      if (
        typeof data.title !== 'string' ||
        !data.title.trim()
      ) {
        return next(
          new AppError(
            'Experience title cannot be empty',
            400
          )
        );
      }

      data.title =
        data.title.trim();

      if (
        data.title !== existing.title
      ) {
        data.slug =
          await createUniqueSlug(
            data.title,
            existing._id
          );
      }
    }

    if (
      data.category !== undefined
    ) {
      if (
        !validateCategoryId(
          data.category,
          next
        )
      ) {
        return;
      }

      const category =
        await Category.findById(
          data.category
        );

      if (!category) {
        return next(
          new AppError(
            'Selected category not found',
            404
          )
        );
      }

      if (!category.isActive) {
        return next(
          new AppError(
            'Selected category is inactive',
            400
          )
        );
      }
    }

    if (
      data.price !== undefined
    ) {
      const price =
        Number(data.price);

      if (
        !Number.isFinite(price) ||
        price < 0
      ) {
        return next(
          new AppError(
            'Experience price must be a valid positive number',
            400
          )
        );
      }

      data.price = price;
    }

    if (
      data.status !== undefined
    ) {
      const normalizedStatus =
        String(data.status).toUpperCase();

      if (
        !ALLOWED_STATUSES.includes(
          normalizedStatus
        )
      ) {
        return next(
          new AppError(
            'Invalid experience status',
            400
          )
        );
      }

      data.status =
        normalizedStatus;
    }

    if (
      data.featured !== undefined
    ) {
      const featured =
        parseBoolean(
          data.featured,
          'Featured',
          next
        );

      if (featured === null) {
        return;
      }

      data.featured = featured;
    }

    if (
      Array.isArray(data.images) &&
      data.images.length > 0 &&
      !data.coverImage
    ) {
      data.coverImage =
        data.images[0];
    }

    if (
      data.images !== undefined &&
      !Array.isArray(data.images)
    ) {
      return next(
        new AppError(
          'Images must be an array',
          400
        )
      );
    }

    if (
      data.highlights !== undefined &&
      !Array.isArray(data.highlights)
    ) {
      return next(
        new AppError(
          'Highlights must be an array',
          400
        )
      );
    }

    if (
      data.included !== undefined &&
      !Array.isArray(data.included)
    ) {
      return next(
        new AppError(
          'Included items must be an array',
          400
        )
      );
    }

    if (
      data.excluded !== undefined &&
      !Array.isArray(data.excluded)
    ) {
      return next(
        new AppError(
          'Excluded items must be an array',
          400
        )
      );
    }

    if (
      data.itinerary !== undefined &&
      !Array.isArray(data.itinerary)
    ) {
      return next(
        new AppError(
          'Itinerary must be an array',
          400
        )
      );
    }

    if (
      data.availableDates !== undefined &&
      !Array.isArray(
        data.availableDates
      )
    ) {
      return next(
        new AppError(
          'Available dates must be an array',
          400
        )
      );
    }

    const exp =
      await Experience.findByIdAndUpdate(
        req.params.id,
        data,
        {
          new: true,
          runValidators: true,
        }
      )
        .populate(
          'category',
          'name slug icon color'
        )
        .populate(
          'reviews.user',
          'name email avatar'
        );

    if (!exp) {
      return next(
        new AppError(
          'Experience not found',
          404
        )
      );
    }

    return success(
      res,
      {
        experience: exp,
      },
      'Experience updated successfully'
    );
  } catch (err) {
    if (
      err.name === 'CastError'
    ) {
      return next(
        new AppError(
          'Invalid experience data',
          400
        )
      );
    }

    if (err.code === 11000) {
      return next(
        new AppError(
          'An experience with this slug already exists',
          409
        )
      );
    }

    next(err);
  }
};

exports.deleteExperience = async (
  req,
  res,
  next
) => {
  try {
    if (
      !validateExperienceId(
        req.params.id,
        next
      )
    ) {
      return;
    }

    const exp =
      await Experience.findById(
        req.params.id
      );

    if (!exp) {
      return next(
        new AppError(
          'Experience not found',
          404
        )
      );
    }

    await Experience.findByIdAndDelete(
      req.params.id
    );

    return success(
      res,
      {
        deletedExperienceId:
          req.params.id,
      },
      'Experience deleted successfully'
    );
  } catch (err) {
    next(err);
  }
};

exports.addReview = async (
  req,
  res,
  next
) => {
  try {
    if (
      !req.user ||
      !req.user._id
    ) {
      return next(
        new AppError(
          'Authentication required',
          401
        )
      );
    }

    if (
      !validateExperienceId(
        req.params.id,
        next
      )
    ) {
      return;
    }

    const {
      rating,
      comment,
    } = req.body || {};

    const numericRating =
      Number(rating);

    if (
      !Number.isFinite(
        numericRating
      ) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return next(
        new AppError(
          'Rating must be between 1 and 5',
          400
        )
      );
    }

    if (
      typeof comment !== 'string' ||
      !comment.trim()
    ) {
      return next(
        new AppError(
          'Review comment is required',
          400
        )
      );
    }

    const trimmedComment =
      comment.trim();

    if (
      trimmedComment.length < 10
    ) {
      return next(
        new AppError(
          'Review comment must be at least 10 characters',
          400
        )
      );
    }

    if (
      trimmedComment.length > 500
    ) {
      return next(
        new AppError(
          'Review comment cannot exceed 500 characters',
          400
        )
      );
    }

    const exp =
      await Experience.findById(
        req.params.id
      );

    if (!exp) {
      return next(
        new AppError(
          'Experience not found',
          404
        )
      );
    }

    if (
      exp.status !== 'PUBLISHED'
    ) {
      return next(
        new AppError(
          'Reviews can only be added to published experiences',
          400
        )
      );
    }

    const reviews =
      Array.isArray(exp.reviews)
        ? exp.reviews
        : [];

    const existing =
      reviews.find(
        (review) =>
          review.user &&
          review.user.toString() ===
            req.user._id.toString()
      );

    if (existing) {
      return next(
        new AppError(
          'You have already reviewed this experience',
          409
        )
      );
    }

    exp.reviews.push({
      user: req.user._id,
      name:
        req.user.name || 'User',
      avatar:
        req.user.avatar || '',
      rating:
        numericRating,
      comment:
        trimmedComment,
    });

    exp.recalculateRating();

    await exp.save();

    const populated =
      await Experience.findById(
        exp._id
      )
        .populate(
          'category',
          'name slug icon color'
        )
        .populate(
          'reviews.user',
          'name email avatar'
        );

    return success(
      res,
      {
        experience:
          populated,
      },
      'Review added successfully',
      201
    );
  } catch (err) {
    next(err);
  }
};

exports.deleteReview = async (
  req,
  res,
  next
) => {
  try {
    if (
      !req.user ||
      !req.user._id
    ) {
      return next(
        new AppError(
          'Authentication required',
          401
        )
      );
    }

    if (
      !validateExperienceId(
        req.params.id,
        next
      )
    ) {
      return;
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.reviewId
      )
    ) {
      return next(
        new AppError(
          'Invalid review ID',
          400
        )
      );
    }

    const exp =
      await Experience.findById(
        req.params.id
      );

    if (!exp) {
      return next(
        new AppError(
          'Experience not found',
          404
        )
      );
    }

    const reviewIndex =
      exp.reviews.findIndex(
        (review) =>
          review._id.toString() ===
            req.params.reviewId &&
          review.user &&
          review.user.toString() ===
            req.user._id.toString()
      );

    if (reviewIndex === -1) {
      return next(
        new AppError(
          'Review not found or you are not authorized to delete it',
          404
        )
      );
    }

    exp.reviews.splice(
      reviewIndex,
      1
    );

    exp.recalculateRating();

    await exp.save();

    const populated =
      await Experience.findById(
        exp._id
      )
        .populate(
          'category',
          'name slug icon color'
        )
        .populate(
          'reviews.user',
          'name email avatar'
        );

    return success(
      res,
      {
        experience:
          populated,
      },
      'Review deleted successfully'
    );
  } catch (err) {
    next(err);
  }
};

exports.getAllReviews = async (
  req,
  res,
  next
) => {
  try {
    const experiences =
      await Experience.find({
        'reviews.0': {
          $exists: true,
        },
      })
        .populate(
          'category',
          'name slug icon color'
        )
        .populate(
          'reviews.user',
          'name email avatar'
        )
        .select(
          'title slug coverImage rating numReviews reviews location'
        )
        .sort({
          updatedAt: -1,
        })
        .lean();

    const reviews = [];

    experiences.forEach(
      (experience) => {
        if (
          !Array.isArray(
            experience.reviews
          )
        ) {
          return;
        }

        experience.reviews.forEach(
          (review) => {
            reviews.push({
              _id: review._id,
              experienceId:
                experience._id,
              experienceTitle:
                experience.title,
              experienceSlug:
                experience.slug,
              experienceImage:
                experience.coverImage,
              location:
                experience.location,
              category:
                experience.category,
              user: review.user,
              name:
                review.name ||
                review.user?.name ||
                'User',
              email:
                review.user?.email ||
                '',
              avatar:
                review.avatar ||
                review.user?.avatar ||
                '',
              rating:
                review.rating,
              comment:
                review.comment,
              createdAt:
                review.createdAt,
              updatedAt:
                review.updatedAt,
            });
          }
        );
      }
    );

    reviews.sort(
      (a, b) =>
        new Date(
          b.createdAt || 0
        ) -
        new Date(
          a.createdAt || 0
        )
    );

    return success(
      res,
      {
        reviews,
        total:
          reviews.length,
      },
      'Reviews fetched successfully'
    );
  } catch (err) {
    next(err);
  }
};

exports.getExperienceReviews = async (
  req,
  res,
  next
) => {
  try {
    if (
      !validateExperienceId(
        req.params.id,
        next
      )
    ) {
      return;
    }

    const exp =
      await Experience.findById(
        req.params.id
      )
        .populate(
          'reviews.user',
          'name email avatar'
        )
        .select(
          'title slug rating numReviews reviews'
        )
        .lean();

    if (!exp) {
      return next(
        new AppError(
          'Experience not found',
          404
        )
      );
    }

    const reviews =
      Array.isArray(exp.reviews)
        ? [...exp.reviews].sort(
            (a, b) =>
              new Date(
                b.createdAt || 0
              ) -
              new Date(
                a.createdAt || 0
              )
          )
        : [];

    return success(
      res,
      {
        experience: {
          _id: exp._id,
          title: exp.title,
          slug: exp.slug,
          rating: exp.rating,
          numReviews:
            exp.numReviews,
        },
        reviews,
        total:
          reviews.length,
      },
      'Experience reviews fetched successfully'
    );
  } catch (err) {
    next(err);
  }
};

exports.adminDeleteReview = async (
  req,
  res,
  next
) => {
  try {
    if (
      !req.user ||
      !req.user._id
    ) {
      return next(
        new AppError(
          'Authentication required',
          401
        )
      );
    }

    if (
      !validateExperienceId(
        req.params.id,
        next
      )
    ) {
      return;
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.reviewId
      )
    ) {
      return next(
        new AppError(
          'Invalid review ID',
          400
        )
      );
    }

    const exp =
      await Experience.findById(
        req.params.id
      );

    if (!exp) {
      return next(
        new AppError(
          'Experience not found',
          404
        )
      );
    }

    const reviewIndex =
      exp.reviews.findIndex(
        (review) =>
          review._id.toString() ===
          req.params.reviewId
      );

    if (reviewIndex === -1) {
      return next(
        new AppError(
          'Review not found',
          404
        )
      );
    }

    exp.reviews.splice(
      reviewIndex,
      1
    );

    exp.recalculateRating();

    await exp.save();

    return success(
      res,
      {
        experienceId:
          exp._id,
        deletedReviewId:
          req.params.reviewId,
        rating:
          exp.rating,
        numReviews:
          exp.numReviews,
      },
      'Review deleted successfully'
    );
  } catch (err) {
    next(err);
  }
};

exports.getFeatured = async (
  req,
  res,
  next
) => {
  try {
    const experiences =
      await Experience.find({
        featured: true,
        status: 'PUBLISHED',
      })
        .populate(
          'category',
          'name slug icon color'
        )
        .populate(
          'reviews.user',
          'name email avatar'
        )
        .sort({
          rating: -1,
          numReviews: -1,
          createdAt: -1,
        })
        .limit(6)
        .lean();

    return success(
      res,
      {
        experiences,
      },
      'Featured experiences fetched successfully'
    );
  } catch (err) {
    next(err);
  }
};

exports.getStats = async (
  req,
  res,
  next
) => {
  try {
    const [
      total,
      published,
      draft,
      archived,
      featured,
      categories,
      avgPrice,
      totalReviews,
    ] = await Promise.all([
      Experience.countDocuments(),

      Experience.countDocuments({
        status: 'PUBLISHED',
      }),

      Experience.countDocuments({
        status: 'DRAFT',
      }),

      Experience.countDocuments({
        status: 'ARCHIVED',
      }),

      Experience.countDocuments({
        featured: true,
      }),

      Category.countDocuments(),

      Experience.aggregate([
        {
          $group: {
            _id: null,
            avg: {
              $avg: '$price',
            },
          },
        },
      ]),

      Experience.aggregate([
        {
          $project: {
            reviewCount: {
              $size: {
                $ifNull: [
                  '$reviews',
                  [],
                ],
              },
            },
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: '$reviewCount',
            },
          },
        },
      ]),
    ]);

    return success(
      res,
      {
        total,
        published,
        draft,
        archived,
        featured,
        categories,
        totalReviews:
          totalReviews[0]?.total || 0,
        avgPrice:
          Math.round(
            (avgPrice[0]?.avg || 0) *
              100
          ) / 100,
      },
      'Experience stats fetched successfully'
    );
  } catch (err) {
    next(err);
  }
};

module.exports = exports;