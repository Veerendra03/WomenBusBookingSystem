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