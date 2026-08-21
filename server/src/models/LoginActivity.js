const mongoose = require('mongoose');

const loginActivitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      maxlength: [
        254,
        'Email cannot exceed 254 characters',
      ],
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },

    loginAt: {
      type: Date,
      required: true,
      default: Date.now,
    },

    ipAddress: {
      type: String,
      trim: true,
      maxlength: [
        100,
        'IP address cannot exceed 100 characters',
      ],
      default: '',
    },

    userAgent: {
      type: String,
      trim: true,
      maxlength: [
        1000,
        'User agent cannot exceed 1000 characters',
      ],
      default: '',
    },

    device: {
      type: String,
      trim: true,
      maxlength: [
        100,
        'Device information cannot exceed 100 characters',
      ],
      default: '',
    },

    browser: {
      type: String,
      trim: true,
      maxlength: [
        100,
        'Browser information cannot exceed 100 characters',
      ],
      default: '',
    },

    operatingSystem: {
      type: String,
      trim: true,
      maxlength: [
        100,
        'Operating system cannot exceed 100 characters',
      ],
      default: '',
    },

    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED'],
      default: 'SUCCESS',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

loginActivitySchema.index({
  user: 1,
  loginAt: -1,
});

loginActivitySchema.index({
  email: 1,
  loginAt: -1,
});

loginActivitySchema.index({
  status: 1,
  loginAt: -1,
});

loginActivitySchema.index({
  loginAt: -1,
});

loginActivitySchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model(
  'LoginActivity',
  loginActivitySchema
);