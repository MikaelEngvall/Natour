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
.then(() => console.log('Connected to database')).catch((err) => console.log('MongoDB connection error:', err));

const port = 3000;
app.listen(port, () => {
  console.log(`Running in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`);
});


