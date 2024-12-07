const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter a name'],
        minlength: 3,
        maxlength: 60
    },
    email: {
        type: String,
        required: [true, 'Please enter an email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
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
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
      }
});

/**
 * Middleware function to hash the user's password before saving to the database.
 * This function is executed before the 'save' operation on the user document.
 * It only runs if the password field has been modified.
 *
 * @param {Function} next - The next middleware function in the stack.
 * @returns {void}
 */
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 13);
    this.passwordConfirm = undefined;
    this.passwordChangedAt = Date.now() - 1000; // Ensure token is issued after this time
    next();
});


/**
 * Middleware function executed before a findOneAndUpdate operation on the user document.
 * It updates the passwordChangedAt field if the password is being updated.
 *
 * @param {Function} next - The next middleware function in the stack.
 * @returns {void}
 */
userSchema.pre('findOneAndUpdate', function (next) {
    if (this._update.password) {
        this._update.passwordChangedAt = Date.now() - 1000;
    }
    next();
});


/**
 * Checks if the user's password was changed after a given timestamp.
 * This method is used to determine if a JWT token is still valid based on when it was issued.
 *
 * @param {number} JWTTimestamp - The timestamp of when the JWT was issued (in seconds).
 * @returns {boolean} Returns true if the password was changed after the JWT was issued, false otherwise.
 */
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return changedTimestamp > JWTTimestamp;
    }
    return false;
};


// Instance method to compare passwords
/**
 * Compares a candidate password with the user's hashed password.
 * This method is used for password verification during authentication.
 *
 * @async
 * @param {string} candidatePassword - The password provided by the user during login attempt.
 * @param {string} userPassword - The hashed password stored in the database for the user.
 * @returns {Promise<boolean>} A promise that resolves to true if the passwords match, false otherwise.
 */
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};


/**
 * Creates a password reset token for the user.
 * This method generates a random token, hashes it, and stores the hash in the user document.
 * It also sets an expiration time for the token.
 *
 * @function
 * @memberof userSchema.methods
 * @returns {string} The unhashed reset token to be sent to the user.
 */
userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

        console.log({resetToken}, this.passwordResetToken);

    this.passwordResetExpires = Date
        .now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
};


const User = mongoose.model('User', userSchema);

module.exports = User;
