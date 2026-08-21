const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [
        2,
        'Name must be at least 2 characters',
      ],
      maxlength: [
        60,
        'Name cannot exceed 60 characters',
      ],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [
        254,
        'Email cannot exceed 254 characters',
      ],
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please enter a valid email',
      ],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [
        6,
        'Password must be at least 6 characters',
      ],
      select: false,
    },

    role: {
      type: String,
      enum: {
        values: ['USER', 'ADMIN'],
        message: 'Role must be USER or ADMIN',
      },
      default: 'USER',
      index: true,
    },

    avatar: {
      type: String,
      trim: true,
      default: '',
    },

    bio: {
      type: String,
      trim: true,
      maxlength: [
        500,
        'Bio cannot exceed 500 characters',
      ],
      default: '',
    },

    location: {
      type: String,
      trim: true,
      maxlength: [
        150,
        'Location cannot exceed 150 characters',
      ],
      default: '',
    },

    phone: {
      type: String,
      trim: true,
      maxlength: [
        30,
        'Phone number cannot exceed 30 characters',
      ],
      default: '',
    },

    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Experience',
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    lastLogin: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.index({
  role: 1,
  isActive: 1,
});

userSchema.index({
  createdAt: -1,
});

userSchema.index({
  lastLogin: -1,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);

    this.password = await bcrypt.hash(
      this.password,
      salt
    );

    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (
  candidatePassword
) {
  if (!this.password) {
    return false;
  }

  return bcrypt.compare(
    candidatePassword,
    this.password
  );
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();

  delete obj.password;

  return obj;
};

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model(
  'User',
  userSchema
);