const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    avatar: {
      type: String,
      default: '',
      trim: true,
    },

    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },

    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      minlength: [10, 'Review must be at least 10 characters'],
      maxlength: [500, 'Review cannot exceed 500 characters'],
    },

    status: {
      type: String,
      enum: ['PUBLISHED', 'PENDING', 'HIDDEN'],
      default: 'PUBLISHED',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const experienceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters'],
    },

    shortDescription: {
      type: String,
      maxlength: [200, 'Short description cannot exceed 200 characters'],
      default: '',
      trim: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },

    location: {
      city: {
        type: String,
        required: true,
        trim: true,
      },

      country: {
        type: String,
        required: true,
        trim: true,
      },

      address: {
        type: String,
        default: '',
        trim: true,
      },

      coordinates: {
        lat: {
          type: Number,
          default: null,
          min: -90,
          max: 90,
        },

        lng: {
          type: Number,
          default: null,
          min: -180,
          max: 180,
        },
      },
    },

    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },

    duration: {
      type: String,
      required: true,
      trim: true,
    },

    groupSize: {
      min: {
        type: Number,
        default: 1,
        min: 1,
      },

      max: {
        type: Number,
        default: 10,
        min: 1,
      },
    },

    images: {
      type: [String],
      default: [],
    },

    coverImage: {
      type: String,
      default: '',
      trim: true,
    },

    highlights: {
      type: [String],
      default: [],
    },

    included: {
      type: [String],
      default: [],
    },

    excluded: {
      type: [String],
      default: [],
    },

    itinerary: [
      {
        day: {
          type: Number,
          required: true,
          min: 1,
        },

        title: {
          type: String,
          required: true,
          trim: true,
        },

        description: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],

    reviews: {
      type: [reviewSchema],
      default: [],
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    numReviews: {
      type: Number,
      default: 0,
      min: 0,
    },

    availableDates: {
      type: [Date],
      default: [],
    },

    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
      default: 'PUBLISHED',
      index: true,
    },

    featured: {
      type: Boolean,
      default: false,
      index: true,
    },

    host: {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      bio: {
        type: String,
        default: '',
        trim: true,
      },

      avatar: {
        type: String,
        default: '',
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

experienceSchema.index({
  category: 1,
});

experienceSchema.index({
  price: 1,
});

experienceSchema.index({
  rating: -1,
});

experienceSchema.index({
  title: 'text',
  description: 'text',
});

experienceSchema.index({
  'location.country': 1,
  'location.city': 1,
});

experienceSchema.index({
  status: 1,
  featured: -1,
});

experienceSchema.index({
  'reviews.user': 1,
});

experienceSchema.index({
  'reviews.status': 1,
});

experienceSchema.methods.recalculateRating = function () {
  const publishedReviews = (this.reviews || []).filter(
    (review) => review.status === 'PUBLISHED'
  );

  if (publishedReviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
    return;
  }

  const totalRating = publishedReviews.reduce(
    (total, review) => total + Number(review.rating || 0),
    0
  );

  this.rating =
    Math.round(
      (totalRating / publishedReviews.length) * 10
    ) / 10;

  this.numReviews = publishedReviews.length;
};

experienceSchema.pre('validate', function (next) {
  if (this.title && !this.slug) {
    this.slug =
      this.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') +
      '-' +
      Date.now().toString(36).slice(-4);
  }

  if (
    this.images &&
    this.images.length > 0 &&
    !this.coverImage
  ) {
    this.coverImage = this.images[0];
  }

  if (
    this.groupSize &&
    this.groupSize.min > this.groupSize.max
  ) {
    return next(
      new Error(
        'Minimum group size cannot exceed maximum group size'
      )
    );
  }

  next();
});

experienceSchema.pre('save', function (next) {
  if (this.isModified('reviews')) {
    this.recalculateRating();
  }

  next();
});

experienceSchema.methods.getPublishedReviews = function () {
  return (this.reviews || []).filter(
    (review) => review.status === 'PUBLISHED'
  );
};

experienceSchema.methods.hasUserReviewed = function (userId) {
  if (!userId) {
    return false;
  }

  return (this.reviews || []).some(
    (review) =>
      review.user &&
      review.user.toString() === userId.toString()
  );
};

experienceSchema.methods.addReview = function ({
  user,
  name,
  avatar,
  rating,
  comment,
}) {
  const alreadyReviewed = this.hasUserReviewed(user);

  if (alreadyReviewed) {
    throw new Error(
      'You have already reviewed this experience'
    );
  }

  this.reviews.push({
    user,
    name: name || 'User',
    avatar: avatar || '',
    rating,
    comment,
    status: 'PUBLISHED',
  });

  this.recalculateRating();

  return this.reviews[this.reviews.length - 1];
};

module.exports = mongoose.model(
  'Experience',
  experienceSchema
);