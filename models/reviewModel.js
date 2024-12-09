
const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const Tour = require('./tourModel');
/**
 * Creates and exports the Review model based on the ReviewSchema.
 * @type {mongoose.Model}
 */
const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'A review must have content'],
        maxlength: [500, 'A review must not exceed 500 characters']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'A review must have a rating']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user']
    }
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

reviewSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'user',
        select: 'name photo'
    });
    next();    
})

/**
 * Middleware to populate tour and user fields before any find query.
 * @param {Function} next - The next middleware function in the stack.
 */
reviewSchema.pre(/^find/, function(next) {
   this.populate({
        path: 'user',
        select: 'name photo'
    });
    next();
});

/**
 * Middleware to create a slug from the review content before saving.
 * @param {Function} next - The next middleware function in the stack.
 */
reviewSchema.pre('save', function (next) {
    this.slug = slugify(this.review, { lower: true });
    next();
});

reviewSchema.statics.calculateAverageRatings = async function(tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);
    console.log(stats);

    await Tour.findByIdAndUpdate(tourId, { 
        ratingsQuantity: stats[0].nRating, 
        ratingsAverage: stats[0].avgRating 
    });
};

reviewSchema.post('save', function() {
   // if (!this.isModified('rating')) return next();
    this.constructor.calculateAverageRatings(this.tour);
})

module.exports = mongoose.model('Review', reviewSchema);

