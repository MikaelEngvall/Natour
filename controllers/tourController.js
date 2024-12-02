
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getAllTours = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
    const tours = await features.query;

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: { tours }
    });
})

exports.createTour = catchAsync(async (req, res, next) => {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            tour: newTour 
        }
    });   
});

exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id);

    if(!tour) return next(new AppError(`Tour with id ${req.params.id} not found`, 404));
    
    // Tour.findOne({ name: req.params.name })
    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        data: { 
            tour 
        }
    });
});

exports.updateTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if(!tour) return next(new AppError(`Tour with id ${req.params.id} not found`, 404));
    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        message: 'Tour updated successfully',
        data: { 
            tour
        }
    });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if(!tour) return next(new AppError(`Tour with id ${req.params.id} not found`, 404));

    res.status(204).json({
        status:'success',
        requestedAt: req.requestTime,
        message: 'Tour deleted successfully'
    });
});