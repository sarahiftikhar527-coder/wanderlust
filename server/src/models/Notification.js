const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },

    title: {
      type: String,
      required: [
        true,
        'Notification title is required',
      ],
      trim: true,
      minlength: [
        2,
        'Notification title must be at least 2 characters',
      ],
      maxlength: [
        150,
        'Notification title cannot exceed 150 characters',
      ],
    },

    message: {
      type: String,
      required: [
        true,
        'Notification message is required',
      ],
      trim: true,
      minlength: [
        2,
        'Notification message must be at least 2 characters',
      ],
      maxlength: [
        1000,
        'Notification message cannot exceed 1000 characters',
      ],
    },

    type: {
      type: String,
      enum: {
        values: [
          'BOOKING',
          'REVIEW',
          'SYSTEM',
          'PROMOTION',
          'WELCOME',
        ],
        message: 'Invalid notification type',
      },
      default: 'SYSTEM',
      index: true,
    },

    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

notificationSchema.index({
  user: 1,
  isRead: 1,
  createdAt: -1,
});

notificationSchema.index({
  user: 1,
  createdAt: -1,
});

notificationSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model(
  'Notification',
  notificationSchema
);