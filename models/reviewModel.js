// review, a rating createdAt ref to the tour and to the user who wrote the review

const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

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
        path: 'tour',
        select: 'name'
    }).populate({
        path: 'user',
        select: 'name photo'
    });
    next();
  });

reviewSchema.pre('save', function (next) {
    this.slug = slugify(this.review, { lower: true });
    next();
});

// const Review = mongoose.model('Review', reviewSchema);

module.exports = mongoose.model('Review', reviewSchema);
