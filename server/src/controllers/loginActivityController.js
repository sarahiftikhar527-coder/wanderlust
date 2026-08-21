const mongoose = require('mongoose');

const LoginActivity = require('../models/LoginActivity');
const { success } = require('../utils/response');
const AppError = require('../utils/AppError');

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const parsePagination = (req) => {
  const pageValue = Number.parseInt(
    req.query.page,
    10
  );

  const limitValue = Number.parseInt(
    req.query.limit,
    10
  );

  const page =
    Number.isFinite(pageValue) && pageValue > 0
      ? pageValue
      : 1;

  const limit =
    Number.isFinite(limitValue) &&
    limitValue > 0
      ? Math.min(limitValue, MAX_LIMIT)
      : DEFAULT_LIMIT;

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

const buildDateFilter = (query = {}) => {
  const filter = {};

  if (!query.from && !query.to) {
    return filter;
  }

  filter.loginAt = {};

  if (query.from) {
    const from = new Date(query.from);

    if (Number.isNaN(from.getTime())) {
      throw new AppError(
        'Invalid from date',
        400
      );
    }

    from.setHours(0, 0, 0, 0);

    filter.loginAt.$gte = from;
  }

  if (query.to) {
    const to = new Date(query.to);

    if (Number.isNaN(to.getTime())) {
      throw new AppError(
        'Invalid to date',
        400
      );
    }

    to.setHours(23, 59, 59, 999);

    filter.loginAt.$lte = to;
  }

  if (
    filter.loginAt.$gte &&
    filter.loginAt.$lte &&
    filter.loginAt.$gte >
      filter.loginAt.$lte
  ) {
    throw new AppError(
      'From date cannot be greater than to date',
      400
    );
  }

  return filter;
};

const escapeRegex = (value) => {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&'
  );
};

const buildSearchFilter = (search) => {
  if (
    typeof search !== 'string' ||
    !search.trim()
  ) {
    return {};
  }

  const searchTerm = escapeRegex(
    search.trim()
  );

  return {
    $or: [
      {
        email: {
          $regex: searchTerm,
          $options: 'i',
        },
      },
    ],
  };
};

const getSortOption = (sort) => {
  const normalizedSort =
    typeof sort === 'string'
      ? sort.toLowerCase()
      : 'latest';

  if (normalizedSort === 'oldest') {
    return {
      loginAt: 1,
    };
  }

  return {
    loginAt: -1,
  };
};

const buildPaginationResponse = (
  page,
  limit,
  total
) => {
  const totalPages =
    total > 0
      ? Math.ceil(total / limit)
      : 0;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage:
      page < totalPages,
    hasPreviousPage:
      page > 1 &&
      totalPages > 0,
  };
};

const validateUserId = (
  userId,
  next
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      userId
    )
  ) {
    next(
      new AppError(
        'Invalid user ID',
        400
      )
    );

    return false;
  }

  return true;
};

exports.getLoginActivities = async (
  req,
  res,
  next
) => {
  try {
    const {
      page,
      limit,
      skip,
    } = parsePagination(req);

    const {
      search,
      from,
      to,
      sort = 'latest',
    } = req.query;

    const searchFilter =
      buildSearchFilter(search);

    const dateFilter =
      buildDateFilter({
        from,
        to,
      });

    const filter = {
      ...searchFilter,
      ...dateFilter,
    };

    const sortOption =
      getSortOption(sort);

    const [
      activities,
      total,
    ] = await Promise.all([
      LoginActivity.find(filter)
        .populate(
          'user',
          'name email role isActive avatar phone'
        )
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),

      LoginActivity.countDocuments(
        filter
      ),
    ]);

    return success(
      res,
      {
        activities,
        pagination:
          buildPaginationResponse(
            page,
            limit,
            total
          ),
      },
      'Login activities fetched successfully'
    );
  } catch (err) {
    next(err);
  }
};

exports.getUserLoginActivities = async (
  req,
  res,
  next
) => {
  try {
    const { userId } =
      req.params;

    if (
      !validateUserId(
        userId,
        next
      )
    ) {
      return;
    }

    const {
      page,
      limit,
      skip,
    } = parsePagination(req);

    const {
      from,
      to,
      sort = 'latest',
    } = req.query;

    const dateFilter =
      buildDateFilter({
        from,
        to,
      });

    const filter = {
      user: userId,
      ...dateFilter,
    };

    const sortOption =
      getSortOption(sort);

    const [
      activities,
      total,
    ] = await Promise.all([
      LoginActivity.find(filter)
        .populate(
          'user',
          'name email role isActive avatar phone'
        )
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),

      LoginActivity.countDocuments(
        filter
      ),
    ]);

    return success(
      res,
      {
        activities,
        pagination:
          buildPaginationResponse(
            page,
            limit,
            total
          ),
      },
      'User login activities fetched successfully'
    );
  } catch (err) {
    next(err);
  }
};

exports.getLoginActivityStats = async (
  req,
  res,
  next
) => {
  try {
    const {
      from,
      to,
    } = req.query;

    const dateFilter =
      buildDateFilter({
        from,
        to,
      });

    const [
      totalLogins,
      uniqueUsers,
      latestLogin,
      firstLogin,
    ] = await Promise.all([
      LoginActivity.countDocuments(
        dateFilter
      ),

      LoginActivity.distinct(
        'user',
        dateFilter
      ),

      LoginActivity.findOne(
        dateFilter
      )
        .populate(
          'user',
          'name email role isActive avatar phone'
        )
        .sort({
          loginAt: -1,
        })
        .lean(),

      LoginActivity.findOne(
        dateFilter
      )
        .populate(
          'user',
          'name email role isActive avatar phone'
        )
        .sort({
          loginAt: 1,
        })
        .lean(),
    ]);

    return success(
      res,
      {
        stats: {
          totalLogins,
          uniqueUsers:
            uniqueUsers.length,
          averageLoginsPerUser:
            uniqueUsers.length > 0
              ? Number(
                  (
                    totalLogins /
                    uniqueUsers.length
                  ).toFixed(2)
                )
              : 0,
        },
        latestLogin,
        firstLogin,
      },
      'Login activity statistics fetched successfully'
    );
  } catch (err) {
    next(err);
  }
};

exports.getUserLoginSummary = async (
  req,
  res,
  next
) => {
  try {
    const { userId } =
      req.params;

    if (
      !validateUserId(
        userId,
        next
      )
    ) {
      return;
    }

    const {
      from,
      to,
    } = req.query;

    const dateFilter =
      buildDateFilter({
        from,
        to,
      });

    const filter = {
      user: userId,
      ...dateFilter,
    };

    const [
      totalLogins,
      latestLogin,
      firstLogin,
    ] = await Promise.all([
      LoginActivity.countDocuments(
        filter
      ),

      LoginActivity.findOne(filter)
        .sort({
          loginAt: -1,
        })
        .lean(),

      LoginActivity.findOne(filter)
        .sort({
          loginAt: 1,
        })
        .lean(),
    ]);

    return success(
      res,
      {
        summary: {
          totalLogins,
          firstLogin,
          latestLogin,
        },
      },
      'User login summary fetched successfully'
    );
  } catch (err) {
    next(err);
  }
};

module.exports = exports;