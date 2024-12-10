const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync( async (req, res) => {
  // 1) Get all the tour data from the database
  const tours = await Tour.find();
  // 2) Build template
  // 3) Render that template using tour data from 1)
  res.status(200).render('overview', { 
    title: 'All Tours',
    tours
  });
});

exports.getTour = catchAsync( async (req, res) => {
  // 1) Find the tour by id
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });
  // 2) Check if the tour exists
  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }
  // 3) Render the tour page with the tour data
  
    res.status(200).render('tour', { 
      title: `${tour.name} Tour`,
      tour 
    });
});

