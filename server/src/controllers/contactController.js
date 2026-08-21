const mongoose = require("mongoose");

const Contact = require("../models/Contact");

const {
  success,
  paginate,
  paginationMeta,
} = require("../utils/response");

const AppError = require("../utils/AppError");

const CONTACT_STATUSES = ["NEW", "READ", "REPLIED"];

const normalizeString = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

const normalizeEmail = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().toLowerCase();
};

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.createContact = async (req, res, next) => {
  try {
    const {
      name,
      email,
      subject,
      message,
    } = req.body || {};

    const normalizedName = normalizeString(name);
    const normalizedEmail = normalizeEmail(email);
    const normalizedSubject = normalizeString(subject);
    const normalizedMessage = normalizeString(message);

    if (!normalizedName) {
      return next(
        new AppError("Name is required", 400)
      );
    }

    if (normalizedName.length < 2) {
      return next(
        new AppError(
          "Name must be at least 2 characters",
          400
        )
      );
    }

    if (normalizedName.length > 100) {
      return next(
        new AppError(
          "Name cannot exceed 100 characters",
          400
        )
      );
    }

    if (!normalizedEmail) {
      return next(
        new AppError("Email is required", 400)
      );
    }

    if (!emailRegex.test(normalizedEmail)) {
      return next(
        new AppError(
          "Please enter a valid email address",
          400
        )
      );
    }

    if (normalizedEmail.length > 150) {
      return next(
        new AppError(
          "Email cannot exceed 150 characters",
          400
        )
      );
    }

    if (normalizedSubject.length > 200) {
      return next(
        new AppError(
          "Subject cannot exceed 200 characters",
          400
        )
      );
    }

    if (!normalizedMessage) {
      return next(
        new AppError("Message is required", 400)
      );
    }

    if (normalizedMessage.length < 10) {
      return next(
        new AppError(
          "Message must be at least 10 characters",
          400
        )
      );
    }

    if (normalizedMessage.length > 5000) {
      return next(
        new AppError(
          "Message cannot exceed 5000 characters",
          400
        )
      );
    }

    const contact = await Contact.create({
      name: normalizedName,
      email: normalizedEmail,
      subject: normalizedSubject,
      message: normalizedMessage,
      status: "NEW",
    });

    return success(
      res,
      {
        contact,
      },
      "Message sent successfully",
      201
    );
  } catch (err) {
    if (err.code === 11000) {
      return next(
        new AppError(
          "A contact message with these details already exists",
          409
        )
      );
    }

    next(err);
  }
};

exports.getContacts = async (req, res, next) => {
  try {
    const {
      page,
      limit,
      skip,
    } = paginate(req.query || {});

    const search = normalizeString(
      req.query?.search
    );

    const status = normalizeString(
      req.query?.status
    ).toUpperCase();

    const query = {};

    if (status) {
      if (!CONTACT_STATUSES.includes(status)) {
        return next(
          new AppError(
            `Invalid contact status. Allowed values: ${CONTACT_STATUSES.join(
              ", "
            )}`,
            400
          )
        );
      }

      query.status = status;
    }

    if (search) {
      const safeSearch = escapeRegex(search);
      const searchRegex = new RegExp(
        safeSearch,
        "i"
      );

      query.$or = [
        {
          name: searchRegex,
        },
        {
          email: searchRegex,
        },
        {
          subject: searchRegex,
        },
        {
          message: searchRegex,
        },
      ];
    }

    const [total, contacts] = await Promise.all([
      Contact.countDocuments(query),

      Contact.find(query)
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    return success(
      res,
      {
        contacts,
        pagination: paginationMeta(
          total,
          page,
          limit
        ),
      },
      "Contacts fetched successfully"
    );
  } catch (err) {
    next(err);
  }
};

exports.getContactById = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return next(
        new AppError(
          "Invalid contact ID",
          400
        )
      );
    }

    const contact = await Contact.findById(
      id
    ).lean();

    if (!contact) {
      return next(
        new AppError(
          "Contact message not found",
          404
        )
      );
    }

    return success(
      res,
      {
        contact,
      },
      "Contact fetched successfully"
    );
  } catch (err) {
    next(err);
  }
};

exports.updateContactStatus = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return next(
        new AppError(
          "Invalid contact ID",
          400
        )
      );
    }

    const status = normalizeString(
      req.body?.status
    ).toUpperCase();

    if (!CONTACT_STATUSES.includes(status)) {
      return next(
        new AppError(
          `Invalid contact status. Allowed values: ${CONTACT_STATUSES.join(
            ", "
          )}`,
          400
        )
      );
    }

    const contact =
      await Contact.findByIdAndUpdate(
        id,
        {
          status,
        },
        {
          new: true,
          runValidators: true,
        }
      ).lean();

    if (!contact) {
      return next(
        new AppError(
          "Contact message not found",
          404
        )
      );
    }

    return success(
      res,
      {
        contact,
      },
      "Contact status updated successfully"
    );
  } catch (err) {
    if (err.name === "CastError") {
      return next(
        new AppError(
          "Invalid contact ID",
          400
        )
      );
    }

    next(err);
  }
};

exports.deleteContact = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return next(
        new AppError(
          "Invalid contact ID",
          400
        )
      );
    }

    const contact =
      await Contact.findById(id);

    if (!contact) {
      return next(
        new AppError(
          "Contact message not found",
          404
        )
      );
    }

    await Contact.findByIdAndDelete(id);

    return success(
      res,
      {
        deletedContactId: id,
      },
      "Contact message deleted successfully"
    );
  } catch (err) {
    next(err);
  }
};

exports.getContactStats = async (
  req,
  res,
  next
) => {
  try {
    const [
      total,
      newMessages,
      readMessages,
      repliedMessages,
    ] = await Promise.all([
      Contact.countDocuments(),

      Contact.countDocuments({
        status: "NEW",
      }),

      Contact.countDocuments({
        status: "READ",
      }),

      Contact.countDocuments({
        status: "REPLIED",
      }),
    ]);

    return success(
      res,
      {
        total,
        new: newMessages,
        read: readMessages,
        replied: repliedMessages,
      },
      "Contact statistics fetched successfully"
    );
  } catch (err) {
    next(err);
  }
};

module.exports = exports;