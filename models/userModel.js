const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
// create a schema for users with name, email, photo, password and passwordConfirm 

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
            /* match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please enter a valid email'
            ] */
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
                // This only works on CREATE and SAVE !!!
                validator: function(el) {
                    return el === this.password;
                },
                message: 'Passwords do not match'
            }
        }
    }
);

// hash the password before saving to the database

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 14);
    this.passwordConfirm = undefined; // delete passwordConfirm field to keep it secure

    next();
});

userSchema.methods.correctPassword = async function(
    candidatePassword, 
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

// create a model for users and export it

const User = mongoose.model('User', userSchema);

module.exports = User;