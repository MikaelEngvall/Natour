const fs = require('fs');
let tours;
try {
    tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8'));
} catch (error) {
    console.error('Error reading tours file:', error);
    tours = [];
}

exports.getAllTours = (req, res) => {
    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        results: tours.length,
        data: { tours }
    });
};

exports.createTour = (req, res) => {
    const newId = tours.length > 0 ? tours[tours.length - 1].id + 1 : 0;
    const newTour = Object.assign({ id: newId }, req.body);

    tours.push(newTour);

    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
        if (err) {
            return res.status(500).json({
                status: 'fail',
                message: 'Could not save the tour'
            });
        }
        res.status(201).json({
            status: 'success',
            requestedAt: req.requestTime,
            data: { tour: newTour }
        });
    });
};

exports.getTour = (req, res) => {
    const id = parseInt(req.params.id, 10);
    const tour = tours.find(el => el.id === id);

    if (!tour) {
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid ID'
        });
    }

    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        data: { tour }
    });
};

exports.updateTour = (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id < 0 || id >= tours.length) {
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid ID'
        });
    }
    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        message: 'Tour updated successfully',
        data: { tour: '<Updated tour>' }
    });
};

exports.deleteTour = (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id < 0 || id >= tours.length) {
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid ID'
        });
    }
    res.status(204).json({
        status: 'success',
        requestedAt: req.requestTime,
        message: 'Tour deleted successfully',
        data: null
    });
};