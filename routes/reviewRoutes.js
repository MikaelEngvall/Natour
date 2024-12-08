// create the routes for reviews
const express = require('express');

const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');

const router = express.Router({ mergeParams: true });

// POST /tour/039498fvjk/reviews
// GET /tour/039498fvjk/reviews
// POST /reviews

router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(
        authController.protect,
        authController.restrictTo('user'),
        reviewController.createReview
    );

router
    .route('/:id')
    .patch(reviewController.updateReview)
    .delete(reviewController.deleteReview);

  
module.exports = router;
