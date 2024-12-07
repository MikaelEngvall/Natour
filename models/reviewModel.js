
const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
/**
 * Mongoose schema for the Review model.
 * @typedef {Object} ReviewSchema
 * @property {string} review - The content of the review. Required, max 500 characters.
 * @property {number} rating - The rating given in the review. Required, between 1 and 5.
 * @property {Date} createdAt - The date the review was created. Defaults to current date.
 * @property {mongoose.Schema.ObjectId} tour - Reference to the Tour model. Required.
 * @property {mongoose.Schema.ObjectId} user - Reference to the User model. Required.
 */

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

/**
 * Middleware to populate tour and user fields before any find query.
 * @param {Function} next - The next middleware function in the stack.
 */
reviewSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'tour',
        select: 'name'
    }).populate({
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

module.exports = mongoose.model('Review', reviewSchema);

