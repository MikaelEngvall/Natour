const crypto = require('crypto');
const sendEmail = require('./../utils/email');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

/**
 * Generates a JSON Web Token (JWT) for a given user ID.
 *
 * @param {string} id - The unique identifier of the user.
 * @returns {string} A signed JWT containing the user's ID, encrypted with the secret key and set to expire as per the environment configuration.
 */
const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { 
        expiresIn: process.env.JWT_EXPIRES_IN 
         });
}


/**
 * Creates and sends a JWT token in the response.
 * 
 * @param {Object} user - The user object for whom the token is being created.
 * @param {number} statusCode - The HTTP status code to be set in the response.
 * @param {Object} res - The response object to send the token and user data.
 * @returns {void} This function doesn't return anything, it sends the response directly.
 */
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
}


/**
 * Handles user signup process.
 * Creates a new user in the database and sends a JWT token upon successful registration.
 *
 * @async
 * @function signup
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing user details
 * @param {string} req.body.name - User's name
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.role - User's role
 * @param {string} req.body.password - User's password
 * @param {string} req.body.passwordConfirm - Password confirmation
 * @param {Object} res - Express response object
 * @param {function} next - Express next middleware function
 * @returns {void} Doesn't return anything, sends response via createSendToken
 */
exports.signup = catchAsync(async (req, res, next) => {

    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });
    createSendToken(newUser, 201, res)
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
    createSendToken(user, 200, res);
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

/**
 * Creates a middleware function that restricts access to specific user roles.
 * 
 * @param {...string} roles - The roles allowed to access the route.
 * @returns {function} A middleware function that checks if the user's role is included in the allowed roles.
 * @throws {AppError} If the user's role is not included in the allowed roles, it throws an unauthorized access error.
 */
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
        
        const message = `Forgott you password? Submit a PATCH with you new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email`;
        await sendEmail({
            email: user.email,
            subject: 'Your reset password token. Valid for 10 minutes',
            message
        });
        
        res.status(200).json({
            status: 'success',
            message: 'Reset password email sent.'
        });
        
    } catch(err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save({ validateBeforeSave: false });
        //console.error('Error sending email:', err);
        return next(new AppError('There was an error sending the email. Please try again later.', 500));
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user by reset token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });
    
    // 2) If token has not expired, and there is user, set the new password
    if(!user) {
        return next(new AppError('Invalid or expired reset password token.', 400));
    }
        // Hash the new password and remove the old resetPasswordToken and resetPasswordExpires properties
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

    // 3) Update changedPasswordAt property for the user
    // 4) Log the user in, send JWT
    createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get user from request collection
    const user = await User.findById(req.user.id).select('+password');

    // 2) Check if POSTed current password is correct
    if(!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('Incorrect current password.', 401));
    }

    // 3) Update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    // User.findByIdAndUpdate will NOT work. It only works with save.

    // 4) Log the user in, send JWT
    createSendToken(user, 200, res);
});