const cors = require('cors');
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const pug = require('pug');
const cookieParser = require('cookie-parser');

const swaggerUi = require('swagger-ui-express'); // Add Swagger
const swaggerDocument = require('./swagger.json'); // Adjust the path if needed

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const app = express();

app.use(
  cors({
    origin: 'http://localhost:3000', // Replace with your frontend URL
    methods: 'GET,POST,PUT,DELETE', // Adjust the methods as needed
    allowedHeaders: 'Content-Type, Authorization', // Adjust headers if needed
    credentials: true, // If you're using cookies or authentication
  }),
);

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, './views'));

// Global Middleware
app.use(express.static(path.join(__dirname, '/public')));

app.use(helmet());

app.use(helmet.dnsPrefetchControl());
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.originAgentCluster());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(helmet.xssFilter());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      'child-src': ['blob:'],
      'connect-src': [
        'https://*.mapbox.com',
        'https://*.cloudflare.com',
        'http://localhost:3000',
      ],
      'default-src': ["'self'"],
      'font-src': ["'self'", 'https://fonts.gstatic.com'],
      'img-src': ["'self'", 'data:', 'blob:'],
      'script-src': [
        "'self'",
        'https://*.mapbox.com',
        'https://*.cloudflare.com',
        'http://localhost:3000',
      ],
      'style-src': ["'self'", "'unsafe-inline'", 'https:'],
      'worker-src': ['blob:'],
    },
  }),
);

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, try again in 1 hour',
});

app.use(express.json());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser()); // Add cookie parser middleware

app.use(mongoSanitize());

app.use(xss());

app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log('Request Cookies:', req.cookies);
  next();
});

// Routes
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
