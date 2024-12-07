/**
 * Custom error class for application-specific errors.
 * @extends Error
 */
class AppError extends Error {
    /**
     * Create an AppError.
     * @param {string} message - The error message.
     * @param {number} statusCode - The HTTP status code associated with the error.
     */
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}


module.exports = AppError;