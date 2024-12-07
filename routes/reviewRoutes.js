// create the routes for reviews
const express = require('express');
const router = express.Router();
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');

router.route('/')
.get(reviewController.getAllReviews)
.post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
);

  
module.exports = router;
