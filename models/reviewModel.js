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

reviewSchema.pre('save', function (next) {
    this.slug = slugify(this.review, { lower: true });
    next();
});

// const Review = mongoose.model('Review', reviewSchema);

module.exports = mongoose.model('Review', reviewSchema);

// middleware to validate review content and rating

reviewSchema.pre('save', async function (next) {
    const { review, rating } = this;

    if (!validator.isLength(review, { min: 5, max: 500 })) {
        throw new Error('Review must be between 5 and 500 characters long');
    }

    if (!validator.isNumeric(rating) || !Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw new Error('Rating must be a number between 1 and 5');
    }

    next();
});

// middleware to check if user has already reviewed the tour

reviewSchema.statics.checkReviewExistence = async function (tourId, userId) {
    const review = await this.findOne({ tour: tourId, user: userId });
    if (review) {
        throw new Error('User has already reviewed this tour');
    }
};

// middleware to calculate average rating of the tour

reviewSchema.statics.calculateAverageRating = async function (tourId) {
    const stats = await this.aggregate([
        { $match: { tour: tourId } },
        { $group: { _id: '$tour', averageRating: { $avg: '$rating' } } }
    ]);

    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, { averageRating: stats[0].averageRating });
    } else {
        await Tour.findByIdAndUpdate(tourId, { averageRating: 0 });
    }
};

// middleware to delete all reviews when a tour is deleted

reviewSchema.statics.deleteAllReviews = async function (tourId) {
    await this.deleteMany({ tour: tourId });
};

// middleware to update ratings quantity and average rating when a review is created or updated

reviewSchema.post('save', async function () {
    const { tour } = this;
    const numReviews = await Review.countDocuments({ tour });
    const avgRating = await Review.aggregate([
        { $match: { tour } },
        { $group: { _id: '$tour', averageRating: { $avg: '$rating' } } }
    ])[0].averageRating;

    await Tour.findByIdAndUpdate(tour, {
        ratingsQuantity: numReviews,
        averageRating: avgRating
    });
});

// middleware to delete all reviews when a user is deleted

reviewSchema.statics.deleteUserReviews = async function (userId) {
    await this.deleteMany({ user: userId });
};

// middleware to check if user has already liked the tour

reviewSchema.statics.checkLikeExistence = async function (tourId, userId) {
    const review = await this.findOne({ tour: tourId, user: userId, like: true });
    if (review) {
        throw new Error('User has already liked this tour');
    }
};

// middleware to check if user has already disliked the tour

reviewSchema.statics.checkDislikeExistence = async function (tourId, userId) {
    const review = await this.findOne({ tour: tourId, user: userId, dislike: true });
    if (review) {
        throw new Error('User has already disliked this tour');
    }
};

// middleware to update like and dislike counts when a review is created or updated

reviewSchema.post('save', async function () {
    const { tour, like, dislike } = this;
    const numLikes = await this.countDocuments({ tour, like: true });
    const numDislikes = await this.countDocuments({ tour, dislike: true });

    await Tour.findByIdAndUpdate(tour, {
        likeCount: numLikes,
        dislikeCount: numDislikes
    });
});

// middleware to delete all reviews when a user is deleted

reviewSchema.statics.deleteUserLikes = async function (userId) {
    await this.updateMany({ user: userId, like: true }, { like: false });
};

reviewSchema.statics.deleteUserDislikes = async function (userId) {
    await this.updateMany({ user: userId, dislike: true }, { dislike: false });
    await this.deleteUserLikes(userId); // Delete all user likes before deleting user dislikes to avoid orphaned likes
    await this.deleteUserReviews(userId); // Delete all user reviews to avoid orphaned reviews
    await Tour.updateMany({}, { $pull: { reviews: userId } }); // Delete all reviews from associated tours
    await Tour.updateMany({}, { $pull: { usersLiked: userId } }); // Delete user from associated tours' usersLiked array
    await Tour.updateMany({}, { $pull: { usersDisliked: userId } }); // Delete user from associated tours' usersDisliked array
    await Tour.updateMany({}, { $pull: { usersWhoLiked: userId } }); // Delete user from associated tours' usersWhoLiked array
    await Tour.updateMany({}, { $pull: { usersWhoDisliked: userId } }); // Delete user from associated tours' usersWhoDisliked array
    await Tour.updateMany({}, { $pull: { reviews: userId } }); // Delete user from associated tours' reviews array
    await Tour.updateMany({}, { $pull: { usersWhoCommented: userId } }); // Delete user from associated tours' usersWhoCommented array
    await Tour.updateMany({}, { $pull: { usersWhoBookmarked: userId } }); // Delete user from associated tours' usersWhoBookmarked array
    await Tour.updateMany({}, { $pull: { usersWhoWatched: userId } }); // Delete user from associated tours' usersWhoWatched array
    await Tour.updateMany({}, { $pull: { usersWhoRated: userId } }); // Delete user from associated tours' usersWhoRated array
    await Tour.updateMany({}, { $pull: { usersWhoViewed: userId } }); // Delete user from associated tours' usersWhoViewed array
    await Tour.updateMany({}, { $pull: { usersWhoShared: userId } }); // Delete user from associated tours' usersWhoShared array
    await Tour.updateMany({}, { $pull: { usersWhoAsked: userId } }); // Delete user from associated tours' usersWhoAsked array
    await Tour.updateMany({}, { $pull: { usersWhoAnswered: userId } }); // Delete user from associated tours' usersWhoAnswered array
    await Tour.updateMany({}, { $pull: { usersWhoAddedToCart: userId } }); // Delete user from associated tours' usersWhoAddedToCart array
    await Tour.updateMany({}, { $pull: { usersWhoPurchased: userId } }); // Delete user from associated tours' usersWhoPurchased array
    await Tour.updateMany({}, { $pull: { usersWhoFavorited: userId } }); // Delete user from associated tours' usersWhoFavorited array
    await Tour.updateMany({}, { $pull: { usersWhoRated: userId } }); // Delete user from associated tours' usersWhoRated array
    await Tour.updateMany({}, { $pull: { usersWhoViewed: userId } }); // Delete user from associated tours' usersWhoViewed array
    await Tour.updateMany({}, { $pull: { usersWhoShared: userId } }); // Delete user from associated tours' usersWhoShared array
    await Tour.updateMany({}, { $pull: { usersWhoAsked: userId } }); // Delete user from associated tours' usersWhoAsked array
    await Tour.updateMany({}, { $pull: { usersWhoAnswered: userId } }); // Delete user from associated tours' usersWhoAnswered array
    await Tour.updateMany({}, { $pull: { usersWhoAddedToCart: userId } }); // Delete user from associated tours' usersWhoAddedToCart array
    await Tour.updateMany({}, { $pull: { usersWhoPurchased: userId } }); // Delete user from associated tours' usersWhoPurchased array

};