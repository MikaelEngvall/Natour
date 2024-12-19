const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  // Get tour data from collection
  const tours = await Tour.find();

  // Render that template using tour data from 1)
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
    user: res.locals.user, // Make sure this line is present
  });
  console.log('User in getOverview:', res.locals.user);
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Find the tour by id
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  // 2) Check if the tour exists
  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }
  // 3) Render the tour page with the tour data

  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getLoginForm = catchAsync(async (req, res, next) => {
  res.status(200).render('login', { title: 'Log into you account' });
});

exports.getSignUpForm = catchAsync(async (req, res, next) => {
  res.status(200).render('signup', { title: 'Sign up' });
});
