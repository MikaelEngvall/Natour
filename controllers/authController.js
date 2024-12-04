const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { 
        expiresIn: process.env.JWT_EXPIRES_IN 
         });
}
exports.signup = catchAsync(async (req, res, next) => {
        
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });

    // Generate JWT token
    const token = signToken(newUser._id);

        res.status(201).json({
            status: 'success',
            token,
            data: {
                user: newUser
            }
        });
});

exports.login = catchAsync( async (req, res, next) => {
    const { email, password } = req.body;

    // 1) check if email and password exist
    if(!email ||!password) {
        return next(new AppError('Please provide email and password', 400));
    }

    // 2) Check if user exist and password is correct
    const user = await User.findOne({ email }).select('+password'); // + because it is set to false in the model

    
    if(!user ||!await user.correctPassword(password, user.password)) {
        return next(new AppError('Invalid email or password', 401));
    }

    // 3) If everything ok, send token to client
    const token = signToken(user._id); // jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.status(200).json({
        status:'success',
        token
    });
});

exports.protect = catchAsync(async (req, res, next) => {
    // 1) Check if token exists in header
    let token;
    
    if(
        req.headers.authorization && 
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if(!token) {
        return next(new AppError('You are not logged in. Please log in to access this route.', 401));
    }

    // 2) Verification token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //  console.log(decoded);
    // 3) Check if user still exist
    
    const user = await User.findById(decoded.id);
    if(!user) {
        return next(new AppError('User no longer exists.', 401));
    }
    
    // 4) If user changed password after the token was issued
    if(user.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password. Please log in again.', 401));
    }
    
/*     // Grant access to protected route
    req.user = user; */

next();
});