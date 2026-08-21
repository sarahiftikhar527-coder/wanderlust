const mongoose = require('mongoose');

const Notification = require('../models/Notification');

const {
  success,
  paginate,
  paginationMeta,
} = require('../utils/response');

const AppError = require('../utils/AppError');

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const requireAuth = (req, next) => {
  if (!req.user || !req.user._id) {
    next(
      new AppError(
        'Authentication required',
        401
      )
    );

    return false;
  }

  return true;
};

exports.getMyNotifications = async (
  req,
  res,
  next
) => {
  try {
    if (!requireAuth(req, next)) {
      return;
    }

    const {
      page,
      limit,
      skip,
    } = paginate(req.query);

    const query = {
      user: req.user._id,
    };

    const [
      total,
      notifications,
      unreadCount,
    ] = await Promise.all([
      Notification.countDocuments(query),

      Notification.find(query)
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      Notification.countDocuments({
        user: req.user._id,
        isRead: false,
      }),
    ]);

    return success(
      res,
      {
        notifications,
        unreadCount,
        pagination: paginationMeta(
          total,
          page,
          limit
        ),
      },
      'Notifications fetched successfully'
    );
  } catch (err) {
    next(err);
  }
};

exports.markAsRead = async (
  req,
  res,
  next
) => {
  try {
    if (!requireAuth(req, next)) {
      return;
    }

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return next(
        new AppError(
          'Invalid notification ID',
          400
        )
      );
    }

    const notification =
      await Notification.findOneAndUpdate(
        {
          _id: id,
          user: req.user._id,
        },
        {
          $set: {
            isRead: true,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!notification) {
      return next(
        new AppError(
          'Notification not found',
          404
        )
      );
    }

    const unreadCount =
      await Notification.countDocuments({
        user: req.user._id,
        isRead: false,
      });

    return success(
      res,
      {
        notification,
        unreadCount,
      },
      'Notification marked as read'
    );
  } catch (err) {
    next(err);
  }
};

exports.markAllAsRead = async (
  req,
  res,
  next
) => {
  try {
    if (!requireAuth(req, next)) {
      return;
    }

    const result =
      await Notification.updateMany(
        {
          user: req.user._id,
          isRead: false,
        },
        {
          $set: {
            isRead: true,
          },
        }
      );

    return success(
      res,
      {
        modifiedCount:
          result.modifiedCount || 0,
        unreadCount: 0,
      },
      'All notifications marked as read'
    );
  } catch (err) {
    next(err);
  }
};

exports.deleteNotification = async (
  req,
  res,
  next
) => {
  try {
    if (!requireAuth(req, next)) {
      return;
    }

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return next(
        new AppError(
          'Invalid notification ID',
          400
        )
      );
    }

    const notification =
      await Notification.findOneAndDelete({
        _id: id,
        user: req.user._id,
      });

    if (!notification) {
      return next(
        new AppError(
          'Notification not found',
          404
        )
      );
    }

    const unreadCount =
      await Notification.countDocuments({
        user: req.user._id,
        isRead: false,
      });

    return success(
      res,
      {
        deletedNotificationId: id,
        unreadCount,
      },
      'Notification deleted successfully'
    );
  } catch (err) {
    next(err);
  }
};

exports.clearAll = async (
  req,
  res,
  next
) => {
  try {
    if (!requireAuth(req, next)) {
      return;
    }

    const result =
      await Notification.deleteMany({
        user: req.user._id,
      });

    return success(
      res,
      {
        deletedCount:
          result.deletedCount || 0,
        unreadCount: 0,
      },
      'All notifications cleared successfully'
    );
  } catch (err) {
    next(err);
  }
};

module.exports = exports;