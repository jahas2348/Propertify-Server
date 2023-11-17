// Assuming your user.model.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/jwtConfig');
const { Schema } = mongoose;

const ObjectId = mongoose.Types.ObjectId;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  userpassword: {
    type: String,
    required: true,
  },
  usermobNo: {
    type: String,
  },
  useremail: {
    type: String,
  },
  isLogin: {
    type: Boolean,
    default: false,
  },
  requests: [
    {
      type: ObjectId,
      ref: 'request',
    },
  ],
  paymentRequests: [
    {
      type: ObjectId,
      ref: 'paymentRequest',
    },
  ],
  favourites: [
    {
      type: Schema.Types.ObjectId,
      ref: 'property',
    },
  ],
});

// Add a method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.userpassword);
};

// Generate Token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id, username: this.username }, config.jwtSecret, {
    expiresIn: '1h',
  });
};

// Add a method to update user details
userSchema.methods.updateUserDetails = async function (newDetails) {
  try {
    // Update user details excluding the password
    this.username = newDetails.username || this.username;
    this.useremail = newDetails.useremail || this.useremail;

    await this.save();
  } catch (error) {
    throw new Error('Error updating user details');
  }
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('userpassword')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.userpassword, salt);
    this.userpassword = hashedPassword;
    next();
  } catch (error) {
    return next(error);
  }
});

const UserModel = mongoose.model('user', userSchema);
module.exports = UserModel;
