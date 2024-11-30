const mongoose = require('mongoose');
const fs = require('fs');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');


dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
.connect(DB)
.then(() => console.log('Connected to database')).catch((err) => console.log('MongoDB connection error:', err));

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf8'));

const importData = async () => {
    try {
        await Tour.create(tours);
        console.log('Data imported successfully');
        process.exit();
    } catch (err) {
        console.error(err);
    }
};

//Delete all data from db

const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log('Data deleted successfully');
        process.exit();
    } catch (err) {
        console.error(err);
    }
};

if(process.argv[2] === '--import') {
    importData();
} else if(process.argv[2] === '--delete') {
    deleteData();
} 

console.log(process.argv);