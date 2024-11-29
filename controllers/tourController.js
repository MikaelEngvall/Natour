
const Tour = require('./../models/tourModel');


exports.getAllTours = (req, res) => {
    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
/*         results: tours.length,
        data: { tours } */
    });
};

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

exports.getTour = (req, res) => {
    const id = req.params.id * 1;
/*     const tour = tours.find(el => el.id === id);

    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        data: { tour }
    }); */
};

exports.updateTour = (req, res) => {
  
    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        message: 'Tour updated successfully',
        data: { tour: '<Updated tour>' }
    });
};

exports.deleteTour = (req, res) => {

    res.status(204).json({
        status: 'success',
        requestedAt: req.requestTime,
        message: 'Tour deleted successfully',
        data: null
    });
};