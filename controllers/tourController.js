
const Tour = require('./../models/tourModel');

exports.getAllTours = async (req, res) => {

    try{
        const queryObj = {...req.query };
        const excludeFields = ['page', 'sort', 'limit','fields'];
        excludeFields.forEach(field => delete queryObj[field]);

        const tours = await Tour.find(queryObj);
        res.status(200).json({
            status: 'success',
            results: tours.length,
            data: { tours }
        });
        
    } catch (err) {
        console.error('Error getting tours:', err);
        res.status(500).json({
            status: 'fail',
            message: 'Server Error'
        });
    }
}

exports.createTour = async (req, res) => {
    try {
        
        const newTour = await Tour.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour 
            }
        });   
    } catch (err) {
        console.error('Error creating tour:', err);
        res.status(400).json({
            status: 'fail',
            message: 'Invalid data',
            data: err
        });
    }
  
};

exports.getTour = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);
        // Tour.findOne({ name: req.params.name })
        res.status(200).json({
            status: 'success',
            requestedAt: req.requestTime,
            data: { 
                tour 
            }
        });
    } catch (err) {
        console.error('Error getting tour:', err);
        return res.status(404).json({
            status: 'fail',
            message: 'Tour not found'
        });
    };
};

exports.updateTour = async (req, res) => {
    try {
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
    } catch (error) {
        console.error('Error updating tour:', error);
        return res.status(400).json({
            status: 'fail',
            message: 'Invalid data',
            data: error
        });
    }
};

exports.deleteTour = async (req, res) => {
    try {
        await Tour.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status:'success',
            requestedAt: req.requestTime,
            message: 'Tour deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting tour:', error);
        return res.status(404).json({
            status: 'fail',
            message: 'Tour not found'
        });
    }

 
};