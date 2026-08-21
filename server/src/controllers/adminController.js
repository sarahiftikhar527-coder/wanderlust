const mongoose = require('mongoose');

const User = require('../models/User');
const Experience = require('../models/Experience');
const Booking = require('../models/Booking');
const Category = require('../models/Category');
const LoginActivity = require('../models/LoginActivity');

const {
  success,
  paginate,
  paginationMeta,
} = require('../utils/response');

const AppError = require('../utils/AppError');

const VALID_ROLES = ['USER', 'ADMIN'];
const VALID_STATUSES = ['active', 'inactive'];

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const normalizeSearch = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
};

exports.getAdminDashboard = async (
  req,
  res,
  next
) => {
  try {
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalExperiences,
      publishedExperiences,
      draftExperiences,
      archivedExperiences,
      totalBookings,
      totalCategories,
      totalRevenue,
      recentUsers,
      recentBookings,
      bookingsByStatus,
      experiencesByCategory,
      monthlyRevenue,
      loginStats,
    ] = await Promise.all([
      User.countDocuments(),

      User.countDocuments({
        isActive: true,
      }),

      User.countDocuments({
        isActive: false,
      }),

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

      Booking.countDocuments(),

      Category.countDocuments(),

      Booking.aggregate([
        {
          $match: {
            status: {
              $ne: 'CANCELLED',
            },
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $ifNull: ['$totalPrice', 0],
              },
            },
          },
        },
      ]),

      User.find()
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .select(
          'name email avatar role isActive createdAt lastLogin'
        )
        .lean(),

      Booking.find()
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .populate(
          'user',
          'name email avatar'
        )
        .populate(
          'experience',
          'title slug coverImage price'
        )
        .lean(),

      Booking.aggregate([
        {
          $group: {
            _id: '$status',
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
      ]),

      Experience.aggregate([
        {
          $group: {
            _id: '$category',
            count: {
              $sum: 1,
            },
          },
        },
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'category',
          },
        },
        {
          $unwind: {
            path: '$category',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 0,
            name: {
              $ifNull: [
                '$category.name',
                'Uncategorized',
              ],
            },
            count: 1,
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
      ]),

      Booking.aggregate([
        {
          $match: {
            status: {
              $ne: 'CANCELLED',
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m',
                date: '$createdAt',
              },
            },
            revenue: {
              $sum: {
                $ifNull: ['$totalPrice', 0],
              },
            },
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: -1,
          },
        },
        {
          $limit: 6,
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]),

      LoginActivity.aggregate([
        {
          $group: {
            _id: '$status',
            count: {
              $sum: 1,
            },
          },
        },
      ]),
    ]);

    const loginSummary = {
      total: 0,
      successful: 0,
      failed: 0,
    };

    loginStats.forEach((item) => {
      const status = String(
        item._id || ''
      ).toUpperCase();

      const count = Number(
        item.count || 0
      );

      loginSummary.total += count;

      if (status === 'SUCCESS') {
        loginSummary.successful = count;
      }

      if (status === 'FAILED') {
        loginSummary.failed = count;
      }
    });

    const successRate =
      loginSummary.total > 0
        ? Number(
            (
              (loginSummary.successful /
                loginSummary.total) *
              100
            ).toFixed(2)
          )
        : 0;

    const revenueTotal = Number(
      totalRevenue[0]?.total || 0
    );

    return success(
      res,
      {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: inactiveUsers,
        },

        experiences: {
          total: totalExperiences,
          published: publishedExperiences,
          draft: draftExperiences,
          archived: archivedExperiences,
        },

        bookings: {
          total: totalBookings,
          byStatus: bookingsByStatus,
        },

        categories: {
          total: totalCategories,
        },

        revenue: {
          total: revenueTotal,
          monthly: monthlyRevenue,
        },

        loginActivity: {
          total: loginSummary.total,
          successful:
            loginSummary.successful,
          failed: loginSummary.failed,
          successRate,
        },

        recentUsers,
        recentBookings,
        experiencesByCategory,
      },
      'Dashboard statistics fetched successfully'
    );
  } catch (err) {
    next(err);
  }
};

exports.getAdminStats = async (
  req,
  res,
  next
) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalExperiences,
      publishedExperiences,
      totalBookings,
      totalCategories,
      revenueResult,
    ] = await Promise.all([
      User.countDocuments(),

      User.countDocuments({
        isActive: true,
      }),

      Experience.countDocuments(),

      Experience.countDocuments({
        status: 'PUBLISHED',
      }),

      Booking.countDocuments(),

      Category.countDocuments(),

      Booking.aggregate([
        {
          $match: {
            status: {
              $ne: 'CANCELLED',
            },
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $ifNull: ['$totalPrice', 0],
              },
            },
          },
        },
      ]),
    ]);

    return success(
      res,
      {
        users: {
          total: totalUsers,
          active: activeUsers,
        },

        experiences: {
          total: totalExperiences,
          published:
            publishedExperiences,
        },

        bookings: {
          total: totalBookings,
        },

        categories: {
          total: totalCategories,
        },

        revenue: {
          total: Number(
            revenueResult[0]?.total || 0
          ),
        },
      },
      'Admin statistics fetched successfully'
    );
  } catch (err) {
    next(err);
  }
};

exports.getAllUsers = async (
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

    const search = normalizeSearch(
      req.query.search
    );

    const role = req.query.role
      ? String(req.query.role)
          .trim()
          .toUpperCase()
      : '';

    const status = req.query.status
      ? String(req.query.status)
          .trim()
          .toLowerCase()
      : '';

    const query = {};

    if (search) {
      const escapedSearch =
        search.replace(
          /[.*+?^${}()|[\]\\]/g,
          '\\$&'
        );

      const searchRegex = new RegExp(
        escapedSearch,
        'i'
      );

      query.$or = [
        {
          name: searchRegex,
        },
        {
          email: searchRegex,
        },
      ];
    }

    if (role) {
      if (
        !VALID_ROLES.includes(role)
      ) {
        return next(
          new AppError(
            `Invalid role. Allowed roles: ${VALID_ROLES.join(
              ', '
            )}`,
            400
          )
        );
      }

      query.role = role;
    }

    if (status) {
      if (
        !VALID_STATUSES.includes(
          status
        )
      ) {
        return next(
          new AppError(
            'Invalid user status',
            400
          )
        );
      }

      query.isActive =
        status === 'active';
    }

    const [
      total,
      users,
    ] = await Promise.all([
      User.countDocuments(query),

      User.find(query)
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .select('-password -__v')
        .lean(),
    ]);

    const pagination =
      paginationMeta(
        total,
        page,
        limit
      );

    return success(
      res,
      {
        users,
        pagination,
      },
      'Users fetched successfully'
    );
  } catch (err) {
    next(err);
  }
};

exports.getUserById = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return next(
        new AppError(
          'Invalid user ID',
          400
        )
      );
    }

    const user =
      await User.findById(id)
        .select('-password -__v')
        .lean();

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
        user,
      },
      'User fetched successfully'
    );
  } catch (err) {
    next(err);
  }
};

exports.getUserLoginActivity =
  async (
    req,
    res,
    next
  ) => {
    try {
      const { id } =
        req.params;

      if (
        !isValidObjectId(id)
      ) {
        return next(
          new AppError(
            'Invalid user ID',
            400
          )
        );
      }

      const user =
        await User.findById(id)
          .select(
            'name email role isActive avatar lastLogin createdAt'
          )
          .lean();

      if (!user) {
        return next(
          new AppError(
            'User not found',
            404
          )
        );
      }

      const activities =
        await LoginActivity.find({
          user: id,
        })
          .sort({
            loginAt: -1,
          })
          .limit(100)
          .lean();

      return success(
        res,
        {
          user,
          activities,
          count:
            activities.length,
        },
        'User login activity fetched successfully'
      );
    } catch (err) {
      next(err);
    }
  };

exports.updateUserStatus =
  async (
    req,
    res,
    next
  ) => {
    try {
      const { id } =
        req.params;

      if (
        !isValidObjectId(id)
      ) {
        return next(
          new AppError(
            'Invalid user ID',
            400
          )
        );
      }

      if (
        !req.body ||
        typeof req.body !==
          'object'
      ) {
        return next(
          new AppError(
            'Request body is required',
            400
          )
        );
      }

      const {
        isActive,
        role,
      } = req.body;

      const updates = {};

      if (
        isActive !== undefined
      ) {
        let normalizedActive;

        if (
          typeof isActive ===
          'boolean'
        ) {
          normalizedActive =
            isActive;
        } else if (
          isActive === 'true'
        ) {
          normalizedActive =
            true;
        } else if (
          isActive === 'false'
        ) {
          normalizedActive =
            false;
        } else {
          return next(
            new AppError(
              'isActive must be true or false',
              400
            )
          );
        }

        updates.isActive =
          normalizedActive;
      }

      if (role !== undefined) {
        const normalizedRole =
          String(role)
            .trim()
            .toUpperCase();

        if (
          !VALID_ROLES.includes(
            normalizedRole
          )
        ) {
          return next(
            new AppError(
              `Invalid role. Allowed roles: ${VALID_ROLES.join(
                ', '
              )}`,
              400
            )
          );
        }

        if (
          req.user &&
          id ===
            req.user._id.toString() &&
          normalizedRole !==
            'ADMIN'
        ) {
          return next(
            new AppError(
              'You cannot remove your own admin role',
              400
            )
          );
        }

        updates.role =
          normalizedRole;
      }

      if (
        Object.keys(updates)
          .length === 0
      ) {
        return next(
          new AppError(
            'No valid fields provided for update',
            400
          )
        );
      }

      if (
        req.user &&
        id ===
          req.user._id.toString() &&
        updates.isActive === false
      ) {
        return next(
          new AppError(
            'You cannot deactivate your own account',
            400
          )
        );
      }

      const user =
        await User.findByIdAndUpdate(
          id,
          updates,
          {
            new: true,
            runValidators: true,
          }
        )
          .select(
            '-password -__v'
          )
          .lean();

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
          user,
        },
        'User updated successfully'
      );
    } catch (err) {
      next(err);
    }
  };

exports.deleteUser = async (
  req,
  res,
  next
) => {
  try {
    const { id } =
      req.params;

    if (!isValidObjectId(id)) {
      return next(
        new AppError(
          'Invalid user ID',
          400
        )
      );
    }

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
      id ===
      req.user._id.toString()
    ) {
      return next(
        new AppError(
          'You cannot delete your own account',
          400
        )
      );
    }

    const user =
      await User.findById(id);

    if (!user) {
      return next(
        new AppError(
          'User not found',
          404
        )
      );
    }

    await Promise.all([
      Booking.deleteMany({
        user: id,
      }),

      LoginActivity.deleteMany({
        user: id,
      }),

      User.findByIdAndDelete(id),
    ]);

    return success(
      res,
      {
        deletedUserId: id,
      },
      'User and associated data deleted successfully'
    );
  } catch (err) {
    next(err);
  }
};

module.exports = exports;