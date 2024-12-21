const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('../routers/reviewRoutes');

const router = express.Router();

// Nested routes
router.use('/:tourId/reviews', reviewRouter);

// Aliased routes
router.get(
  '/top-5-cheap',
  tourController.aliasTopTours,
  tourController.getAllTours
);

// Statistics routes
router.get('/tour-stats', tourController.getTourStats);
router.get(
  '/monthly-plan/:year',
  authController.protect,
  authController.restrictTo('admin', 'lead-guide', 'guide'),
  tourController.getMonthlyPlan
);

// Geospatial routes
router.get(
  '/tours-within/:distance/center/:latlng/unit/:unit',
  tourController.getToursWithin
);
router.get('/distances/:latlng/unit/:unit', tourController.getDistances);

// Standard CRUD routes
router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
