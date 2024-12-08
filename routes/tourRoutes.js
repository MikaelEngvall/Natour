const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');
const router = express.Router();
/* router.param('id', tourController.checkID); */

router.use('/:tourId/reviews', reviewRouter);

router
    .route('/')
    .get(tourController.getAllTours)
    .post(
        authController.protect, 
        authController.restrictTo('admin', 'lead-guide'), 
        tourController.createTour);

router
    .route('/:id')
    .patch(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.updateTour)
    .get(tourController.getTour)
    .delete(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.deleteTour);


module.exports = router;