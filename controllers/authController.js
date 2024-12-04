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
        role: req.body.role,
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
    
    // Grant access to protected route
    req.user = user;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // Check if user role matches any of the required roles
        if(!roles.includes(req.user.role)) {
            return next(new AppError('Unauthorized to access this route.', 403));
        }
        next();
    };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user by email
    const user = await User.findOne({ email: req.body.email });
    if(!user) {
        return next(new AppError('No user found with that email.', 404));
    }
    
    // 2) Generate random token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    
    // 3) Send email to user with reset token
    try {
        const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
        await sendEmail({
            to: user.email,
            subject: 'Password reset',
            text: `Please visit this link to reset your password: ${resetURL}`
        });
        
        res.status(200).json({
            status: 'success',
            message: 'Reset password email sent.'
        });
        
    } catch(err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save({ validateBeforeSave: false });
        console.error('Error sending email:', err);
        return next(new AppError('There was an error sending the email. Please try again later.', 500));
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user by reset token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
    });
    
    // 2) If token is invalid, return error
    if(!user) {
        return next(new AppError('Invalid or expired reset password token.', 400));
    }
    
    // 3) Set new password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    // 4) Log the user in
    const token = signToken(user._id);
    
    res.status(200).json({
        status: 'success',
        token
    });
});