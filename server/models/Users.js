// const mongoose = require('mongoose');

// const regularUserSchema = new mongoose.Schema(
//   {
//     username: {
//       type: String,
//       trim: true,
//       unique: true,
//       default: null,
//     },
//     email: {
//       type: String,
//       required: true,
//       trim: true,
//       unique: true,
//       lowercase: true,
//       match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
//     },
//     password: {
//       type: String,
//       minlength: 6,
//       default: null,
//     },
//     phone: {
//       type: String,
//       required: true,
//       trim: true,
//       match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number'],
//     },
//     role: {
//       type: String,
//       enum: ['User'],
//       default: 'User',
//     },
//     otp: {
//       type: String,
//       default: null,
//     },
//     otpExpires: {
//       type: Date,
//       default: null,
//     },
//     token: {
//       type: String,
//       default: null,
//     },
//     createdAt: {
//       type: Date,
//       default: Date.now,
//     },
//   },
//   { collection: 'regularusers' }
// );

// module.exports = mongoose.models.RegularUser || mongoose.model('RegularUser', regularUserSchema);
const mongoose = require('mongoose');

const regularUserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      unique: true,
      default: null,
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
      default: null,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number'],
    },
    role: {
      type: String,
      enum: ['User'],
      default: 'User',
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpires: {
      type: Date,
      default: null,
    },
    token: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: 'regularusers' }
);

module.exports = mongoose.models.RegularUser || mongoose.model('RegularUser', regularUserSchema);