// const mongoose = require('mongoose');

// const busSchema = new mongoose.Schema({
//   agencyName: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   adminId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//   },
//   busNumber: {
//     type: String,
//     required: true,
//     unique: true,
//     trim: true,
//   },
//   busImages: {
//     type: [String],
//     default: [],
//   },
//   fromAddress: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   toAddress: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   departureTime: {
//     type: String,
//     required: true,
//   },
//   arrivalTime: {
//     type: String,
//     required: true,
//   },
//   totalSeats: {
//     type: Number,
//     default: 50,
//   },
//   seats: [
//     {
//       seatNumber: {
//         type: Number,
//         required: true,
//       },
//       isBooked: {
//         type: Boolean,
//         default: false,
//       },
//     },
//   ],
//   fare: {
//     type: Number,
//     required: true,
//   },
//   isAC: {
//     type: Boolean,
//     default: false, // False for Non-AC, True for AC
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// module.exports = mongoose.model('Bus', busSchema);
const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  agencyName: {
    type: String,
    required: true,
    trim: true,
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  busNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  busImages: {
    type: [String],
    default: [],
  },
  fromAddress: {
    type: String,
    required: true,
    trim: true,
  },
  toAddress: {
    type: String,
    required: true,
    trim: true,
  },
  departureTime: {
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/, 'Departure time must be in HH:MM format'],
  },
  arrivalTime: {
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/, 'Arrival time must be in HH:MM format'],
  },
  totalSeats: {
    type: Number,
    default: 50,
  },
  seats: [
    {
      seatNumber: {
        type: Number,
        required: true,
        min: 1,
        max: 50,
      },
      isBooked: {
        type: Boolean,
        default: false,
      },
    },
  ],
  fare: {
    type: Number,
    required: true,
    min: 1,
  },
  isAC: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Bus', busSchema);