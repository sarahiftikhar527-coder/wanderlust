const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [
        true,
        'Category name is required',
      ],
      unique: true,
      trim: true,
      minlength: [
        2,
        'Category name must be at least 2 characters',
      ],
      maxlength: [
        50,
        'Category name cannot exceed 50 characters',
      ],
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      maxlength: [
        300,
        'Description cannot exceed 300 characters',
      ],
      default: '',
      trim: true,
    },

    image: {
      type: String,
      default: '',
      trim: true,
    },

    icon: {
      type: String,
      default: 'Compass',
      trim: true,
    },

    color: {
      type: String,
      default: '#0ea5e9',
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.pre('validate', function (next) {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  if (this.slug) {
    this.slug = this.slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  next();
});

module.exports = mongoose.model(
  'Category',
  categorySchema
);