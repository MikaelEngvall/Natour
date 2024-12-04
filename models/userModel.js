const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter a name'],
        minlength: 3,
        maxlength: 30
    },
    email: {
        type: String,
        required: [true, 'Please enter an email'],
        unique: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: String,
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: 'Passwords do not match'
        }
    },
    passwordChangedAt: Date
});

// Middleware to hash password and set passwordChangedAt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 13);
    this.passwordConfirm = undefined;
    this.passwordChangedAt = Date.now() - 1000; // Ensure token is issued after this time
    console.log('Set passwordChangedAt in pre-save:', this.passwordChangedAt);
    next();
});

// Middleware to handle updates
userSchema.pre('findOneAndUpdate', function (next) {
    if (this._update.password) {
        this._update.passwordChangedAt = Date.now() - 1000;
    }
    next();
});

// Instance method to check if password was changed after token issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    console.log('Checking passwordChangedAt:', this.passwordChangedAt);
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return changedTimestamp > JWTTimestamp;
    }
    return false;
};

// Instance method to compare passwords
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
