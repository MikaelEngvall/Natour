const mongoose = require('mongoose');
const slugify = require('slugify');
const User = require('./userModel');


const tourSchema = new mongoose.Schema({
        name: {
            type: String,
            required: [true, 'A tour must have a name'],
            unique: true,
            trim: true,
            minlength: [10, 'A tour name must be at least 10 characters long'],
            maxlength: [40, 'A tour name must not exceed 40 characters'] 
        },
        slug: String,
        duration: {
            type: Number,
            required: [true, 'A tour must have a duration']
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'A tour must have a group size']
        },
        difficulty: {
            type: String,
            enum: {
                values: ['easy', 'medium', 'difficult'],
                message: 'Difficulty must be either easy, medium, or difficult'
            },
            required: [true, 'A tour must have a difficulty']
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, 'Rating must be above 1.0'],
            max: [5, 'Rating must be below 5.0'],
            //set: val => Math.round(val * 10) / 10 
        },
        ratingsQuantity: {
            type: Number,
            default: 0
        },
        price: {
            type: Number,
            required: [true, 'A tour must have a price']
        },
        priceDiscount: {
            type: Number,
            validate: {
            validator: function(val) {
                // this only points to current doc on NEW document creation
                return val < this.price;
            },
            message: 'Discount price ({VALUE}) should be below regular price'
            }
        },
        summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description']
        },
        description: {
            type: String,
            trim: true
        },
        imageCover: {
            type: String,
            required: [true, 'A tour must have a cover image']
        },
        images: [String],
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false
        },
        startDates: [Date],
        secretTour: {
            type: Boolean,
            default: false
        },
        startLocation: {
            //GeoJSON
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String
        },
        locations: [
            {
                type: {
                    type: String,
                    default: 'Point',
                    enum: ['Point']
                },
                coordinates: [Number],
                address: String,
                description: String,
                day: Number
            }
        ],
        guides: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                //required: true
            }
        ]
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

tourSchema.index({ price: 1});

/**
 * Calculates the duration of the tour in weeks.
 * This is a virtual property that is not stored in the database but calculated on-the-fly.
 * 
 * @returns {number} The duration of the tour in weeks, calculated by dividing the duration (in days) by 7.
 */
tourSchema.virtual('durationWeeks').get(function(){
    return this.duration / 7;
});

tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
});


// Document middleware: runs before .save() and .create()
/**
 * Middleware function that runs before saving a tour document.
 * It creates a slug from the tour name and sets it to the 'slug' field.
 *
 * @param {Function} next - The next middleware function in the stack.
 * @returns {void}
 */
tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});


/**
 * Middleware function that runs before any find query on the Tour model.
 * It filters out secret tours and sets a start time for the query.
 *
 * @param {Function} next - The next middleware function in the stack.
 * @returns {void}
 */
tourSchema.pre(/^find/, function(next) {
    this.find({ secretTour: { $ne: true } });
    this.start = Date.now();
    next();
});

/**
 * Middleware function that runs before any find query on the Tour model.
 * It populates the 'guides' field with user data, excluding '__v' and 'passwordChangedAt' fields.
 *
 * @param {Function} next - The next middleware function in the stack.
 * @returns {void}
 */
tourSchema.pre(/^find/, function(next) {
    this.populate({
      path: 'guides',
      select: '-__v -passwordChangedAt'
    });

    next();
  });


//Embedding
/* tourSchema.pre('save', async function(next) {
    const guidesPromises = this.guides.map(async id => await User.findById(id));
    this.guides = await Promise.all(guidesPromises);
    next();
}); */

// Referencing
/**
 * Middleware function that runs after any find query on the Tour model.
 * It logs a message to the console when a new tour is created.
 *
 * @param {Object} doc - The document that was just created or found.
 * @param {Function} next - The next middleware function in the stack.
 * @returns {void}
 */
tourSchema.post('/^find/', function(doc, next) {
    console.log(`New tour created: ${doc.name}`);
    next();
});


/**
 * Middleware function that runs before any find query on the Tour model.
 * It populates the 'guides' field with user data, excluding '__v' and 'passwordChangedAt' fields.
 *
 * @param {Function} next - The next middleware function in the stack.
 * @returns {void}
 */
tourSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    });
    next();
})


/**
 * Middleware function that runs before any aggregation operation on the Tour model.
 * It adds a $match stage to the aggregation pipeline to filter out secret tours.
 *
 * @param {Function} next - The next middleware function in the stack.
 * @returns {void}
 */
tourSchema.pre('aggregate', function(next) {
    this.pipeline().match({ secretTour: { $ne: true} });
    next();
});



const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
