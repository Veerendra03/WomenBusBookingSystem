const mongoose = require('mongoose');

const regularUserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      unique: true,
      default: null, // Optional during OTP phase, required during signup
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
    },
    password: {
      type: String,
      minlength: 6,
      default: null, // Optional during OTP phase, required during signup
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number'],
    },
    role: {
      type: String,
      enum: ['User'], // Restrict to User for this model
      default: 'User',
    },
    otp: {
      type: String,
      default: null, // Store OTP for verification
    },
    otpExpires: {
      type: Date,
      default: null, // Expiration time for OTP
    },
    token: {
      type: String,
      default: null, // JWT or session token
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: 'regularusers' } // Specify a different collection name
);

// Export the model using a singleton pattern to prevent redefinition
module.exports = mongoose.models.RegularUser || mongoose.model('RegularUser', regularUserSchema);