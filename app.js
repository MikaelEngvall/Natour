const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const swaggerUi = require('swagger-ui-express'); // Add Swagger
const swaggerDocument = require('./swagger.json'); // Adjust the path if needed

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

// Global Middleware

/**
 * Applies the Helmet middleware to enhance the application's security.
 * Helmet helps secure Express apps by setting various HTTP headers.
 * It includes protection against common web vulnerabilities like XSS, clickjacking, and others.
 *
 * @function
 * @name helmetMiddleware
 * @param {Function} helmet - The Helmet middleware function.
 * @returns {void} This function doesn't return anything; it sets up the middleware.
 */
app.use(helmet());


/**
 * Creates a rate limiter middleware to control the frequency of incoming requests.
 * 
 * @function
 * @name limiter
 * @description This function configures a rate limiting middleware using the 'express-rate-limit' package.
 *              It restricts the number of requests that can be made by a single IP address within a specified time window.
 * 
 * @param {Object} options - Configuration options for the rate limiter.
 * @param {number} options.windowMs - The time window in milliseconds for which requests are counted. Set to 1 hour (3,600,000 ms).
 * @param {number} options.max - The maximum number of requests allowed per IP address within the time window. Set to 100 requests.
 * @param {string} options.message - The error message to send when the rate limit is exceeded.
 * 
 * @returns {Function} A middleware function that can be used with Express to apply rate limiting to routes.
 */
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, try again in 1 hour'
})


/**
 * Configures middleware for JSON parsing and logging.
 * 
 * This function sets up two middleware:
 * 1. JSON parsing middleware to handle JSON payloads in requests.
 * 2. Morgan logging middleware (only in development environment) for HTTP request logging.
 *
 * @param {Function} express.json - Express middleware function for parsing JSON request bodies.
 * @param {string} process.env.NODE_ENV - Environment variable indicating the current environment.
 * @param {Function} morgan - HTTP request logger middleware function.
 * @param {string} 'dev' - Predefined format string for Morgan, specifying concise output colored by response status.
 * @returns {void} This function doesn't return anything; it sets up the middleware.
 */
app.use(express.json());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}


/**
 * Applies rate limiting middleware to the '/api' route.
 * This function sets up a rate limiter for all routes starting with '/api',
 * restricting the number of requests that can be made within a specified time window.
 *
 * @param {string} path - The base path to apply the rate limiter to. In this case, '/api'.
 * @param {Function} limiter - The rate limiting middleware function configured earlier.
 *                             It controls the rate of requests based on IP address.
 * @returns {void} This function doesn't return anything; it sets up the middleware.
 */
app.use('/api', limiter);



/**
 * Middleware to parse JSON payloads in incoming requests.
 * This function sets up the Express application to automatically parse JSON request bodies,
 * with a size limit to prevent potential abuse.
 *
 * @param {Function} express.json - Express middleware function for parsing JSON.
 * @param {Object} options - Configuration options for the JSON parser.
 * @param {string} options.limit - Maximum size of the JSON payload. Set to '10kb' to limit requests to 10 kilobytes.
 * @returns {Function} Express middleware function that parses JSON request bodies.
 */
app.use(express.json({ limit: '10kb' }));


/**
 * Applies MongoDB sanitization middleware to the Express application.
 * This middleware function sanitizes the request payload to prevent NoSQL injection attacks.
 * It removes any keys in objects that begin with '$' or contain '.', which could be used
 * to manipulate MongoDB operators.
 *
 * @function
 * @name mongoSanitize
 * @returns {Function} Express middleware function that sanitizes incoming data against NoSQL injection.
 */
app.use(mongoSanitize());


// Data sanitization against xss
/**
 * Applies XSS (Cross-Site Scripting) protection middleware to the Express application.
 * This middleware sanitizes user input to prevent XSS attacks by removing or encoding
 * potentially malicious scripts from the request body, query string, and params.
 *
 * @function
 * @name xssProtection
 * @returns {Function} Express middleware function that sanitizes incoming data against XSS attacks.
 */
app.use(xss());


/**
 * Middleware to prevent HTTP Parameter Pollution attacks.
 * This function uses the HPP (HTTP Parameter Pollution) middleware to protect against attacks
 * that attempt to override or manipulate HTTP parameters.
 *
 * @param {Object} options - Configuration options for the HPP middleware.
 * @param {string[]} options.whitelist - An array of parameter names that are allowed to be duplicated in the query string.
 *                                       These parameters will not be affected by the HPP protection.
 * @returns {Function} Express middleware function that applies HPP protection.
 */
app.use(hpp({
  whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price']
}));



/**
 * Serves static files from the 'public' directory.
 * This middleware function sets up Express to serve static files (like HTML, CSS, images)
 * from the specified directory. It allows the application to serve static content
 * without defining specific routes for each file.
 *
 * @param {string} path - The path to the directory from which to serve static files.
 *                        Here, it's set to the 'public' folder in the current directory.
 * @returns {void} This function doesn't return anything; it sets up the middleware.
 */
app.use(express.static(`${__dirname}/public`));



/**
 * Sets up Swagger UI for API documentation.
 * This middleware function serves the Swagger UI and configures it with the provided Swagger document.
 * It makes the API documentation accessible at the '/api-docs' endpoint.
 *
 * @param {string} path - The URL path where the Swagger UI will be served. In this case, '/api-docs'.
 * @param {Function} swaggerUi.serve - Middleware function that serves the Swagger UI static assets.
 * @param {Function} swaggerUi.setup - Function that sets up the Swagger UI with the provided configuration.
 * @param {Object} swaggerDocument - The Swagger/OpenAPI specification document that describes the API.
 * @returns {void} This function doesn't return anything; it sets up the middleware.
 */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// Middleware to add request time
/**
 * Middleware function to add a timestamp to the request object.
 * This function adds a 'requestTime' property to each incoming request,
 * which represents the time the request was received by the server.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 * @returns {void} This function doesn't return anything, it calls the next middleware.
 */
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});


// Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// Handle unhandled routes
/**
 * Handles all unmatched routes in the application.
 * This middleware function catches any request that hasn't been handled by previous routes.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {void} Passes an AppError to the next middleware.
 */
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});



/**
 * Applies the global error handling middleware to the Express application.
 * This middleware catches and processes any errors that occur during the request-response cycle,
 * providing a centralized way to handle and respond to errors across the application.
 *
 * @param {Function} globalErrorHandler - The error handling middleware function.
 *        This function should take four parameters: err, req, res, and next,
 *        and handle various types of errors, potentially sending appropriate responses to the client.
 * @returns {void} This function doesn't return anything; it sets up the middleware.
 */
app.use(globalErrorHandler);


module.exports = app;
