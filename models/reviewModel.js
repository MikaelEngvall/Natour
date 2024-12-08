
const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
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

// POST /tour/934ur8934/reviews
// GET /tour/934ur8934/reviews
// GET /tour/934ur8934/reviews/3099032hf


module.exports = mongoose.model('Review', reviewSchema);

