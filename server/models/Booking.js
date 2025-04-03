// // const mongoose = require('mongoose');

// // const bookingSchema = new mongoose.Schema(
// //   {
// //     userId: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: 'RegularUser',
// //       required: true,
// //     },
// //     busId: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: 'Bus',
// //       required: true,
// //     },
// //     adminId: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: 'Admin',
// //       required: true,
// //     },
// //     travelDate: {
// //       type: Date,
// //       required: true,
// //     },
// //     seatsBooked: [
// //       {
// //         seatNumber: {
// //           type: Number,
// //           required: true,
// //         },
// //       },
// //     ],
// //     totalFare: {
// //       type: Number,
// //       required: true,
// //     },
// //     status: {
// //       type: String,
// //       enum: ['Confirmed', 'Completed', 'Missed', 'Cancelled'],
// //       default: 'Confirmed',
// //     },
// //     userDetails: {
// //       name: {
// //         type: String,
// //         required: true,
// //       },
// //       phone: {
// //         type: String,
// //         required: true,
// //         match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number'],
// //       },
// //       email: {
// //         type: String,
// //         required: true,
// //         match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
// //       },
// //       gender: {
// //         type: String,
// //         enum: ['Male', 'Female', 'Other'],
// //         required: true,
// //       },
// //       age: {
// //         type: Number,
// //         required: true,
// //         min: 1,
// //       },
// //       parentPhone: {
// //         type: String,
// //         required: true,
// //         match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number'],
// //       },
// //       passengers: [
// //         {
// //           name: { type: String, required: true },
// //           age: { type: Number, required: true, min: 1 },
// //           gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
// //         },
// //       ],
// //     },
// //     createdAt: {
// //       type: Date,
// //       default: Date.now,
// //     },
// //   },
// //   { collection: 'bookings' }
// // );

// // module.exports = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
// const mongoose = require('mongoose');

// const bookingSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'RegularUser',
//       required: true,
//     },
//     busId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Bus',
//       required: true,
//     },
//     adminId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },
//     travelDate: {
//       type: Date,
//       required: true,
//     },
//     seatsBooked: [
//       {
//         seatNumber: {
//           type: Number,
//           required: true,
//           min: 1,
//           max: 50,
//         },
//       },
//     ],
//     totalFare: {
//       type: Number,
//       required: true,
//       min: 0,
//     },
//     status: {
//       type: String,
//       enum: ['Confirmed', 'Completed', 'Missed', 'Cancelled'],
//       default: 'Confirmed',
//     },
//     userDetails: {
//       name: {
//         type: String,
//         required: true,
//       },
//       phone: {
//         type: String,
//         required: true,
//         match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number'],
//       },
//       email: {
//         type: String,
//         required: true,
//         match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
//       },
//       gender: {
//         type: String,
//         enum: ['Male', 'Female', 'Other'],
//         required: true,
//       },
//       age: {
//         type: Number,
//         required: true,
//         min: 1,
//       },
//       parentPhone: {
//         type: String,
//         required: true,
//         match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number'],
//       },
//       passengers: [
//         {
//           name: { type: String, required: true },
//           age: { type: Number, required: true, min: 1 },
//           gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
//         },
//       ],
//     },
//     createdAt: {
//       type: Date,
//       default: Date.now,
//     },
//   },
//   { collection: 'bookings' }
// );

// // Validate passengers array length (1 to 3 additional passengers)
// bookingSchema.path('userDetails.passengers').validate(function (value) {
//   return value.length >= 1 && value.length <= 3;
// }, 'Must include 1 to 3 additional passengers');

// module.exports = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'RegularUser', required: true },
  busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  travelDate: { type: Date, required: true },
  seatsBooked: [
    {
      seatNumber: { type: Number, required: true },
    },
  ],
  totalFare: { type: Number, required: true },
  userDetails: {
    passengers: [
      {
        name: { type: String, required: true },
        age: { type: Number, required: true, min: 1 },
        gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
        phone: { type: String, required: true },
        email: { type: String, required: true },
        parentPhone: { type: String, required: true },
      },
    ],
  },
  status: { type: String, enum: ['Confirmed', 'Completed', 'Missed', 'Cancelled'], default: 'Confirmed' },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);