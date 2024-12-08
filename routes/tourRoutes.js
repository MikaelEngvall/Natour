const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');

const router = express.Router();
/* router.param('id', tourController.checkID); */

router
    .route('/')
    .get(authController.protect, tourController.getAllTours)
    .post(tourController.createTour);

router
    .route('/:id')
    .patch(tourController.updateTour)
    .get(tourController.getTour)
    .delete(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.deleteTour);

// POST /tour/934ur8934/reviews
// GET /tour/934ur8934/reviews
// GET /tour/934ur8934/reviews/3099032hf
router
    .route('/:tourId/reviews')
    .post(
        authController.protect, 
        authController.restrictTo('user'), 
        reviewController.createReview
    );

module.exports = router;