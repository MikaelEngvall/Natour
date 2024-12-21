const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get(
  '/',
  // bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewController.getOverview
);

router.get('/tours/:slug', authController.isLoggedIn, viewController.getTour);

// /login
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);

router.get('/me', authController.protect, viewController.getAccount);
router.get('/my-tours', authController.protect, viewController.getMyTours);

router.post(
  '/submit-user-data',
  authController.protect,
  viewController.updateUserData
);

router.get(
  '/manage-users',
  authController.protect,
  authController.restrictTo('admin'),
  viewController.getManageUsersPage
);

router.get(
  '/manage-reviews',
  authController.protect,
  authController.restrictTo('admin'),
  viewController.getManageReviewsPage
);

router.get(
  '/manage-tours',
  authController.protect,
  authController.restrictTo('admin', 'lead-guide'),
  viewController.getManageToursPage
);

router.get(
  '/edit-tour/:id',
  authController.protect,
  authController.restrictTo('admin', 'lead-guide'),
  viewController.getEditTourPage
);
module.exports = router;
