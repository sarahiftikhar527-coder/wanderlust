const mongoose = require('mongoose');

const Booking = require('../models/Booking');
const Experience = require('../models/Experience');
const Notification = require('../models/Notification');

const {
  success,
  paginate,
  paginationMeta,
} = require('../utils/response');

const AppError = require('../utils/AppError');

const BOOKING_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED',
];

const PAYMENT_STATUSES = [
  'PENDING',
  'PAID',
  'REFUNDED',
];

const normalizeString = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
};

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const escapeRegex = (value) => {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&'
  );
};

const createNotification = async ({
  user,
  title,
  message,
  relatedId,
}) => {
  try {
    if (!user) {
      return;
    }

    await Notification.create({
      user,
      title,
      message,
      type: 'BOOKING',
      relatedId,
    });
  } catch (error) {
    console.error(
      'Booking notification failed:',
      error.message
    );
  }
};

const validateGuests = (guests) => {
  const adults =
    Number.isInteger(guests?.adults)
      ? guests.adults
      : 1;

  const children =
    Number.isInteger(guests?.children)
      ? guests.children
      : 0;

  if (adults < 1) {
    throw new AppError(
      'At least one adult is required',
      400
    );
  }

  if (children < 0) {
    throw new AppError(
      'Children count cannot be negative',
      400
    );
  }

  return {
    adults,
    children,
  };
};

const calculateBookingPrice = (
  price,
  adults,
  children
) => {
  const adultPrice =
    Number(price) * adults;

  const childPrice =
    Number(price) * 0.5 * children;

  return Number(
    (
      adultPrice + childPrice
    ).toFixed(2)
  );
};

const populateBooking = (query) => {
  return query
    .populate(
      'user',
      'name email avatar phone'
    )
    .populate(
      'experience',
      'title coverImage price location'
    );
};

exports.createBooking = async (
  req,
  res,
  next
) => {
  try {
    if (!req.user?._id) {
      return next(
        new AppError(
          'Authentication required',
          401
        )
      );
    }

    const {
      experience: experienceId,
      bookingDate,
      guests,
      contactPhone,
      specialRequests,
    } = req.body || {};

    if (!experienceId) {
      return next(
        new AppError(
          'Experience is required',
          400
        )
      );
    }

    if (!isValidObjectId(experienceId)) {
      return next(
        new AppError(
          'Invalid experience ID',
          400
        )
      );
    }

    if (!bookingDate) {
      return next(
        new AppError(
          'Booking date is required',
          400
        )
      );
    }

    const selectedDate = new Date(
      bookingDate
    );

    if (
      Number.isNaN(
        selectedDate.getTime()
      )
    ) {
      return next(
        new AppError(
          'Invalid booking date',
          400
        )
      );
    }

    if (
      selectedDate.getTime() <=
      Date.now()
    ) {
      return next(
        new AppError(
          'Booking date must be in the future',
          400
        )
      );
    }

    const exp =
      await Experience.findById(
        experienceId
      );

    if (!exp) {
      return next(
        new AppError(
          'Experience not found',
          404
        )
      );
    }

    const {
      adults,
      children,
    } = validateGuests(guests);

    const totalGuests =
      adults + children;

    if (
      exp.groupSize?.max &&
      totalGuests >
        exp.groupSize.max
    ) {
      return next(
        new AppError(
          `Maximum group size is ${exp.groupSize.max}`,
          400
        )
      );
    }

    if (
      exp.groupSize?.min &&
      totalGuests <
        exp.groupSize.min
    ) {
      return next(
        new AppError(
          `Minimum group size is ${exp.groupSize.min}`,
          400
        )
      );
    }

    const price =
      Number(exp.price);

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      return next(
        new AppError(
          'Experience has an invalid price',
          400
        )
      );
    }

    const totalPrice =
      calculateBookingPrice(
        price,
        adults,
        children
      );

    const phone =
      normalizeString(contactPhone);

    const requests =
      normalizeString(
        specialRequests
      );

    if (phone.length > 30) {
      return next(
        new AppError(
          'Contact phone cannot exceed 30 characters',
          400
        )
      );
    }

    if (requests.length > 1000) {
      return next(
        new AppError(
          'Special requests cannot exceed 1000 characters',
          400
        )
      );
    }

    const existingBooking =
      await Booking.findOne({
        user: req.user._id,
        experience: experienceId,
        bookingDate: selectedDate,
        status: {
          $in: [
            'PENDING',
            'CONFIRMED',
          ],
        },
      });

    if (existingBooking) {
      return next(
        new AppError(
          'You already have a booking for this experience on this date',
          409
        )
      );
    }

    const booking =
      await Booking.create({
        user: req.user._id,
        experience: experienceId,
        experienceTitle:
          exp.title || '',
        experienceImage:
          exp.coverImage || '',
        experienceLocation:
          exp.location
            ? [
                exp.location.city,
                exp.location.country,
              ]
                .filter(Boolean)
                .join(', ')
            : '',
        bookingDate:
          selectedDate,
        guests: {
          adults,
          children,
        },
        totalPrice,
        contactPhone: phone,
        specialRequests:
          requests,
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
      });

    await createNotification({
      user: req.user._id,
      title: 'Booking Confirmed',
      message: `Your booking for "${exp.title}" on ${selectedDate.toLocaleDateString()} has been confirmed.`,
      relatedId: booking._id,
    });

    const populatedBooking =
      await populateBooking(
        Booking.findById(
          booking._id
        )
      );

    return success(
      res,
      {
        booking:
          populatedBooking,
      },
      'Booking created successfully',
      201
    );
  } catch (err) {
    next(err);
  }
};

exports.getMyBookings = async (
  req,
  res,
  next
) => {
  try {
    if (!req.user?._id) {
      return next(
        new AppError(
          'Authentication required',
          401
        )
      );
    }

    const {
      page,
      limit,
      skip,
    } = paginate(req.query);

    const status =
      normalizeString(
        req.query.status
      ).toUpperCase();

    const query = {
      user: req.user._id,
    };

    if (status) {
      if (
        !BOOKING_STATUSES.includes(
          status
        )
      ) {
        return next(
          new AppError(
            `Invalid booking status. Allowed values: ${BOOKING_STATUSES.join(', ')}`,
            400
          )
        );
      }

      query.status = status;
    }

    const [
      total,
      bookings,
    ] = await Promise.all([
      Booking.countDocuments(query),

      populateBooking(
        Booking.find(query)
          .sort({
            bookingDate: -1,
            createdAt: -1,
          })
          .skip(skip)
          .limit(limit)
          .lean()
      ),
    ]);

    return success(
      res,
      {
        bookings,
        pagination:
          paginationMeta(
            total,
            page,
            limit
          ),
      },
      'Bookings fetched successfully'
    );
  } catch (err) {
    next(err);
  }
};

exports.getBooking = async (
  req,
  res,
  next
) => {
  try {
    if (!req.user?._id) {
      return next(
        new AppError(
          'Authentication required',
          401
        )
      );
    }

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return next(
        new AppError(
          'Invalid booking ID',
          400
        )
      );
    }

    const booking =
      await populateBooking(
        Booking.findById(id)
      );

    if (!booking) {
      return next(
        new AppError(
          'Booking not found',
          404
        )
      );
    }

    const bookingUserId =
      booking.user?._id
        ? booking.user._id.toString()
        : booking.user?.toString();

    const currentUserId =
      req.user._id.toString();

    const isOwner =
      bookingUserId ===
      currentUserId;

    const isAdmin =
      String(
        req.user.role || ''
      ).toUpperCase() ===
      'ADMIN';

    if (!isOwner && !isAdmin) {
      return next(
        new AppError(
          'Not authorized to view this booking',
          403
        )
      );
    }

    return success(
      res,
      {
        booking,
      },
      'Booking fetched successfully'
    );
  } catch (err) {
    next(err);
  }
};

exports.cancelBooking = async (
  req,
  res,
  next
) => {
  try {
    if (!req.user?._id) {
      return next(
        new AppError(
          'Authentication required',
          401
        )
      );
    }

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return next(
        new AppError(
          'Invalid booking ID',
          400
        )
      );
    }

    const booking =
      await Booking.findById(id);

    if (!booking) {
      return next(
        new AppError(
          'Booking not found',
          404
        )
      );
    }

    if (
      booking.user.toString() !==
      req.user._id.toString()
    ) {
      return next(
        new AppError(
          'You are not authorized to cancel this booking',
          403
        )
      );
    }

    if (
      booking.status ===
      'CANCELLED'
    ) {
      return next(
        new AppError(
          'Booking is already cancelled',
          400
        )
      );
    }

    if (
      booking.status ===
      'COMPLETED'
    ) {
      return next(
        new AppError(
          'Completed bookings cannot be cancelled',
          400
        )
      );
    }

    if (
      new Date(
        booking.bookingDate
      ) <= new Date()
    ) {
      return next(
        new AppError(
          'Past bookings cannot be cancelled',
          400
        )
      );
    }

    const reason =
      normalizeString(
        req.body?.reason
      );

    if (reason.length > 500) {
      return next(
        new AppError(
          'Cancellation reason cannot exceed 500 characters',
          400
        )
      );
    }

    booking.status =
      'CANCELLED';

    if (
      booking.paymentStatus ===
      'PAID'
    ) {
      booking.paymentStatus =
        'REFUNDED';
    }

    booking.cancellationReason =
      reason;

    booking.cancelledAt =
      new Date();

    await booking.save();

    await createNotification({
      user: req.user._id,
      title: 'Booking Cancelled',
      message: `Your booking for "${booking.experienceTitle}" has been cancelled.`,
      relatedId: booking._id,
    });

    return success(
      res,
      {
        booking,
      },
      'Booking cancelled successfully'
    );
  } catch (err) {
    next(err);
  }
};

exports.getAllBookings = async (
  req,
  res,
  next
) => {
  try {
    if (
      String(
        req.user?.role || ''
      ).toUpperCase() !==
      'ADMIN'
    ) {
      return next(
        new AppError(
          'Admin access required',
          403
        )
      );
    }

    const {
      page,
      limit,
      skip,
    } = paginate(req.query);

    const status =
      normalizeString(
        req.query.status
      ).toUpperCase();

    const paymentStatus =
      normalizeString(
        req.query.paymentStatus
      ).toUpperCase();

    const search =
      normalizeString(
        req.query.search
      );

    const query = {};

    if (status) {
      if (
        !BOOKING_STATUSES.includes(
          status
        )
      ) {
        return next(
          new AppError(
            `Invalid booking status. Allowed values: ${BOOKING_STATUSES.join(', ')}`,
            400
          )
        );
      }

      query.status = status;
    }

    if (paymentStatus) {
      if (
        !PAYMENT_STATUSES.includes(
          paymentStatus
        )
      ) {
        return next(
          new AppError(
            `Invalid payment status. Allowed values: ${PAYMENT_STATUSES.join(', ')}`,
            400
          )
        );
      }

      query.paymentStatus =
        paymentStatus;
    }

    if (search) {
      const safeSearch =
        escapeRegex(search);

      const searchRegex =
        new RegExp(
          safeSearch,
          'i'
        );

      query.$or = [
        {
          experienceTitle:
            searchRegex,
        },
        {
          experienceLocation:
            searchRegex,
        },
        {
          contactPhone:
            searchRegex,
        },
      ];
    }

    const [
      total,
      bookings,
    ] = await Promise.all([
      Booking.countDocuments(
        query
      ),

      populateBooking(
        Booking.find(query)
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limit)
          .lean()
      ),
    ]);

    return success(
      res,
      {
        bookings,
        pagination:
          paginationMeta(
            total,
            page,
            limit
          ),
      },
      'All bookings fetched successfully'
    );
  } catch (err) {
    next(err);
  }
};

exports.updateBookingStatus =
  async (
    req,
    res,
    next
  ) => {
    try {
      if (
        String(
          req.user?.role || ''
        ).toUpperCase() !==
        'ADMIN'
      ) {
        return next(
          new AppError(
            'Admin access required',
            403
          )
        );
      }

      const { id } =
        req.params;

      if (!isValidObjectId(id)) {
        return next(
          new AppError(
            'Invalid booking ID',
            400
          )
        );
      }

      const requestedStatus =
        normalizeString(
          req.body?.status
        ).toUpperCase();

      if (
        !BOOKING_STATUSES.includes(
          requestedStatus
        )
      ) {
        return next(
          new AppError(
            `Invalid booking status. Allowed values: ${BOOKING_STATUSES.join(', ')}`,
            400
          )
        );
      }

      const booking =
        await Booking.findById(
          id
        );

      if (!booking) {
        return next(
          new AppError(
            'Booking not found',
            404
          )
        );
      }

      if (
        booking.status ===
        requestedStatus
      ) {
        return next(
          new AppError(
            `Booking is already ${requestedStatus.toLowerCase()}`,
            400
          )
        );
      }

      if (
        booking.status ===
          'COMPLETED' &&
        requestedStatus !==
          'COMPLETED'
      ) {
        return next(
          new AppError(
            'Completed bookings cannot be changed',
            400
          )
        );
      }

      if (
        booking.status ===
          'CANCELLED' &&
        requestedStatus !==
          'CANCELLED'
      ) {
        return next(
          new AppError(
            'Cancelled bookings cannot be reactivated',
            400
          )
        );
      }

      booking.status =
        requestedStatus;

      if (
        requestedStatus ===
        'CANCELLED'
      ) {
        if (
          booking.paymentStatus ===
          'PAID'
        ) {
          booking.paymentStatus =
            'REFUNDED';
        }

        booking.cancelledAt =
          booking.cancelledAt ||
          new Date();

        if (
          req.body?.reason !==
          undefined
        ) {
          const reason =
            normalizeString(
              req.body.reason
            );

          if (
            reason.length > 500
          ) {
            return next(
              new AppError(
                'Cancellation reason cannot exceed 500 characters',
                400
              )
            );
          }

          booking.cancellationReason =
            reason;
        }
      }

      if (
        requestedStatus ===
          'CONFIRMED' ||
        requestedStatus ===
          'COMPLETED'
      ) {
        if (
          booking.paymentStatus ===
          'REFUNDED'
        ) {
          booking.paymentStatus =
            'PAID';
        }

        booking.cancelledAt =
          undefined;

        booking.cancellationReason =
          '';
      }

      if (
        requestedStatus ===
        'PENDING'
      ) {
        if (
          booking.paymentStatus ===
          'REFUNDED'
        ) {
          booking.paymentStatus =
            'PENDING';
        }

        booking.cancelledAt =
          undefined;

        booking.cancellationReason =
          '';
      }

      await booking.save();

      await createNotification({
        user: booking.user,
        title:
          'Booking Status Updated',
        message: `Your booking for "${booking.experienceTitle}" is now ${requestedStatus.toLowerCase()}.`,
        relatedId:
          booking._id,
      });

      const updatedBooking =
        await populateBooking(
          Booking.findById(
            booking._id
          )
        );

      return success(
        res,
        {
          booking:
            updatedBooking,
        },
        'Booking status updated successfully'
      );
    } catch (err) {
      next(err);
    }
  };

exports.deleteBooking = async (
  req,
  res,
  next
) => {
  try {
    if (!req.user?._id) {
      return next(
        new AppError(
          'Authentication required',
          401
        )
      );
    }

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return next(
        new AppError(
          'Invalid booking ID',
          400
        )
      );
    }

    const booking =
      await Booking.findById(id);

    if (!booking) {
      return next(
        new AppError(
          'Booking not found',
          404
        )
      );
    }

    const isAdmin =
      String(
        req.user.role || ''
      ).toUpperCase() ===
      'ADMIN';

    const isOwner =
      booking.user.toString() ===
      req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return next(
        new AppError(
          'Not authorized to delete this booking',
          403
        )
      );
    }

    if (
      !isAdmin &&
      booking.status !==
        'CANCELLED'
    ) {
      return next(
        new AppError(
          'Only cancelled bookings can be deleted',
          400
        )
      );
    }

    await Booking.findByIdAndDelete(
      id
    );

    return success(
      res,
      {
        deletedBookingId: id,
      },
      'Booking deleted successfully'
    );
  } catch (err) {
    next(err);
  }
};

module.exports = exports;