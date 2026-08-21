const express = require("express");

const router = express.Router();

const {
  createContact,
  getContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
  getContactStats,
} = require("../controllers/contactController");

const {
  protect,
  restrictTo,
} = require("../middleware/auth");

router.post("/", createContact);

router.get(
  "/stats",
  protect,
  restrictTo("ADMIN"),
  getContactStats
);

router.get(
  "/",
  protect,
  restrictTo("ADMIN"),
  getContacts
);

router.get(
  "/:id",
  protect,
  restrictTo("ADMIN"),
  getContactById
);

router.patch(
  "/:id/status",
  protect,
  restrictTo("ADMIN"),
  updateContactStatus
);

router.delete(
  "/:id",
  protect,
  restrictTo("ADMIN"),
  deleteContact
);

module.exports = router;