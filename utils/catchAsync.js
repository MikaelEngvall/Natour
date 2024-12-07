/**
 * Wraps an asynchronous function to catch any errors and pass them to the Express error handling middleware.
 * 
 * @param {Function} fn - The asynchronous function to be wrapped.
 * @returns {Function} A new function that executes the original function and catches any errors.
 */
module.exports = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(next)
    }
}
