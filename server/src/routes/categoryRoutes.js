const express = require('express');

const router = express.Router();

const {
  create,
  update,
} = require('../validators/categoryValidators');

const {
  validate,
} = require('../middleware/validate');

const {
  protect,
  restrictTo,
} = require('../middleware/auth');

const categoryController = require('../controllers/categoryController');

router.get(
  '/',
  categoryController.getCategories
);

router.get(
  '/:slug',
  categoryController.getCategory
);

router.post(
  '/',
  protect,
  restrictTo('ADMIN'),
  create,
  validate,
  categoryController.createCategory
);

router.put(
  '/:id',
  protect,
  restrictTo('ADMIN'),
  update,
  validate,
  categoryController.updateCategory
);

router.delete(
  '/:id',
  protect,
  restrictTo('ADMIN'),
  categoryController.deleteCategory
);

module.exports = router;