const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`
    return new AppError(message, 400);    
}

const handleDuplicateFieldsDB = err => {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    console.log(value);
    const message = `Duplicate field value: ${value}, please use another value`;
    return new AppError(message, 400);
};
  
const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
       });
    }
    const sendErrorProd = (err, res) => {
        if (err.isOperational) {
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        } else {
            //1 log the error
            //console.error('Error:', err);
            // 2) Send generic message
            res.status(500).json({
                status: 'error',
                message: 'Something went wrong, please try again later.'
            })
        }
    };
    
module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };

        if (err.name === 'CastError') error = handleCastErrorDB(error);
        if (err.code === 11000) error = handleDuplicateFieldsDB(error);
        if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
        sendErrorProd(error, res);
    }
}