const express = require('express');
const viewsController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

// ... other routes ...

router.get(
  '/manage-users',
  authController.protect,
  authController.restrictTo('admin'),
  viewsController.getManageUsersPage
);

module.exports = router;
