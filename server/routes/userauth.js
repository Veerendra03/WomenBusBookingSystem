const express = require('express');
const router = express.Router();
const RegularUser = require('../models/Users');
const Bus = require('../models/Bus');
const Booking = require('../models/Booking');
const User = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const authenticateToken = require('../middleware/auth');
const twilio = require('twilio');
const axios= require('axios');
// Environment variables
const { JWT_SECRET, EMAIL_USER, EMAIL_PASS, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;

// Nodemailer transporter for email OTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Twilio client for WhatsApp
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send OTP via email
router.post('/send-otp', async (req, res) => {
  const { email, phone, role } = req.body;

  if (!email || !phone || !role) {
    return res.status(400).json({ message: 'Email, phone, and role are required' });
  }

  if (role !== 'User') {
    return res.status(400).json({ message: 'Invalid role for this endpoint' });
  }

  try {
    let user = await RegularUser.findOne({ email, phone, role });
    if (!user) {
      user = new RegularUser({ email, phone, role });
      await user.save();
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    await transporter.sendMail({
      from: EMAIL_USER,
      to: email,
      subject: 'Your OTP for User Verification',
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    });

    res.status(200).json({ message: `OTP sent to ${email}. Check your inbox.` });
  } catch (error) {
    console.error('OTP sending error:', error);
    res.status(500).json({ message: 'Error sending OTP', details: error.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  try {
    const user = await RegularUser.findOne({ email, role: 'User' });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (!user.otp || user.otp !== otp || new Date() > user.otpExpires) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Error verifying OTP', details: error.message });
  }
});

// User Signup route
router.post('/user-signup', async (req, res) => {
  const { username, email, password, phone, role, otp } = req.body;

  if (!username || !email || !password || !phone || !role || !otp) {
    return res.status(400).json({ message: 'All fields are required (username, email, password, phone, role, otp)' });
  }

  if (role !== 'User') {
    return res.status(400).json({ message: 'Invalid role for this endpoint' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    const user = await RegularUser.findOne({ email, phone, role });
    if (!user) {
      return res.status(400).json({ message: 'User not found for OTP verification' });
    }

    if (!user.otp || user.otp !== otp || new Date() > user.otpExpires) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const existingUser = await RegularUser.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.username = username;
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpires = null;

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    user.token = token;
    await user.save();

    res.status(201).json({ message: 'Signup successful', token });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Error during signup', details: error.message });
  }
});

// User Login route
router.post('/user-login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await RegularUser.findOne({ email, role: 'User' });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or role' });
    }

    if (!user.password) {
      return res.status(400).json({ message: 'User not fully registered. Please complete signup.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    user.token = token;
    await user.save();

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', details: error.message });
  }
});

// Get User Profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await RegularUser.findById(req.user.id).select('username');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Error fetching profile', details: error.message });
  }
});

// Search Buses with Available Seats
router.get('/search-buses', async (req, res) => {
  const { fromAddress, toAddress, travelDate } = req.query;

  if (!fromAddress || !toAddress || !travelDate) {
    return res.status(400).json({ message: 'Source, destination, and travel date are required' });
  }

  try {
    const travelDateObj = new Date(travelDate);
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes

    // Fetch buses matching the route
    let buses = await Bus.find({
      fromAddress: { $regex: fromAddress, $options: 'i' },
      toAddress: { $regex: toAddress, $options: 'i' },
    }).lean();

    // Remove duplicates by creating a unique key based on busNumber, fromAddress, toAddress, and departureTime
    const uniqueBusesMap = new Map();
    buses.forEach((bus) => {
      const key = `${bus.busNumber}-${bus.fromAddress}-${bus.toAddress}-${bus.departureTime}`;
      if (!uniqueBusesMap.has(key)) {
        uniqueBusesMap.set(key, bus);
      }
    });
    buses = Array.from(uniqueBusesMap.values());

    // Filter out buses whose departure time has passed on the travel date
    buses = buses.filter((bus) => {
      const [depHours, depMinutes] = bus.departureTime.split(':').map(Number);
      const departureTime = depHours * 60 + depMinutes; // Departure time in minutes

      if (
        travelDateObj.toDateString() === now.toDateString() &&
        departureTime < currentTime
      ) {
        return false; // Exclude this bus
      }
      return true; // Include this bus
    });

    // Calculate available seats for each bus on the travel date
    const busesWithAvailability = await Promise.all(
      buses.map(async (bus) => {
        const [arrHours, arrMinutes] = bus.arrivalTime.split(':').map(Number);
        const arrivalTime = arrHours * 60 + arrMinutes; // Arrival time in minutes

        // Fetch bookings for this bus on the travel date
        const bookedSeats = await Booking.find({
          busId: bus._id,
          travelDate: travelDateObj,
          status: { $in: ['Confirmed'] }, // Only consider 'Confirmed' bookings
        }).select('seatsBooked');

        let bookedSeatNumbers = bookedSeats.flatMap((booking) =>
          booking.seatsBooked.map((seat) => seat.seatNumber)
        );

        // If the travel date is today, check if the journey has been completed
        if (travelDateObj.toDateString() === now.toDateString()) {
          if (currentTime > arrivalTime) {
            // Journey is completed for today, so seats should be available
            bookedSeatNumbers = [];
          }
        } else if (travelDateObj < now) {
          // If the travel date is in the past, seats should be available
          bookedSeatNumbers = [];
        }

        const availableSeats = bus.totalSeats - bookedSeatNumbers.length;
        return { ...bus, availableSeats, travelDate };
      })
    );

    res.status(200).json(busesWithAvailability);
  } catch (error) {
    console.error('Search buses error:', error);
    res.status(500).json({ message: 'Error searching buses', details: error.message });
  }
});

// Check Seat Availability
router.get('/check-seat-availability', authenticateToken, async (req, res) => {
  const { busId, travelDate, seats } = req.query;

  console.log('Received in /check-seat-availability:', { busId, travelDate, seats });

  if (!busId) {
    return res.status(400).json({ message: 'Bus ID is required' });
  }
  if (!travelDate) {
    return res.status(400).json({ message: 'Travel date is required' });
  }
  if (!seats) {
    return res.status(400).json({ message: 'Seats are required' });
  }

  try {
    const seatNumbers = seats.split(',').map(Number);
    if (seatNumbers.some(isNaN)) {
      return res.status(400).json({ message: 'Invalid seat numbers format' });
    }

    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    const travelDateObj = new Date(travelDate);
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes

    // Parse the bus's arrival time
    const [arrHours, arrMinutes] = bus.arrivalTime.split(':').map(Number);
    const arrivalTime = arrHours * 60 + arrMinutes; // Arrival time in minutes

    // Fetch existing bookings for the bus on the specified travel date
    const existingBookings = await Booking.find({
      busId,
      travelDate: travelDateObj,
      status: { $in: ['Confirmed'] }, // Only consider 'Confirmed' bookings
    }).select('seatsBooked');

    // Get booked seat numbers
    let bookedSeatNumbers = existingBookings.flatMap(booking =>
      booking.seatsBooked.map(seat => seat.seatNumber)
    );

    // If the travel date is today, check if the journey has been completed
    if (travelDateObj.toDateString() === now.toDateString()) {
      if (currentTime > arrivalTime) {
        // Journey is completed for today, so seats should be available
        bookedSeatNumbers = [];
      }
    } else if (travelDateObj < now) {
      // If the travel date is in the past, seats should be available
      bookedSeatNumbers = [];
    }

    const isAvailable = seatNumbers.every(seat => !bookedSeatNumbers.includes(seat));
    res.status(200).json({ available: isAvailable, bookedSeats: bookedSeatNumbers });
  } catch (error) {
    console.error('Seat availability check error:', error);
    res.status(500).json({ message: 'Error checking seat availability', details: error.message });
  }
});

// Book Seats with Enhanced Notifications
router.post('/book-seats', authenticateToken, async (req, res) => {
  const { busId, travelDate, seatsBooked, userDetails } = req.body;
  const userId = req.user.id;

  if (!busId || !travelDate || !seatsBooked || !userDetails) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const { passengers } = userDetails;
  if (!passengers || !Array.isArray(passengers)) {
    return res.status(400).json({ message: 'Passengers array is required' });
  }

  if (passengers.length < 1 || passengers.length > 3) {
    return res.status(400).json({ message: 'Must include 1 to 3 passengers' });
  }

  if (
    passengers.some(
      (p) =>
        !p.name ||
        !p.age ||
        !['Male', 'Female', 'Other'].includes(p.gender) ||
        !/^\d{10}$/.test(p.phone) ||
        !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(p.email) ||
        !/^\d{10}$/.test(p.parentPhone) ||
        p.age < 1
    )
  ) {
    return res.status(400).json({ message: 'Invalid passenger details' });
  }

  if (!Array.isArray(seatsBooked) || seatsBooked.length === 0) {
    return res.status(400).json({ message: 'Seats booked must be a non-empty array' });
  }
  const seatNumbers = seatsBooked.map((seat) => seat.seatNumber);
  if (seatNumbers.some((num) => num < 1 || num > 50)) {
    return res.status(400).json({ message: 'Seat numbers must be between 1 and 50' });
  }
  if (new Set(seatNumbers).size !== seatNumbers.length) {
    return res.status(400).json({ message: 'Duplicate seat numbers are not allowed' });
  }

  const totalPassengers = passengers.length;
  if (seatNumbers.length !== totalPassengers) {
    return res.status(400).json({ message: `Please select ${totalPassengers} seats for all passengers` });
  }

  try {
    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    const existingBookings = await Booking.find({
      busId,
      travelDate: new Date(travelDate),
      status: { $ne: 'Cancelled' },
    }).select('seatsBooked');
    const bookedSeatNumbers = existingBookings.flatMap((booking) =>
      booking.seatsBooked.map((seat) => seat.seatNumber)
    );
    const unavailableSeats = seatNumbers.filter((seat) => bookedSeatNumbers.includes(seat));
    if (unavailableSeats.length > 0) {
      return res.status(400).json({ message: 'Some seats are already booked', unavailableSeats });
    }

    const totalFare = seatNumbers.length * bus.fare;

    const admin = await User.findById(bus.adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Simulate a transaction ID for test mode
    const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const booking = new Booking({
      userId,
      busId,
      adminId: bus.adminId,
      travelDate: new Date(travelDate),
      seatsBooked: seatNumbers.map((seatNumber) => ({ seatNumber })),
      totalFare,
      userDetails: {
        passengers,
      },
      transactionId, // Add transaction ID to booking
    });

    await booking.save();

    const firstPassenger = passengers[0];
    const seats = seatNumbers.join(', ');

    // Enhanced email for booking confirmation
    await transporter.sendMail({
      from: EMAIL_USER,
      to: firstPassenger.email,
      subject: '🎉 Booking Confirmation - Your Journey Awaits!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #28a745; text-align: center;">Booking Confirmed, ${firstPassenger.name}!</h2>
          <p style="font-size: 16px; color: #333;">Thank you for booking with ${bus.agencyName}! Your journey details are as follows:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e0e0e0;">Booking ID:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${booking._id}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e0e0e0;">Transaction ID:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${transactionId}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e0e0e0;">Bus:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${bus.agencyName} (${bus.busNumber}) ${bus.isAC ? '(AC)' : '(Non-AC)'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e0e0e0;">Route:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${bus.fromAddress} to ${bus.toAddress}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e0e0e0;">Travel Date:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${new Date(booking.travelDate).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e0e0e0;">Departure:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${bus.departureTime}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e0e0e0;">Arrival:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${bus.arrivalTime}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e0e0e0;">Seats:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${seats}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e0e0e0;">Total Fare:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">₹${booking.totalFare}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e0e0e0;">Admin Contact:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${admin.adminPhone}</td>
            </tr>
          </table>
          <p style="font-size: 14px; color: #666;">Please arrive at the boarding point 15 minutes before departure. For any assistance, feel free to contact us at ${admin.adminPhone}.</p>
          <p style="font-size: 16px; color: #333; text-align: center;">We wish you a safe and pleasant journey!</p>
          <footer style="margin-top: 20px; text-align: center; font-size: 12px; color: #999;">
            <p>&copy; ${new Date().getFullYear()} ${bus.agencyName}. All rights reserved.</p>
          </footer>
        </div>
      `,
    });

    // Enhanced WhatsApp message for passenger
    try {
      await twilioClient.messages.create({
        body: `🎉 Booking Confirmed, ${firstPassenger.name}! 🎉\n\nYour journey with ${bus.agencyName} is all set:\n- Booking ID: ${booking._id}\n- Transaction ID: ${transactionId}\n- Bus: ${bus.busNumber} ${bus.isAC ? '(AC)' : '(Non-AC)'}\n- Route: ${bus.fromAddress} to ${bus.toAddress}\n- Date: ${new Date(booking.travelDate).toLocaleDateString()}\n- Departure: ${bus.departureTime}\n- Arrival: ${bus.arrivalTime}\n- Seats: ${seats}\n- Total Fare: ₹${booking.totalFare}\n- Admin Contact: ${admin.adminPhone}\n\nPlease arrive 15 mins early. Safe travels! 🚍`,
        from: `whatsapp:${TWILIO_PHONE_NUMBER}`,
        to: `whatsapp:+91${firstPassenger.phone}`,
      });
      console.log(`WhatsApp sent to passenger: +91${firstPassenger.phone}`);
    } catch (twilioError) {
      console.error('Twilio error for passenger:', twilioError);
    }

    // Enhanced WhatsApp message for parent
    try {
      await twilioClient.messages.create({
        body: `Dear Parent, ${firstPassenger.name}'s booking is confirmed with ${bus.agencyName}:\n- Booking ID: ${booking._id}\n- Transaction ID: ${transactionId}\n- Bus: ${bus.busNumber} ${bus.isAC ? '(AC)' : '(Non-AC)'}\n- Route: ${bus.fromAddress} to ${bus.toAddress}\n- Date: ${new Date(booking.travelDate).toLocaleDateString()}\n- Departure: ${bus.departureTime}\n- Arrival: ${bus.arrivalTime}\n- Seats: ${seats}\n- Total Fare: ₹${booking.totalFare}\n- Admin Contact: ${admin.adminPhone}\n\nFor any queries, please contact the admin. Safe journey! 🚍`,
        from: `whatsapp:${TWILIO_PHONE_NUMBER}`,
        to: `whatsapp:+91${firstPassenger.parentPhone}`,
      });
      console.log(`WhatsApp sent to parent: +91${firstPassenger.parentPhone}`);
    } catch (twilioError) {
      console.error('Twilio error for parent:', twilioError);
    }

    res.status(201).json({ message: 'Booking successful', booking, transactionId });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ message: 'Error booking seats', details: error.message });
  }
});

// Get Booking History
router.get('/bookings', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const bookings = await Booking.find({ userId }).populate('busId', 'agencyName busNumber fromAddress toAddress departureTime arrivalTime isAC');
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Error fetching bookings', details: error.message });
  }
});

// Cancel Booking
router.put('/cancel-booking/:bookingId', authenticateToken, async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user.id;

  try {
    const booking = await Booking.findById(bookingId).populate('busId', 'agencyName busNumber fromAddress toAddress departureTime');
    if (!booking || booking.userId.toString() !== userId) {
      return res.status(404).json({ message: 'Booking not found or unauthorized' });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ message: 'Booking already cancelled' });
    }

    if (booking.status !== 'Confirmed') {
      return res.status(400).json({ message: 'Only confirmed bookings can be cancelled' });
    }

    booking.status = 'Cancelled';
    await booking.save();

    const seats = booking.seatsBooked.map(s => s.seatNumber).join(', ');
    const firstPassenger = booking.userDetails.passengers[0];

    // Enhanced cancellation email
    await transporter.sendMail({
      from: EMAIL_USER,
      to: firstPassenger.email,
      subject: '🚫 Booking Cancellation Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #dc3545; text-align: center;">Booking Cancelled, ${firstPassenger.name}</h2>
          <p style="font-size: 16px; color: #333;">We’re sorry to see you go. Your booking with ${booking.busId.agencyName} has been cancelled as per your request.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e0e0e0;">Booking ID:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${booking._id}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e0e0e0;">Transaction ID:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${booking.transactionId || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e0e0e0;">Bus:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${booking.busId.agencyName} (${booking.busId.busNumber}) ${booking.busId.isAC ? '(AC)' : '(Non-AC)'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e0e0e0;">Route:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${booking.busId.fromAddress} to ${booking.busId.toAddress}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e0e0e0;">Travel Date:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${new Date(booking.travelDate).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e0e0e0;">Seats:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${seats}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e0e0e0;">Total Fare:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">₹${booking.totalFare}</td>
            </tr>
          </table>
          <p style="font-size: 14px; color: #666;">If you have any questions or need assistance, please contact us at ${booking.busId.agencyName} support.</p>
          <p style="font-size: 16px; color: #333; text-align: center;">We hope to serve you again soon!</p>
          <footer style="margin-top: 20px; text-align: center; font-size: 12px; color: #999;">
            <p>&copy; ${new Date().getFullYear()} ${booking.busId.agencyName}. All rights reserved.</p>
          </footer>
        </div>
      `,
    });

    // Enhanced WhatsApp cancellation message for passenger
    try {
      await twilioClient.messages.create({
        body: `🚫 Booking Cancelled, ${firstPassenger.name}\n\nYour booking with ${booking.busId.agencyName} has been cancelled:\n- Booking ID: ${booking._id}\n- Transaction ID: ${booking.transactionId || 'N/A'}\n- Bus: ${booking.busId.busNumber} ${booking.busId.isAC ? '(AC)' : '(Non-AC)'}\n- Route: ${booking.busId.fromAddress} to ${booking.busId.toAddress}\n- Date: ${new Date(booking.travelDate).toLocaleDateString()}\n- Seats: ${seats}\n- Total Fare: ₹${booking.totalFare}\n\nWe hope to serve you again!`,
        from: `whatsapp:${TWILIO_PHONE_NUMBER}`,
        to: `whatsapp:+91${firstPassenger.phone}`,
      });
      console.log(`WhatsApp sent to passenger: +91${firstPassenger.phone}`);
    } catch (twilioError) {
      console.error('Twilio error for passenger:', twilioError);
    }

    // Enhanced WhatsApp cancellation message for parent
    try {
      await twilioClient.messages.create({
        body: `Dear Parent, ${firstPassenger.name}'s booking with ${booking.busId.agencyName} has been cancelled:\n- Booking ID: ${booking._id}\n- Transaction ID: ${booking.transactionId || 'N/A'}\n- Bus: ${booking.busId.busNumber} ${booking.busId.isAC ? '(AC)' : '(Non-AC)'}\n- Route: ${booking.busId.fromAddress} to ${booking.busId.toAddress}\n- Date: ${new Date(booking.travelDate).toLocaleDateString()}\n- Seats: ${seats}\n- Total Fare: ₹${booking.totalFare}\n\nPlease contact us if you need assistance.`,
        from: `whatsapp:${TWILIO_PHONE_NUMBER}`,
        to: `whatsapp:+91${firstPassenger.parentPhone}`,
      });
      console.log(`WhatsApp sent to parent: +91${firstPassenger.parentPhone}`);
    } catch (twilioError) {
      console.error('Twilio error for parent:', twilioError);
    }

    res.status(200).json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Error cancelling booking', details: error.message });
  }
});
// Chatbot: Get Travel Tips
router.get('/chatbot/tips', authenticateToken, async (req, res) => {
  try {
    // Use Gemini API to generate travel tips
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' + process.env.GEMINI_API_KEY,
      {
        contents: [
          {
            parts: [
              {
                text: 'Provide 5 concise travel tips for a bus journey.',
              },
            ],
          },
        ],
      }
    );

    const tips = response.data.candidates[0].content.parts[0].text;
    res.status(200).json({ message: 'Travel tips fetched successfully', tips });
  } catch (error) {
    console.error('Chatbot tips error:', error);
    res.status(500).json({ message: 'Error fetching travel tips', details: error.message });
  }
});

// Chatbot: Get User Billing (Bookings)
router.get('/chatbot/billings', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const bookings = await Booking.find({ userId })
      .populate('busId', 'agencyName busNumber fromAddress toAddress departureTime arrivalTime isAC')
      .lean();

    if (bookings.length === 0) {
      return res.status(200).json({ message: 'No bookings found for this user.' });
    }

    const billingDetails = bookings.map((booking) => ({
      bookingId: booking._id,
      bus: `${booking.busId.agencyName} (${booking.busId.busNumber}) ${booking.busId.isAC ? '(AC)' : '(Non-AC)'}`,
      route: `${booking.busId.fromAddress} to ${booking.busId.toAddress}`,
      travelDate: new Date(booking.travelDate).toLocaleDateString(),
      seats: booking.seatsBooked.map((s) => s.seatNumber).join(', '),
      totalFare: `₹${booking.totalFare}`,
      status: booking.status,
    }));

    res.status(200).json({ message: 'Billing details fetched successfully', billings: billingDetails });
  } catch (error) {
    console.error('Chatbot billings error:', error);
    res.status(500).json({ message: 'Error fetching billing details', details: error.message });
  }
});

// Chatbot: Interactive Chat with Gemini API
router.post('/chatbot/interact', authenticateToken, async (req, res) => {
  const { message } = req.body;
  const userId = req.user.id;

  if (!message) {
    return res.status(400).json({ message: 'Message is required' });
  }

  try {
    // Fetch user bookings to provide context to the chatbot
    const bookings = await Booking.find({ userId })
      .populate('busId', 'agencyName busNumber fromAddress toAddress departureTime arrivalTime isAC')
      .lean();

    const bookingContext = bookings.length > 0
      ? bookings.map((booking) => `Booking ID: ${booking._id}, Bus: ${booking.busId.agencyName} (${booking.busId.busNumber}), Route: ${booking.busId.fromAddress} to ${booking.busId.toAddress}, Date: ${new Date(booking.travelDate).toLocaleDateString()}, Status: ${booking.status}`).join('\n')
      : 'No bookings found for this user.';

    // Construct prompt for Gemini API
    const prompt = `You are a helpful travel assistant for a bus booking platform. The user has the following bookings:\n${bookingContext}\n\nUser message: ${message}\n\nProvide a helpful and concise response. If the user asks about their bookings, provide details. If they ask for tips, provide travel tips. For general queries, respond appropriately.`;

    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' + process.env.GEMINI_API_KEY,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }
    );

    const reply = response.data.candidates[0].content.parts[0].text;
    res.status(200).json({ message: 'Chatbot response generated', reply });
  } catch (error) {
    console.error('Chatbot interaction error:', error);
    res.status(500).json({ message: 'Error interacting with chatbot', details: error.message });
  }
});
module.exports = router;