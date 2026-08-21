const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [
        2,
        "Name must be at least 2 characters",
      ],
      maxlength: [
        100,
        "Name cannot exceed 100 characters",
      ],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      maxlength: [
        150,
        "Email cannot exceed 150 characters",
      ],
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },

    subject: {
      type: String,
      trim: true,
      maxlength: [
        200,
        "Subject cannot exceed 200 characters",
      ],
      default: "",
    },

    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      minlength: [
        10,
        "Message must be at least 10 characters",
      ],
      maxlength: [
        5000,
        "Message cannot exceed 5000 characters",
      ],
    },

    status: {
      type: String,
      enum: {
        values: ["NEW", "READ", "REPLIED"],
        message:
          "Status must be NEW, READ, or REPLIED",
      },
      default: "NEW",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

contactSchema.index({
  createdAt: -1,
});

contactSchema.index({
  status: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "Contact",
  contactSchema
);