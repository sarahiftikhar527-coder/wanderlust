const mongoose = require('mongoose');

const Category = require('../models/Category');
const Experience = require('../models/Experience');

const {
  success,
  slugify,
} = require('../utils/response');

const AppError = require('../utils/AppError');

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

const getExperienceCount = async (
  categoryId,
  publishedOnly = true
) => {
  const query = {
    category: categoryId,
  };

  if (publishedOnly) {
    query.status = 'PUBLISHED';
  }

  return Experience.countDocuments(query);
};

const buildCategoryResponse = async (
  category
) => {
  const experienceCount =
    await getExperienceCount(
      category._id
    );

  const categoryObject =
    typeof category.toObject ===
    'function'
      ? category.toObject()
      : category;

  return {
    ...categoryObject,
    experienceCount,
  };
};

const ensureAdmin = (req, next) => {
  if (
    !req.user ||
    req.user.role !== 'ADMIN'
  ) {
    next(
      new AppError(
        'Admin access required',
        403
      )
    );

    return false;
  }

  return true;
};

exports.getCategories = async (
  req,
  res,
  next
) => {
  try {
    const includeInactive =
      req.user?.role === 'ADMIN' &&
      String(
        req.query?.includeInactive
      ).toLowerCase() === 'true';

    const query = includeInactive
      ? {}
      : {
          isActive: true,
        };

    const categories =
      await Category.find(query)
        .sort({
          name: 1,
        })
        .lean();

    const categoryIds =
      categories.map(
        (category) =>
          category._id
      );

    if (
      categoryIds.length === 0
    ) {
      return success(
        res,
        {
          categories: [],
          count: 0,
        },
        'Categories fetched successfully'
      );
    }

    const counts =
      await Experience.aggregate([
        {
          $match: {
            category: {
              $in: categoryIds,
            },
            status: 'PUBLISHED',
          },
        },
        {
          $group: {
            _id: '$category',
            count: {
              $sum: 1,
            },
          },
        },
      ]);

    const countMap =
      new Map(
        counts.map(
          (item) => [
            item._id.toString(),
            item.count,
          ]
        )
      );

    const enrichedCategories =
      categories.map(
        (category) => ({
          ...category,
          experienceCount:
            countMap.get(
              category._id.toString()
            ) || 0,
        })
      );

    return success(
      res,
      {
        categories:
          enrichedCategories,
        count:
          enrichedCategories.length,
      },
      'Categories fetched successfully'
    );
  } catch (err) {
    next(err);
  }
};

exports.getCategory = async (
  req,
  res,
  next
) => {
  try {
    const slug =
      normalizeString(
        req.params.slug
      ).toLowerCase();

    if (!slug) {
      return next(
        new AppError(
          'Category slug is required',
          400
        )
      );
    }

    const category =
      await Category.findOne({
        slug,
        isActive: true,
      });

    if (!category) {
      return next(
        new AppError(
          'Category not found',
          404
        )
      );
    }

    const categoryResponse =
      await buildCategoryResponse(
        category
      );

    return success(
      res,
      {
        category:
          categoryResponse,
      },
      'Category fetched successfully'
    );
  } catch (err) {
    next(err);
  }
};

exports.getCategoryById =
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
            'Invalid category ID',
            400
          )
        );
      }

      const category =
        await Category.findById(
          id
        );

      if (!category) {
        return next(
          new AppError(
            'Category not found',
            404
          )
        );
      }

      if (
        !category.isActive &&
        req.user?.role !==
          'ADMIN'
      ) {
        return next(
          new AppError(
            'Category not found',
            404
          )
        );
      }

      const categoryResponse =
        await buildCategoryResponse(
          category
        );

      return success(
        res,
        {
          category:
            categoryResponse,
        },
        'Category fetched successfully'
      );
    } catch (err) {
      next(err);
    }
  };

exports.createCategory =
  async (
    req,
    res,
    next
  ) => {
    try {
      if (
        !ensureAdmin(req, next)
      ) {
        return;
      }

      const name =
        normalizeString(
          req.body?.name
        );

      if (!name) {
        return next(
          new AppError(
            'Category name is required',
            400
          )
        );
      }

      if (name.length < 2) {
        return next(
          new AppError(
            'Category name must be at least 2 characters',
            400
          )
        );
      }

      if (name.length > 100) {
        return next(
          new AppError(
            'Category name cannot exceed 100 characters',
            400
          )
        );
      }

      const generatedSlug =
        slugify(name);

      if (!generatedSlug) {
        return next(
          new AppError(
            'Unable to generate a valid category slug',
            400
          )
        );
      }

      const escapedName =
        escapeRegex(name);

      const existingName =
        await Category.findOne({
          name: {
            $regex: `^${escapedName}$`,
            $options: 'i',
          },
        });

      if (existingName) {
        return next(
          new AppError(
            'Category with this name already exists',
            409
          )
        );
      }

      const existingSlug =
        await Category.findOne({
          slug: generatedSlug,
        });

      if (existingSlug) {
        return next(
          new AppError(
            'Category with this slug already exists',
            409
          )
        );
      }

      const data = {
        ...req.body,
        name,
        slug: generatedSlug,
      };

      if (
        data.description !==
        undefined
      ) {
        if (
          typeof data.description !==
          'string'
        ) {
          return next(
            new AppError(
              'Description must be a string',
              400
            )
          );
        }

        data.description =
          data.description.trim();

        if (
          data.description.length >
          500
        ) {
          return next(
            new AppError(
              'Description cannot exceed 500 characters',
              400
            )
          );
        }
      }

      if (
        data.image !== undefined
      ) {
        data.image =
          normalizeString(
            data.image
          );
      }

      if (
        data.icon !== undefined
      ) {
        data.icon =
          normalizeString(
            data.icon
          );
      }

      if (
        data.isActive ===
        undefined
      ) {
        data.isActive = true;
      } else if (
        typeof data.isActive !==
          'boolean' &&
        data.isActive !== 'true' &&
        data.isActive !== 'false'
      ) {
        return next(
          new AppError(
            'isActive must be a boolean',
            400
          )
        );
      } else {
        data.isActive =
          data.isActive ===
            true ||
          data.isActive ===
            'true';
      }

      const category =
        await Category.create(
          data
        );

      const categoryResponse = {
        ...category.toObject(),
        experienceCount: 0,
      };

      return success(
        res,
        {
          category:
            categoryResponse,
        },
        'Category created successfully',
        201
      );
    } catch (err) {
      if (
        err.code === 11000
      ) {
        return next(
          new AppError(
            'Category with this name or slug already exists',
            409
          )
        );
      }

      next(err);
    }
  };

exports.updateCategory =
  async (
    req,
    res,
    next
  ) => {
    try {
      if (
        !ensureAdmin(req, next)
      ) {
        return;
      }

      const { id } =
        req.params;

      if (
        !isValidObjectId(id)
      ) {
        return next(
          new AppError(
            'Invalid category ID',
            400
          )
        );
      }

      const existingCategory =
        await Category.findById(
          id
        );

      if (!existingCategory) {
        return next(
          new AppError(
            'Category not found',
            404
          )
        );
      }

      const updates = {};

      if (
        req.body?.name !==
        undefined
      ) {
        const name =
          normalizeString(
            req.body.name
          );

        if (!name) {
          return next(
            new AppError(
              'Category name cannot be empty',
              400
            )
          );
        }

        if (name.length < 2) {
          return next(
            new AppError(
              'Category name must be at least 2 characters',
              400
            )
          );
        }

        if (name.length > 100) {
          return next(
            new AppError(
              'Category name cannot exceed 100 characters',
              400
            )
          );
        }

        const escapedName =
          escapeRegex(name);

        const duplicateName =
          await Category.findOne({
            name: {
              $regex: `^${escapedName}$`,
              $options: 'i',
            },
            _id: {
              $ne: id,
            },
          });

        if (duplicateName) {
          return next(
            new AppError(
              'Category with this name already exists',
              409
            )
          );
        }

        const generatedSlug =
          slugify(name);

        if (!generatedSlug) {
          return next(
            new AppError(
              'Unable to generate a valid category slug',
              400
            )
          );
        }

        const duplicateSlug =
          await Category.findOne({
            slug: generatedSlug,
            _id: {
              $ne: id,
            },
          });

        if (duplicateSlug) {
          return next(
            new AppError(
              'Category with this slug already exists',
              409
            )
          );
        }

        updates.name =
          name;

        updates.slug =
          generatedSlug;
      }

      if (
        req.body?.description !==
        undefined
      ) {
        if (
          typeof req.body
            .description !==
          'string'
        ) {
          return next(
            new AppError(
              'Description must be a string',
              400
            )
          );
        }

        const description =
          req.body.description.trim();

        if (
          description.length >
          500
        ) {
          return next(
            new AppError(
              'Description cannot exceed 500 characters',
              400
            )
          );
        }

        updates.description =
          description;
      }

      if (
        req.body?.image !==
        undefined
      ) {
        if (
          typeof req.body.image !==
          'string'
        ) {
          return next(
            new AppError(
              'Image must be a string',
              400
            )
          );
        }

        updates.image =
          normalizeString(
            req.body.image
          );
      }

      if (
        req.body?.icon !==
        undefined
      ) {
        if (
          typeof req.body.icon !==
          'string'
        ) {
          return next(
            new AppError(
              'Icon must be a string',
              400
            )
          );
        }

        updates.icon =
          normalizeString(
            req.body.icon
          );
      }

      if (
        req.body?.isActive !==
        undefined
      ) {
        if (
          typeof req.body
            .isActive !==
            'boolean' &&
          req.body.isActive !==
            'true' &&
          req.body.isActive !==
            'false'
        ) {
          return next(
            new AppError(
              'isActive must be a boolean',
              400
            )
          );
        }

        updates.isActive =
          req.body.isActive ===
            true ||
          req.body.isActive ===
            'true';
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

      const category =
        await Category.findByIdAndUpdate(
          id,
          updates,
          {
            new: true,
            runValidators: true,
          }
        );

      if (!category) {
        return next(
          new AppError(
            'Category not found',
            404
          )
        );
      }

      const categoryResponse =
        await buildCategoryResponse(
          category
        );

      return success(
        res,
        {
          category:
            categoryResponse,
        },
        'Category updated successfully'
      );
    } catch (err) {
      if (
        err.name ===
        'CastError'
      ) {
        return next(
          new AppError(
            'Invalid category ID',
            400
          )
        );
      }

      if (
        err.code === 11000
      ) {
        return next(
          new AppError(
            'Category with this name or slug already exists',
            409
          )
        );
      }

      next(err);
    }
  };

exports.deleteCategory =
  async (
    req,
    res,
    next
  ) => {
    try {
      if (
        !ensureAdmin(req, next)
      ) {
        return;
      }

      const { id } =
        req.params;

      if (
        !isValidObjectId(id)
      ) {
        return next(
          new AppError(
            'Invalid category ID',
            400
          )
        );
      }

      const category =
        await Category.findById(
          id
        );

      if (!category) {
        return next(
          new AppError(
            'Category not found',
            404
          )
        );
      }

      const experienceCount =
        await Experience.countDocuments({
          category: id,
        });

      if (experienceCount > 0) {
        return next(
          new AppError(
            `Cannot delete this category because ${experienceCount} experience${experienceCount === 1 ? '' : 's'} use it`,
            409
          )
        );
      }

      await Category.findByIdAndDelete(
        id
      );

      return success(
        res,
        {
          deletedCategoryId:
            id,
        },
        'Category deleted successfully'
      );
    } catch (err) {
      next(err);
    }
  };

exports.toggleCategoryStatus =
  async (
    req,
    res,
    next
  ) => {
    try {
      if (
        !ensureAdmin(req, next)
      ) {
        return;
      }

      const { id } =
        req.params;

      if (
        !isValidObjectId(id)
      ) {
        return next(
          new AppError(
            'Invalid category ID',
            400
          )
        );
      }

      const category =
        await Category.findById(
          id
        );

      if (!category) {
        return next(
          new AppError(
            'Category not found',
            404
          )
        );
      }

      category.isActive =
        !category.isActive;

      await category.save();

      const categoryResponse =
        await buildCategoryResponse(
          category
        );

      return success(
        res,
        {
          category:
            categoryResponse,
        },
        category.isActive
          ? 'Category activated successfully'
          : 'Category deactivated successfully'
      );
    } catch (err) {
      next(err);
    }
  };

module.exports = exports;