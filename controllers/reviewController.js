const Review = require('./../models/reviewModel');

const catchAsync = require('./../utils/catchAsync');
exports.getAllReviews = catchAsync(async (req, res, next) => {
    const reviews = await Review.find();
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

exports.getReviewsByTour = catchAsync(async (req, res, next) => {
    const reviews = await Review.find({ tour: req.params.id });
    if(!reviews) return next(new AppError(`No reviews found for tour with id ${req.params.id}`, 404));
    res.status(200).json({
        status:'success',
        results: reviews.length,
        data: { reviews }
    });
});

exports.getTopReviews = catchAsync(async (req, res, next) => {
    const reviews = await Review.find()
       .sort({ rating: -1 })
       .limit(parseInt(req.query.limit))
       .skip(parseInt(req.query.skip));
       if(!reviews) return next(new AppError('No reviews found', 404));
       res.status(200).json({
        status:'success',
        results: reviews.length,
        data: { reviews }
    });
});

exports.getReviewStats = catchAsync(async (req, res, next) => {
    const stats = await Review.aggregate([
        {
            $group: {
                _id: null,
                numReviews: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);
    res.status(200).json({
        status:'success',
        data: stats[0]
    });
});

exports.getReviewByUser = catchAsync(async (req, res, next) => {
    const reviews = await Review.find({ user: req.params.id });
    if(!reviews) return next(new AppError(`No reviews found for user with id ${req.params.id}`, 404));
    res.status(200).json({
        status:'success',
        results: reviews.length,
        data: { reviews }
    });
});

exports.createReviewComment = catchAsync(async (req, res, next) => {
    const review = await Review.findByIdAndUpdate(req.params.reviewId, {
        $push: { comments: req.body }
    }, { new: true });
    if(!review) return next(new AppError(`Review with id ${req.params.reviewId} not found`, 404));
    res.status(200).json({
        status:'success',
        data: { review }
    });
});

exports.deleteReviewComment = catchAsync(async (req, res, next) => {
    const review = await Review.findByIdAndUpdate(req.params.reviewId, {
        $pull: { comments: { _id: req.params.commentId } }
    }, { new: true });
    if(!review) return next(new AppError(`Review with id ${req.params.reviewId} not found`, 404));
    res.status(200).json({
        status:'success',
        data: { review }
    });
});

exports.updateReviewComment = catchAsync(async (req, res, next) => {
    const review = await Review.findByIdAndUpdate(req.params.reviewId, {
        $set: { 'comments.$': req.body }
    }, { new: true });
    if(!review) return next(new AppError(`Review with id ${req.params.reviewId} not found`, 404));
    res.status(200).json({
        status:'success',
        data: { review }
    });
});

exports.createReview = catchAsync(async (req, res, next) => {
    const newReview= await Review.create(req.body);
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

exports.deleteReview = catchAsync(async (req, res, next) => {
    const review = await Review.findByIdAndDelete(req.params.id);
    if(!review) return next(new AppError(`Review with id ${req.params.id} not found`, 404));
    res.status(204).json({
        status:'success',
        message: 'Review deleted successfully'
    });
});

