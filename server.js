const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load the correct environment file
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: './config.prod.env' });
} else {
  dotenv.config({ path: './config.env' });
}

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB)
/**
 * Handles the connection to the MongoDB database.
 * This function attempts to connect to the database and logs the result.
 * If the connection is successful, it logs a success message.
 * If the connection fails, it logs the error message.
 * 
 * @returns {Promise<void>} A promise that resolves when the connection attempt is complete.
 */
.then(() => console.log('Connected to database')).catch((err) => console.log('MongoDB connection error:', err));


const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`Running in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`);
});

/**
 * Handles unhandled promise rejections in the application.
 * This function logs the error, gracefully shuts down the server, and exits the process.
 * 
 * @param {Function} listener - The callback function to be executed when an unhandled rejection occurs.
 * @param {Error} err - The error object representing the unhandled rejection.
 * @returns {void}
 */
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! �� Shutting down...', err);
  server.close(()=>{
    process.exit(1);
  });
});


