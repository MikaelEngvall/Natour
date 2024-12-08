const Review = require('./../models/reviewModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

exports.getAllReviews = catchAsync(async (req, res, next) => {
    let filter = {};
    if(req.params.tourId) filter = {tour: req.params.tourId };
    const reviews = await Review.find(filter);
    res.status(200).json({
        status:'success',
        results: reviews.length,
        data: { reviews }
    });
});

exports.getReview = catchAsync(async (req, res, next) => {
    const review = await Review.findById(req.params.id);
    if(!review) return next(new AppError(`Review with id ${req.params.id} not found`, 404));
    res.status(200).json({
        status:'success',
        data: { review }
    });
});

exports.createReview = catchAsync(async (req, res, next) => {
    // Allows nested routes
    if(!req.body.tour) req.body.tour = req.params.tourId;
    if(!req.body.user) req.body.user = req.user.id;
    const newReview= await Review.create(req.body);
    console.log(req.body.tour);
    console.log(req.body.user);
    res.status(201).json({
        status:'success',
        data: { review: newReview }
    });
});

exports.updateReview = catchAsync(async (req, res, next) => {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if(!review) return next(new AppError(`Review with id ${req.params.id} not found`, 404));
    res.status(200).json({
        status:'success',
        data: { review }
    });
});

exports.deleteReview = factory.deleteOne(Review);
