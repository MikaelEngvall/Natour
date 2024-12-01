
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');

exports.getAllTours = catchAsync(async (req, res) => {
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

exports.getTour = catchAsync(async (req, res) => {
    const tour = await Tour.findById(req.params.id);
    // Tour.findOne({ name: req.params.name })
    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        data: { 
            tour 
        }
    });
});

exports.updateTour = catchAsync(async (req, res) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
        res.status(200).json({
            status: 'success',
            requestedAt: req.requestTime,
            message: 'Tour updated successfully',
            data: { 
                tour
            }
        });
});

exports.deleteTour = catchAsync(async (req, res) => {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
        status:'success',
        requestedAt: req.requestTime,
        message: 'Tour deleted successfully'
    });
});