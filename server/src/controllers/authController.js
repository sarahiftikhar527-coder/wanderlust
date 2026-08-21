const User = require('../models/User');
const Experience = require('../models/Experience');
const Notification = require('../models/Notification');
const LoginActivity = require('../models/LoginActivity');
const { signToken } = require('../utils/jwt');
const { success } = require('../utils/response');
const AppError = require('../utils/AppError');
const { sendLoginEmail } = require('../utils/sendEmail');

const normalizeEmail = (email) => {
  if (typeof email !== 'string') {
    return '';
  }

  return email.trim().toLowerCase();
};

const normalizeString = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
};

const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || '';
};

const getUserAgent = (req) => {
  return req.get('user-agent') || '';
};

const parseUserAgent = (userAgent) => {
  let browser = 'Unknown';
  let operatingSystem = 'Unknown';
  let device = 'Desktop';

  if (!userAgent) {
    return {
      browser,
      operatingSystem,
      device,
    };
  }

  if (/Edg\/[\d.]+/i.test(userAgent)) {
    browser = 'Microsoft Edge';
  } else if (/OPR\/[\d.]+/i.test(userAgent)) {
    browser = 'Opera';
  } else if (/Chrome\/[\d.]+/i.test(userAgent)) {
    browser = 'Google Chrome';
  } else if (/Firefox\/[\d.]+/i.test(userAgent)) {
    browser = 'Mozilla Firefox';
  } else if (/Safari\/[\d.]+/i.test(userAgent)) {
    browser = 'Safari';
  } else if (/MSIE|Trident/i.test(userAgent)) {
    browser = 'Internet Explorer';
  }

  if (/Windows NT/i.test(userAgent)) {
    operatingSystem = 'Windows';
  } else if (/Android/i.test(userAgent)) {
    operatingSystem = 'Android';
  } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
    operatingSystem = 'iOS';
  } else if (/Mac OS X/i.test(userAgent)) {
    operatingSystem = 'macOS';
  } else if (/Linux/i.test(userAgent)) {
    operatingSystem = 'Linux';
  } else if (/CrOS/i.test(userAgent)) {
    operatingSystem = 'ChromeOS';
  }

  if (/Mobile|Android|iPhone|iPad|iPod/i.test(userAgent)) {
    if (/iPad/i.test(userAgent)) {
      device = 'Tablet';
    } else {
      device = 'Mobile';
    }
  }

  return {
    browser,
    operatingSystem,
    device,
  };
};

const createLoginActivity = async (
  req,
  user,
  status = 'SUCCESS'
) => {
  try {
    if (!user || !user._id) {
      return;
    }

    const userAgent = getUserAgent(req);

    const {
      browser,
      operatingSystem,
      device,
    } = parseUserAgent(userAgent);

    await LoginActivity.create({
      user: user._id,
      email: user.email,
      loginAt: new Date(),
      ipAddress: getClientIp(req),
      userAgent,
      device,
      browser,
      operatingSystem,
      status,
    });
  } catch (error) {
    console.error(
      'Login activity creation failed:',
      error.message
    );
  }
};

const sendLoginNotificationEmail = async (
  user,
  req
) => {
  try {
    if (
      !user ||
      !user.email ||
      typeof sendLoginEmail !== 'function'
    ) {
      return;
    }

    const userAgent = getUserAgent(req);

    const {
      browser,
      operatingSystem,
      device,
    } = parseUserAgent(userAgent);

    await sendLoginEmail({
      name: user.name,
      email: user.email,
      ipAddress: getClientIp(req),
      browser,
      operatingSystem,
      device,
      loginAt: new Date(),
    });
  } catch (error) {
    console.error(
      'Login email notification failed:',
      error.message
    );
  }
};

const sanitizeUser = (user) => {
  const userObject =
    typeof user.toObject === 'function'
      ? user.toObject()
      : { ...user };

  delete userObject.password;
  delete userObject.__v;

  return userObject;
};

exports.register = async (
  req,
  res,
  next
) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body || {};

    const normalizedName =
      normalizeString(name);

    const normalizedEmail =
      normalizeEmail(email);

    if (!normalizedName) {
      return next(
        new AppError(
          'Name is required',
          400
        )
      );
    }

    if (normalizedName.length < 2) {
      return next(
        new AppError(
          'Name must be at least 2 characters',
          400
        )
      );
    }

    if (normalizedName.length > 60) {
      return next(
        new AppError(
          'Name cannot exceed 60 characters',
          400
        )
      );
    }

    if (!normalizedEmail) {
      return next(
        new AppError(
          'Email is required',
          400
        )
      );
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return next(
        new AppError(
          'Please enter a valid email address',
          400
        )
      );
    }

    if (
      typeof password !== 'string' ||
      !password
    ) {
      return next(
        new AppError(
          'Password is required',
          400
        )
      );
    }

    if (password.length < 6) {
      return next(
        new AppError(
          'Password must be at least 6 characters',
          400
        )
      );
    }

    const existingUser =
      await User.findOne({
        email: normalizedEmail,
      });

    if (existingUser) {
      return next(
        new AppError(
          'An account with this email already exists',
          409
        )
      );
    }

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password,
      role: 'USER',
      isActive: true,
    });

    try {
      await Notification.create({
        user: user._id,
        title: 'Welcome to Wanderlust!',
        message: `Hi ${user.name}, welcome to Wanderlust. Start exploring curated travel experiences from around the world.`,
        type: 'WELCOME',
      });
    } catch (notificationError) {
      console.error(
        'Welcome notification creation failed:',
        notificationError.message
      );
    }

    const token = signToken(user._id);

    user.lastLogin = new Date();

    await user.save();

    await createLoginActivity(
      req,
      user,
      'SUCCESS'
    );

    await sendLoginNotificationEmail(
      user,
      req
    );

    return success(
      res,
      {
        token,
        user: sanitizeUser(user),
      },
      'Account created successfully',
      201
    );
  } catch (err) {
    if (err.code === 11000) {
      return next(
        new AppError(
          'An account with this email already exists',
          409
        )
      );
    }

    next(err);
  }
};

exports.login = async (
  req,
  res,
  next
) => {
  try {
    const {
      email,
      password,
    } = req.body || {};

    const normalizedEmail =
      normalizeEmail(email);

    if (!normalizedEmail) {
      return next(
        new AppError(
          'Email is required',
          400
        )
      );
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return next(
        new AppError(
          'Please enter a valid email address',
          400
        )
      );
    }

    if (
      typeof password !== 'string' ||
      !password
    ) {
      return next(
        new AppError(
          'Password is required',
          400
        )
      );
    }

    const user =
      await User.findOne({
        email: normalizedEmail,
      }).select('+password');

    if (!user) {
      return next(
        new AppError(
          'Invalid email or password',
          401
        )
      );
    }

    if (!user.isActive) {
      await createLoginActivity(
        req,
        user,
        'FAILED'
      );

      return next(
        new AppError(
          'Your account has been deactivated. Please contact support.',
          403
        )
      );
    }

    if (!user.password) {
      await createLoginActivity(
        req,
        user,
        'FAILED'
      );

      return next(
        new AppError(
          'Unable to authenticate this account',
          500
        )
      );
    }

    const isMatch =
      await user.comparePassword(
        password
      );

    if (!isMatch) {
      await createLoginActivity(
        req,
        user,
        'FAILED'
      );

      return next(
        new AppError(
          'Invalid email or password',
          401
        )
      );
    }

    const token = signToken(user._id);

    user.lastLogin = new Date();

    await user.save();

    await createLoginActivity(
      req,
      user,
      'SUCCESS'
    );

    await sendLoginNotificationEmail(
      user,
      req
    );

    return success(
      res,
      {
        token,
        user: sanitizeUser(user),
      },
      'Logged in successfully'
    );
  } catch (err) {
    next(err);
  }
};

exports.logout = async (
  req,
  res,
  next
) => {
  try {
    return success(
      res,
      null,
      'Logged out successfully'
    );
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (
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

    const user =
      await User.findById(
        req.user._id
      ).populate(
        'favorites',
        'title coverImage price rating location'
      );

    if (!user) {
      return next(
        new AppError(
          'User not found',
          404
        )
      );
    }

    if (!user.isActive) {
      return next(
        new AppError(
          'Your account has been deactivated',
          403
        )
      );
    }

    return success(
      res,
      {
        user: sanitizeUser(user),
      },
      'Profile fetched successfully'
    );
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (
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

    const allowedFields = [
      'name',
      'bio',
      'location',
      'phone',
      'avatar',
    ];

    const updates = {};

    allowedFields.forEach(
      (field) => {
        if (
          req.body &&
          req.body[field] !== undefined
        ) {
          updates[field] =
            typeof req.body[field] ===
            'string'
              ? req.body[field].trim()
              : req.body[field];
        }
      }
    );

    if (
      updates.name !== undefined &&
      !updates.name
    ) {
      return next(
        new AppError(
          'Name cannot be empty',
          400
        )
      );
    }

    if (
      updates.name &&
      updates.name.length < 2
    ) {
      return next(
        new AppError(
          'Name must be at least 2 characters',
          400
        )
      );
    }

    if (
      updates.name &&
      updates.name.length > 60
    ) {
      return next(
        new AppError(
          'Name cannot exceed 60 characters',
          400
        )
      );
    }

    if (
      updates.bio &&
      updates.bio.length > 500
    ) {
      return next(
        new AppError(
          'Bio cannot exceed 500 characters',
          400
        )
      );
    }

    if (
      updates.avatar !== undefined &&
      updates.avatar !== null
    ) {
      if (
        typeof updates.avatar !==
        'string'
      ) {
        return next(
          new AppError(
            'Avatar must be a valid Cloudinary URL',
            400
          )
        );
      }

      const avatarUrl =
        updates.avatar.trim();

      if (
        avatarUrl &&
        !avatarUrl.startsWith(
          'https://res.cloudinary.com/'
        )
      ) {
        return next(
          new AppError(
            'Avatar must be a valid Cloudinary URL',
            400
          )
        );
      }

      updates.avatar = avatarUrl;
    }

    const user =
      await User.findByIdAndUpdate(
        req.user._id,
        updates,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!user) {
      return next(
        new AppError(
          'User not found',
          404
        )
      );
    }

    return success(
      res,
      {
        user: sanitizeUser(user),
      },
      'Profile updated successfully'
    );
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (
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

    const {
      currentPassword,
      newPassword,
    } = req.body || {};

    if (
      typeof currentPassword !== 'string' ||
      !currentPassword
    ) {
      return next(
        new AppError(
          'Current password is required',
          400
        )
      );
    }

    if (
      typeof newPassword !== 'string' ||
      !newPassword
    ) {
      return next(
        new AppError(
          'New password is required',
          400
        )
      );
    }

    if (newPassword.length < 6) {
      return next(
        new AppError(
          'New password must be at least 6 characters',
          400
        )
      );
    }

    const user =
      await User.findById(
        req.user._id
      ).select('+password');

    if (!user) {
      return next(
        new AppError(
          'User not found',
          404
        )
      );
    }

    if (!user.isActive) {
      return next(
        new AppError(
          'Your account has been deactivated',
          403
        )
      );
    }

    const isMatch =
      await user.comparePassword(
        currentPassword
      );

    if (!isMatch) {
      return next(
        new AppError(
          'Current password is incorrect',
          400
        )
      );
    }

    const samePassword =
      await user.comparePassword(
        newPassword
      );

    if (samePassword) {
      return next(
        new AppError(
          'New password must be different from your current password',
          400
        )
      );
    }

    user.password = newPassword;

    await user.save();

    return success(
      res,
      null,
      'Password changed successfully'
    );
  } catch (err) {
    next(err);
  }
};

exports.toggleFavorite = async (
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

    const {
      experienceId,
    } = req.params;

    if (!experienceId) {
      return next(
        new AppError(
          'Experience ID is required',
          400
        )
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        experienceId
      )
    ) {
      return next(
        new AppError(
          'Invalid experience ID',
          400
        )
      );
    }

    const experience =
      await Experience.findById(
        experienceId
      );

    if (!experience) {
      return next(
        new AppError(
          'Experience not found',
          404
        )
      );
    }

    const user =
      await User.findById(
        req.user._id
      );

    if (!user) {
      return next(
        new AppError(
          'User not found',
          404
        )
      );
    }

    if (!user.isActive) {
      return next(
        new AppError(
          'Your account has been deactivated',
          403
        )
      );
    }

    if (
      !Array.isArray(user.favorites)
    ) {
      user.favorites = [];
    }

    const index =
      user.favorites.findIndex(
        (favorite) =>
          favorite.toString() ===
          experienceId
      );

    let isFavorited;

    if (index !== -1) {
      user.favorites.splice(
        index,
        1
      );

      isFavorited = false;
    } else {
      user.favorites.push(
        experienceId
      );

      isFavorited = true;
    }

    await user.save();

    return success(
      res,
      {
        isFavorited,
      },
      isFavorited
        ? 'Added to favorites'
        : 'Removed from favorites'
    );
  } catch (err) {
    next(err);
  }
};

exports.getFavorites = async (
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

    const user =
      await User.findById(
        req.user._id
      ).populate(
        'favorites'
      );

    if (!user) {
      return next(
        new AppError(
          'User not found',
          404
        )
      );
    }

    if (!user.isActive) {
      return next(
        new AppError(
          'Your account has been deactivated',
          403
        )
      );
    }

    return success(
      res,
      {
        favorites:
          user.favorites || [],
      },
      'Favorites fetched successfully'
    );
  } catch (err) {
    next(err);
  }
};

exports.deleteAccount = async (
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

    const user =
      await User.findByIdAndDelete(
        req.user._id
      );

    if (!user) {
      return next(
        new AppError(
          'User not found',
          404
        )
      );
    }

    await Promise.all([
      LoginActivity.deleteMany({
        user: req.user._id,
      }),
      Notification.deleteMany({
        user: req.user._id,
      }),
    ]);

    return success(
      res,
      null,
      'Account deleted successfully'
    );
  } catch (err) {
    next(err);
  }
};

module.exports = exports;