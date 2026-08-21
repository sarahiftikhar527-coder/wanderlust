const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    experience: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Experience',
      required: true,
      index: true,
    },

    experienceTitle: {
      type: String,
      required: true,
      trim: true,
    },

    experienceImage: {
      type: String,
      default: '',
      trim: true,
    },

    experienceLocation: {
      type: String,
      default: '',
      trim: true,
    },

    bookingDate: {
      type: Date,
      required: [true, 'Booking date is required'],
    },

    guests: {
      adults: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
      },

      children: {
        type: Number,
        min: 0,
        default: 0,
      },
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        'PENDING',
        'CONFIRMED',
        'COMPLETED',
        'CANCELLED',
      ],
      default: 'PENDING',
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: [
        'PENDING',
        'PAID',
        'REFUNDED',
      ],
      default: 'PENDING',
    },

    contactPhone: {
      type: String,
      trim: true,
      default: '',
    },

    specialRequests: {
      type: String,
      trim: true,
      maxlength: [
        500,
        'Special requests cannot exceed 500 characters',
      ],
      default: '',
    },

    cancellationReason: {
      type: String,
      trim: true,
      default: '',
    },

    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({
  user: 1,
  createdAt: -1,
});

bookingSchema.index({
  experience: 1,
});

bookingSchema.index({
  status: 1,
});

bookingSchema.index({
  bookingDate: 1,
});

module.exports = mongoose.model(
  'Booking',
  bookingSchema
);