// // const express = require('express');
// // const router = express.Router();
// // const RegularUser = require('../models/Users');
// // const Bus = require('../models/Bus');
// // const Booking = require('../models/Booking');
// // const User = require('../models/Admin'); // Import Admin model to get admin phone
// // const bcrypt = require('bcryptjs');
// // const jwt = require('jsonwebtoken');
// // const nodemailer = require('nodemailer');
// // const authenticateToken = require('../middleware/auth');

// // // Environment variables
// // const { JWT_SECRET, EMAIL_USER, EMAIL_PASS } = process.env;

// // // Nodemailer transporter for email OTP
// // const transporter = nodemailer.createTransport({
// //   service: 'gmail',
// //   auth: {
// //     user: EMAIL_USER,
// //     pass: EMAIL_PASS,
// //   },
// // });

// // // Generate OTP
// // const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// // // Send OTP via email
// // router.post('/send-otp', async (req, res) => {
// //   const { email, phone, role } = req.body;

// //   if (!email || !phone || !role) {
// //     return res.status(400).json({ message: 'Email, phone, and role are required' });
// //   }

// //   if (role !== 'User') {
// //     return res.status(400).json({ message: 'Invalid role for this endpoint' });
// //   }

// //   try {
// //     let user = await RegularUser.findOne({ email, phone, role });
// //     if (!user) {
// //       // Create a new user with minimal required fields
// //       user = new RegularUser({ email, phone, role });
// //       await user.save();
// //     }

// //     const otp = generateOTP();
// //     const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

// //     user.otp = otp;
// //     user.otpExpires = otpExpires;
// //     await user.save();

// //     await transporter.sendMail({
// //       from: EMAIL_USER,
// //       to: email,
// //       subject: 'Your OTP for User Verification',
// //       text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
// //     });

// //     res.status(200).json({ message: `OTP sent to ${email}. Check your inbox.` });
// //   } catch (error) {
// //     console.error('OTP sending error:', error);
// //     res.status(500).json({ message: 'Error sending OTP' });
// //   }
// // });

// // // Verify OTP
// // router.post('/verify-otp', async (req, res) => {
// //   const { email, otp } = req.body;

// //   if (!email || !otp) {
// //     return res.status(400).json({ message: 'Email and OTP are required' });
// //   }

// //   try {
// //     const user = await RegularUser.findOne({ email, role: 'User' });
// //     if (!user) {
// //       return res.status(400).json({ message: 'User not found' });
// //     }

// //     if (!user.otp || user.otp !== otp || new Date() > user.otpExpires) {
// //       return res.status(400).json({ message: 'Invalid or expired OTP' });
// //     }

// //     res.status(200).json({ message: 'OTP verified successfully' });
// //   } catch (error) {
// //     console.error('OTP verification error:', error);
// //     res.status(500).json({ message: 'Error verifying OTP' });
// //   }
// // });

// // // User Signup route
// // router.post('/user-signup', async (req, res) => {
// //   const { username, email, password, phone, role, otp } = req.body;

// //   if (!username || !email || !password || !phone || !role || !otp) {
// //     return res.status(400).json({ message: 'All fields are required (username, email, password, phone, role, otp)' });
// //   }

// //   if (role !== 'User') {
// //     return res.status(400).json({ message: 'Invalid role for this endpoint' });
// //   }

// //   if (password.length < 6) {
// //     return res.status(400).json({ message: 'Password must be at least 6 characters long' });
// //   }

// //   try {
// //     const user = await RegularUser.findOne({ email, phone, role });
// //     if (!user) {
// //       return res.status(400).json({ message: 'User not found for OTP verification' });
// //     }

// //     if (!user.otp || user.otp !== otp || new Date() > user.otpExpires) {
// //       return res.status(400).json({ message: 'Invalid or expired OTP' });
// //     }

// //     const existingUser = await RegularUser.findOne({ username });
// //     if (existingUser) {
// //       return res.status(400).json({ message: 'Username already exists' });
// //     }

// //     const salt = await bcrypt.genSalt(10);
// //     const hashedPassword = await bcrypt.hash(password, salt);

// //     user.username = username;
// //     user.password = hashedPassword;
// //     user.otp = null;
// //     user.otpExpires = null;

// //     const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
// //     user.token = token;
// //     await user.save();

// //     res.status(201).json({ message: 'Signup successful', token });
// //   } catch (error) {
// //     console.error('Signup error:', error);
// //     res.status(500).json({ message: 'Error during signup' });
// //   }
// // });

// // // User Login route
// // router.post('/user-login', async (req, res) => {
// //   const { email, password } = req.body;

// //   if (!email || !password) {
// //     return res.status(400).json({ message: 'Email and password are required' });
// //   }

// //   try {
// //     const user = await RegularUser.findOne({ email, role: 'User' });
// //     if (!user) {
// //       return res.status(400).json({ message: 'Invalid email or role' });
// //     }

// //     if (!user.password) {
// //       return res.status(400).json({ message: 'User not fully registered. Please complete signup.' });
// //     }

// //     const isMatch = await bcrypt.compare(password, user.password);
// //     if (!isMatch) {
// //       return res.status(400).json({ message: 'Invalid password' });
// //     }

// //     const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
// //     user.token = token;
// //     await user.save();

// //     res.status(200).json({ message: 'Login successful', token });
// //   } catch (error) {
// //     console.error('Login error:', error);
// //     res.status(500).json({ message: 'Error logging in' });
// //   }
// // });

// // // Search Buses with Available Seats
// // router.get('/search-buses', async (req, res) => {
// //   const { fromAddress, toAddress, travelDate } = req.query;

// //   if (!fromAddress || !toAddress || !travelDate) {
// //     return res.status(400).json({ message: 'Source, destination, and travel date are required' });
// //   }

// //   try {
// //     const buses = await Bus.find({
// //       fromAddress: { $regex: fromAddress, $options: 'i' },
// //       toAddress: { $regex: toAddress, $options: 'i' },
// //     }).lean();

// //     const busesWithAvailability = await Promise.all(
// //       buses.map(async (bus) => {
// //         const bookedSeats = await Booking.find({
// //           busId: bus._id,
// //           travelDate: new Date(travelDate),
// //           status: { $ne: 'Cancelled' },
// //         }).select('seatsBooked');
// //         const bookedSeatNumbers = bookedSeats.flatMap(booking =>
// //           booking.seatsBooked.map(seat => seat.seatNumber)
// //         );
// //         const availableSeats = bus.seats.filter(seat => !bookedSeatNumbers.includes(seat.seatNumber)).length;
// //         return { ...bus, availableSeats };
// //       })
// //     );

// //     res.status(200).json(busesWithAvailability);
// //   } catch (error) {
// //     console.error('Search buses error:', error);
// //     res.status(500).json({ message: 'Error searching buses' });
// //   }
// // });

// // // Book Seats
// // router.post('/book-seats', authenticateToken, async (req, res) => {
// //   const { busId, travelDate, seatsBooked, userDetails } = req.body;
// //   const userId = req.user.id;

// //   if (!busId || !travelDate || !seatsBooked || !userDetails) {
// //     return res.status(400).json({ message: 'All fields are required' });
// //   }

// //   // Validate userDetails
// //   const { name, phone, email, gender, age, parentPhone, passengers } = userDetails;
// //   if (!name || !phone || !email || !gender || !age || !parentPhone || passengers.length < 2) {
// //     return res.status(400).json({ message: 'All user details are required, including at least 2 additional passengers' });
// //   }
// //   if (passengers.length > 3) {
// //     return res.status(400).json({ message: 'Maximum 3 additional passengers allowed' });
// //   }
// //   if (!['Male', 'Female', 'Other'].includes(gender)) {
// //     return res.status(400).json({ message: 'Invalid gender value' });
// //   }
// //   if (age < 1) {
// //     return res.status(400).json({ message: 'Age must be at least 1' });
// //   }
// //   if (!/^\d{10}$/.test(phone) || !/^\d{10}$/.test(parentPhone)) {
// //     return res.status(400).json({ message: 'Invalid phone number format' });
// //   }
// //   if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
// //     return res.status(400).json({ message: 'Invalid email format' });
// //   }
// //   if (passengers.some(p => !p.name || p.age < 1 || !['Male', 'Female', 'Other'].includes(p.gender))) {
// //     return res.status(400).json({ message: 'Invalid passenger details' });
// //   }

// //   try {
// //     const bus = await Bus.findById(busId);
// //     if (!bus) {
// //       return res.status(404).json({ message: 'Bus not found' });
// //     }

// //     // Check seat availability
// //     const existingBookings = await Booking.find({
// //       busId,
// //       travelDate: new Date(travelDate),
// //       status: { $ne: 'Cancelled' },
// //     }).select('seatsBooked');
// //     const bookedSeatNumbers = existingBookings.flatMap(booking =>
// //       booking.seatsBooked.map(seat => seat.seatNumber)
// //     );
// //     const unavailableSeats = seatsBooked.filter(seat => bookedSeatNumbers.includes(seat.seatNumber));
// //     if (unavailableSeats.length > 0) {
// //       return res.status(400).json({ message: 'Some seats are already booked', unavailableSeats });
// //     }

// //     // Validate number of seats matches total passengers (1 primary + passengers.length)
// //     const totalPassengers = 1 + passengers.length;
// //     if (seatsBooked.length !== totalPassengers) {
// //       return res.status(400).json({ message: `Please select ${totalPassengers} seats for all passengers` });
// //     }

// //     // Update seat status
// //     seatsBooked.forEach(seat => {
// //       const busSeat = bus.seats.find(s => s.seatNumber === seat.seatNumber);
// //       busSeat.isBooked = true;
// //     });
// //     await bus.save();

// //     // Calculate total fare
// //     const totalFare = seatsBooked.length * bus.fare;

// //     // Get admin's phone number
// //     const admin = await User.findById(bus.adminId);
// //     if (!admin) {
// //       return res.status(404).json({ message: 'Admin not found' });
// //     }

// //     // Create booking
// //     const booking = new Booking({
// //       userId,
// //       busId,
// //       adminId: bus.adminId,
// //       travelDate: new Date(travelDate),
// //       seatsBooked,
// //       totalFare,
// //       userDetails: {
// //         name,
// //         phone,
// //         email,
// //         gender,
// //         age: parseInt(age),
// //         parentPhone,
// //         passengers,
// //       },
// //     });

// //     await booking.save();

// //     // Send confirmation email to user with admin phone
// //     await transporter.sendMail({
// //       from: EMAIL_USER,
// //       to: email,
// //       subject: 'Booking Confirmation',
// //       text: `Dear ${name},\n\nYour booking has been confirmed!\n\nDetails:\nBus: ${bus.agencyName} (${bus.busNumber})\nRoute: ${bus.fromAddress} to ${bus.toAddress}\nDate: ${new Date(travelDate).toLocaleDateString()}\nSeats: ${seatsBooked.map(s => s.seatNumber).join(', ')}\nTotal Fare: ₹${totalFare}\nAdmin Contact: ${admin.adminPhone}\n\nThank you for booking with us!`,
// //     });

// //     res.status(201).json({ message: 'Booking successful', booking });
// //   } catch (error) {
// //     console.error('Booking error:', error);
// //     res.status(500).json({ message: 'Error booking seats' });
// //   }
// // });

// // // Get Booking History
// // router.get('/bookings', authenticateToken, async (req, res) => {
// //   const userId = req.user.id;

// //   try {
// //     const bookings = await Booking.find({ userId }).populate('busId', 'agencyName busNumber fromAddress toAddress departureTime arrivalTime isAC');
// //     res.status(200).json(bookings);
// //   } catch (error) {
// //     console.error('Get bookings error:', error);
// //     res.status(500).json({ message: 'Error fetching bookings' });
// //   }
// // });

// // // Cancel Booking
// // router.put('/cancel-booking/:bookingId', authenticateToken, async (req, res) => {
// //   const { bookingId } = req.params;
// //   const userId = req.user.id;

// //   try {
// //     const booking = await Booking.findById(bookingId);
// //     if (!booking || booking.userId.toString() !== userId) {
// //       return res.status(404).json({ message: 'Booking not found' });
// //     }

// //     if (booking.status === 'Cancelled') {
// //       return res.status(400).json({ message: 'Booking already cancelled' });
// //     }

// //     booking.status = 'Cancelled';
// //     await booking.save();

// //     // Free up seats
// //     const bus = await Bus.findById(booking.busId);
// //     booking.seatsBooked.forEach(seat => {
// //       const busSeat = bus.seats.find(s => s.seatNumber === seat.seatNumber);
// //       busSeat.isBooked = false;
// //     });
// //     await bus.save();

// //     res.status(200).json({ message: 'Booking cancelled successfully' });
// //   } catch (error) {
// //     console.error('Cancel booking error:', error);
// //     res.status(500).json({ message: 'Error cancelling booking' });
// //   }
// // });

// // module.exports = router;
// const express = require('express');
// const router = express.Router();
// const RegularUser = require('../models/Users');
// const Bus = require('../models/Bus');
// const Booking = require('../models/Booking');
// const User = require('../models/Admin');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const nodemailer = require('nodemailer');
// const authenticateToken = require('../middleware/auth');
// const twilio = require('twilio');

// // Environment variables
// const { JWT_SECRET, EMAIL_USER, EMAIL_PASS, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;

// // Nodemailer transporter for email OTP
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: EMAIL_USER,
//     pass: EMAIL_PASS,
//   },
// });

// // Twilio client for WhatsApp
// const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// // Generate OTP
// const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// // Send OTP via email
// router.post('/send-otp', async (req, res) => {
//   const { email, phone, role } = req.body;

//   if (!email || !phone || !role) {
//     return res.status(400).json({ message: 'Email, phone, and role are required' });
//   }

//   if (role !== 'User') {
//     return res.status(400).json({ message: 'Invalid role for this endpoint' });
//   }

//   try {
//     let user = await RegularUser.findOne({ email, phone, role });
//     if (!user) {
//       user = new RegularUser({ email, phone, role });
//       await user.save();
//     }

//     const otp = generateOTP();
//     const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

//     user.otp = otp;
//     user.otpExpires = otpExpires;
//     await user.save();

//     await transporter.sendMail({
//       from: EMAIL_USER,
//       to: email,
//       subject: 'Your OTP for User Verification',
//       text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
//     });

//     res.status(200).json({ message: `OTP sent to ${email}. Check your inbox.` });
//   } catch (error) {
//     console.error('OTP sending error:', error);
//     res.status(500).json({ message: 'Error sending OTP', details: error.message });
//   }
// });

// // Verify OTP
// router.post('/verify-otp', async (req, res) => {
//   const { email, otp } = req.body;

//   if (!email || !otp) {
//     return res.status(400).json({ message: 'Email and OTP are required' });
//   }

//   try {
//     const user = await RegularUser.findOne({ email, role: 'User' });
//     if (!user) {
//       return res.status(400).json({ message: 'User not found' });
//     }

//     if (!user.otp || user.otp !== otp || new Date() > user.otpExpires) {
//       return res.status(400).json({ message: 'Invalid or expired OTP' });
//     }

//     res.status(200).json({ message: 'OTP verified successfully' });
//   } catch (error) {
//     console.error('OTP verification error:', error);
//     res.status(500).json({ message: 'Error verifying OTP', details: error.message });
//   }
// });

// // User Signup route
// router.post('/user-signup', async (req, res) => {
//   const { username, email, password, phone, role, otp } = req.body;

//   if (!username || !email || !password || !phone || !role || !otp) {
//     return res.status(400).json({ message: 'All fields are required (username, email, password, phone, role, otp)' });
//   }

//   if (role !== 'User') {
//     return res.status(400).json({ message: 'Invalid role for this endpoint' });
//   }

//   if (password.length < 6) {
//     return res.status(400).json({ message: 'Password must be at least 6 characters long' });
//   }

//   try {
//     const user = await RegularUser.findOne({ email, phone, role });
//     if (!user) {
//       return res.status(400).json({ message: 'User not found for OTP verification' });
//     }

//     if (!user.otp || user.otp !== otp || new Date() > user.otpExpires) {
//       return res.status(400).json({ message: 'Invalid or expired OTP' });
//     }

//     const existingUser = await RegularUser.findOne({ username });
//     if (existingUser) {
//       return res.status(400).json({ message: 'Username already exists' });
//     }

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     user.username = username;
//     user.password = hashedPassword;
//     user.otp = null;
//     user.otpExpires = null;

//     const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
//     user.token = token;
//     await user.save();

//     res.status(201).json({ message: 'Signup successful', token });
//   } catch (error) {
//     console.error('Signup error:', error);
//     res.status(500).json({ message: 'Error during signup', details: error.message });
//   }
// });

// // User Login route
// router.post('/user-login', async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ message: 'Email and password are required' });
//   }

//   try {
//     const user = await RegularUser.findOne({ email, role: 'User' });
//     if (!user) {
//       return res.status(400).json({ message: 'Invalid email or role' });
//     }

//     if (!user.password) {
//       return res.status(400).json({ message: 'User not fully registered. Please complete signup.' });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: 'Invalid password' });
//     }

//     const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
//     user.token = token;
//     await user.save();

//     res.status(200).json({ message: 'Login successful', token });
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({ message: 'Error logging in', details: error.message });
//   }
// });

// // Search Buses with Available Seats
// router.get('/search-buses', async (req, res) => {
//   const { fromAddress, toAddress, travelDate } = req.query;

//   if (!fromAddress || !toAddress || !travelDate) {
//     return res.status(400).json({ message: 'Source, destination, and travel date are required' });
//   }

//   try {
//     const buses = await Bus.find({
//       fromAddress: { $regex: fromAddress, $options: 'i' },
//       toAddress: { $regex: toAddress, $options: 'i' },
//     }).lean();

//     const busesWithAvailability = await Promise.all(
//       buses.map(async (bus) => {
//         const bookedSeats = await Booking.find({
//           busId: bus._id,
//           travelDate: new Date(travelDate),
//           status: { $ne: 'Cancelled' },
//         }).select('seatsBooked');
//         const bookedSeatNumbers = bookedSeats.flatMap(booking =>
//           booking.seatsBooked.map(seat => seat.seatNumber)
//         );
//         const availableSeats = bus.seats.filter(seat => !bookedSeatNumbers.includes(seat.seatNumber)).length;
//         return { ...bus, availableSeats };
//       })
//     );

//     res.status(200).json(busesWithAvailability);
//   } catch (error) {
//     console.error('Search buses error:', error);
//     res.status(500).json({ message: 'Error searching buses', details: error.message });
//   }
// });

// // Book Seats
// router.post('/book-seats', authenticateToken, async (req, res) => {
//   const { busId, travelDate, seatsBooked, userDetails } = req.body;
//   const userId = req.user.id;

//   if (!busId || !travelDate || !seatsBooked || !userDetails) {
//     return res.status(400).json({ message: 'All fields are required' });
//   }

//   // Validate userDetails
//   const { name, phone, email, gender, age, parentPhone, passengers } = userDetails;
//   if (!name || !phone || !email || !gender || !age || !parentPhone || !passengers) {
//     return res.status(400).json({ message: 'All user details are required' });
//   }

//   // Validate passengers array (1 to 3 additional passengers, total 2 to 4 people including primary user)
//   if (passengers.length < 1 || passengers.length > 3) {
//     return res.status(400).json({ message: 'Must include 1 to 3 additional passengers' });
//   }

//   if (!['Male', 'Female', 'Other'].includes(gender)) {
//     return res.status(400).json({ message: 'Invalid gender value' });
//   }
//   if (age < 1) {
//     return res.status(400).json({ message: 'Age must be at least 1' });
//   }
//   if (!/^\d{10}$/.test(phone) || !/^\d{10}$/.test(parentPhone)) {
//     return res.status(400).json({ message: 'Invalid phone number format' });
//   }
//   if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
//     return res.status(400).json({ message: 'Invalid email format' });
//   }
//   if (passengers.some(p => !p.name || p.age < 1 || !['Male', 'Female', 'Other'].includes(p.gender))) {
//     return res.status(400).json({ message: 'Invalid passenger details' });
//   }

//   // Validate seatsBooked
//   if (!Array.isArray(seatsBooked) || seatsBooked.length === 0) {
//     return res.status(400).json({ message: 'Seats booked must be a non-empty array' });
//   }
//   const seatNumbers = seatsBooked.map(seat => seat.seatNumber);
//   if (seatNumbers.some(num => num < 1 || num > 50)) {
//     return res.status(400).json({ message: 'Seat numbers must be between 1 and 50' });
//   }
//   if (new Set(seatNumbers).size !== seatNumbers.length) {
//     return res.status(400).json({ message: 'Duplicate seat numbers are not allowed' });
//   }

//   // Validate number of seats matches total passengers (1 primary + passengers.length)
//   const totalPassengers = 1 + passengers.length;
//   if (seatNumbers.length !== totalPassengers) {
//     return res.status(400).json({ message: `Please select ${totalPassengers} seats for all passengers` });
//   }

//   try {
//     const bus = await Bus.findById(busId);
//     if (!bus) {
//       return res.status(404).json({ message: 'Bus not found' });
//     }

//     // Check seat availability
//     const existingBookings = await Booking.find({
//       busId,
//       travelDate: new Date(travelDate),
//       status: { $ne: 'Cancelled' },
//     }).select('seatsBooked');
//     const bookedSeatNumbers = existingBookings.flatMap(booking =>
//       booking.seatsBooked.map(seat => seat.seatNumber)
//     );
//     const unavailableSeats = seatNumbers.filter(seat => bookedSeatNumbers.includes(seat));
//     if (unavailableSeats.length > 0) {
//       return res.status(400).json({ message: 'Some seats are already booked', unavailableSeats });
//     }

//     // Update seat status
//     seatNumbers.forEach(seat => {
//       const busSeat = bus.seats.find(s => s.seatNumber === seat);
//       if (busSeat) busSeat.isBooked = true;
//     });
//     await bus.save();

//     // Calculate total fare
//     const totalFare = seatNumbers.length * bus.fare;

//     // Get admin's phone number
//     const admin = await User.findById(bus.adminId);
//     if (!admin) {
//       return res.status(404).json({ message: 'Admin not found' });
//     }

//     // Create booking
//     const booking = new Booking({
//       userId,
//       busId,
//       adminId: bus.adminId,
//       travelDate: new Date(travelDate),
//       seatsBooked: seatNumbers.map(seatNumber => ({ seatNumber })),
//       totalFare,
//       userDetails: {
//         name,
//         phone,
//         email,
//         gender,
//         age: parseInt(age),
//         parentPhone,
//         passengers,
//       },
//     });

//     await booking.save();

//     // Send confirmation email to user with admin phone
//     await transporter.sendMail({
//       from: EMAIL_USER,
//       to: email,
//       subject: 'Booking Confirmation',
//       text: `Dear ${name},\n\nYour booking has been confirmed!\n\nDetails:\nBus: ${bus.agencyName} (${bus.busNumber})\nRoute: ${bus.fromAddress} to ${bus.toAddress}\nDate: ${new Date(travelDate).toLocaleDateString()}\nDeparture: ${bus.departureTime}\nArrival: ${bus.arrivalTime}\nSeats: ${seatNumbers.join(', ')}\nTotal Fare: ₹${totalFare}\nAdmin Contact: ${admin.adminPhone}\n\nThank you for booking with us!\n\nBest,\n${bus.agencyName}`,
//     });

//     // Send WhatsApp to passenger
//     try {
//       await twilioClient.messages.create({
//         body: `Dear ${name}, your booking is confirmed! Details: Bus ${bus.busNumber}, Route ${bus.fromAddress} to ${bus.toAddress}, Date ${new Date(travelDate).toLocaleDateString()}, Departure ${bus.departureTime}, Arrival ${bus.arrivalTime}, Seats ${seatNumbers.join(', ')}, Total Fare ₹${totalFare}. Admin Contact: ${admin.adminPhone}.`,
//         from: `whatsapp:${TWILIO_PHONE_NUMBER}`,
//         to: `whatsapp:+91${phone}`,
//       });
//       console.log(`WhatsApp sent to passenger: +91${phone}`);
//     } catch (twilioError) {
//       console.error('Twilio error for passenger:', twilioError);
//     }

//     // Send WhatsApp to parent
//     try {
//       await twilioClient.messages.create({
//         body: `Dear Parent, ${name} has booked a bus ticket. Details: Bus ${bus.busNumber}, Route ${bus.fromAddress} to ${bus.toAddress}, Date ${new Date(travelDate).toLocaleDateString()}, Departure ${bus.departureTime}, Arrival ${bus.arrivalTime}, Seats ${seatNumbers.join(', ')}, Total Fare ₹${totalFare}. Admin Contact: ${admin.adminPhone}.`,
//         from: `whatsapp:${TWILIO_PHONE_NUMBER}`,
//         to: `whatsapp:+91${parentPhone}`,
//       });
//       console.log(`WhatsApp sent to parent: +91${parentPhone}`);
//     } catch (twilioError) {
//       console.error('Twilio error for parent:', twilioError);
//     }

//     res.status(201).json({ message: 'Booking successful', booking });
//   } catch (error) {
//     console.error('Booking error:', error);
//     res.status(500).json({ message: 'Error booking seats', details: error.message });
//   }
// });

// // Get Booking History
// router.get('/bookings', authenticateToken, async (req, res) => {
//   const userId = req.user.id;

//   try {
//     const bookings = await Booking.find({ userId }).populate('busId', 'agencyName busNumber fromAddress toAddress departureTime arrivalTime isAC');
//     res.status(200).json(bookings);
//   } catch (error) {
//     console.error('Get bookings error:', error);
//     res.status(500).json({ message: 'Error fetching bookings', details: error.message });
//   }
// });

// // Cancel Booking
// router.put('/cancel-booking/:bookingId', authenticateToken, async (req, res) => {
//   const { bookingId } = req.params;
//   const userId = req.user.id;

//   try {
//     const booking = await Booking.findById(bookingId).populate('busId', 'agencyName busNumber fromAddress toAddress departureTime');
//     if (!booking || booking.userId.toString() !== userId) {
//       return res.status(404).json({ message: 'Booking not found or unauthorized' });
//     }

//     if (booking.status === 'Cancelled') {
//       return res.status(400).json({ message: 'Booking already cancelled' });
//     }

//     if (booking.status !== 'Confirmed') {
//       return res.status(400).json({ message: 'Only confirmed bookings can be cancelled' });
//     }

//     booking.status = 'Cancelled';
//     await booking.save();

//     // Free up seats
//     const bus = await Bus.findById(booking.busId);
//     booking.seatsBooked.forEach(seat => {
//       const busSeat = bus.seats.find(s => s.seatNumber === seat.seatNumber);
//       if (busSeat) busSeat.isBooked = false;
//     });
//     await bus.save();

//     const seats = booking.seatsBooked.map(s => s.seatNumber).join(', ');

//     // Send cancellation email to user
//     await transporter.sendMail({
//       from: EMAIL_USER,
//       to: booking.userDetails.email,
//       subject: 'Booking Cancellation Confirmation',
//       text: `Dear ${booking.userDetails.name},\n\nYour booking has been cancelled.\n\nDetails:\nBus: ${booking.busId.agencyName} (${booking.busId.busNumber})\nRoute: ${booking.busId.fromAddress} to ${booking.busId.toAddress}\nDate: ${new Date(booking.travelDate).toLocaleDateString()}\nSeats: ${seats}\nTotal Fare: ₹${booking.totalFare}\n\nIf you have any questions, please contact us.\n\nBest,\n${booking.busId.agencyName}`,
//     });

//     // Send WhatsApp to passenger
//     try {
//       await twilioClient.messages.create({
//         body: `Dear ${booking.userDetails.name}, your booking has been cancelled. Details: Bus ${booking.busId.busNumber}, Route ${booking.busId.fromAddress} to ${booking.busId.toAddress}, Date ${new Date(booking.travelDate).toLocaleDateString()}, Seats ${seats}, Total Fare ₹${booking.totalFare}.`,
//         from: `whatsapp:${TWILIO_PHONE_NUMBER}`,
//         to: `whatsapp:+91${booking.userDetails.phone}`,
//       });
//       console.log(`WhatsApp sent to passenger: +91${booking.userDetails.phone}`);
//     } catch (twilioError) {
//       console.error('Twilio error for passenger:', twilioError);
//     }

//     // Send WhatsApp to parent
//     try {
//       await twilioClient.messages.create({
//         body: `Dear Parent, ${booking.userDetails.name}'s booking has been cancelled. Details: Bus ${booking.busId.busNumber}, Route ${booking.busId.fromAddress} to ${booking.busId.toAddress}, Date ${new Date(booking.travelDate).toLocaleDateString()}, Seats ${seats}, Total Fare ₹${booking.totalFare}.`,
//         from: `whatsapp:${TWILIO_PHONE_NUMBER}`,
//         to: `whatsapp:+91${booking.userDetails.parentPhone}`,
//       });
//       console.log(`WhatsApp sent to parent: +91${booking.userDetails.parentPhone}`);
//     } catch (twilioError) {
//       console.error('Twilio error for parent:', twilioError);
//     }

//     res.status(200).json({ message: 'Booking cancelled successfully' });
//   } catch (error) {
//     console.error('Cancel booking error:', error);
//     res.status(500).json({ message: 'Error cancelling booking', details: error.message });
//   }
// });

// module.exports = router;
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

      // If travel date is today, check if departure time has passed
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
        const bookedSeats = await Booking.find({
          busId: bus._id,
          travelDate: new Date(travelDate),
          status: { $ne: 'Cancelled' },
        }).select('seatsBooked');
        const bookedSeatNumbers = bookedSeats.flatMap((booking) =>
          booking.seatsBooked.map((seat) => seat.seatNumber)
        );
        const availableSeats = bus.seats.filter(
          (seat) => !bookedSeatNumbers.includes(seat.seatNumber)
        ).length;
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

  // Log incoming query parameters for debugging
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

    const existingBookings = await Booking.find({
      busId,
      travelDate: new Date(travelDate),
      status: { $ne: 'Cancelled' },
    }).select('seatsBooked');

    const bookedSeatNumbers = existingBookings.flatMap(booking =>
      booking.seatsBooked.map(seat => seat.seatNumber)
    );

    const isAvailable = seatNumbers.every(seat => !bookedSeatNumbers.includes(seat));
    res.status(200).json({ available: isAvailable });
  } catch (error) {
    console.error('Seat availability check error:', error);
    res.status(500).json({ message: 'Error checking seat availability', details: error.message });
  }
});

// Book Seats
// ... (previous imports and middleware remain the same)

router.post('/book-seats', authenticateToken, async (req, res) => {
  const { busId, travelDate, seatsBooked, userDetails } = req.body;
  const userId = req.user.id;

  if (!busId || !travelDate || !seatsBooked || !userDetails) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Validate userDetails
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

  // Validate seatsBooked
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

  // Validate number of seats matches total passengers
  const totalPassengers = passengers.length;
  if (seatNumbers.length !== totalPassengers) {
    return res.status(400).json({ message: `Please select ${totalPassengers} seats for all passengers` });
  }

  try {
    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    // Check seat availability (real-time validation)
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

    // Update seat status
    seatNumbers.forEach((seat) => {
      const busSeat = bus.seats.find((s) => s.seatNumber === seat);
      if (busSeat) busSeat.isBooked = true;
    });
    await bus.save();

    // Calculate total fare
    const totalFare = seatNumbers.length * bus.fare;

    // Get admin's phone number
    const admin = await User.findById(bus.adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Create booking
    const booking = new Booking({
      userId,
      busId,
      adminId: bus.adminId,
      travelDate: new Date(travelDate),
      seatsBooked: seatNumbers.map((seatNumber) => ({ seatNumber })),
      totalFare,
      userDetails: {
        passengers, // Use the passengers array directly
      },
    });

    await booking.save();

    // Use the first passenger's details for notifications
    const firstPassenger = passengers[0];

    // Send confirmation email to the first passenger
    await transporter.sendMail({
      from: EMAIL_USER,
      to: firstPassenger.email,
      subject: 'Booking Confirmation',
      text: `Dear ${firstPassenger.name},\n\nYour booking has been confirmed!\n\nDetails:\nBus: ${bus.agencyName} (${bus.busNumber})\nRoute: ${bus.fromAddress} to ${bus.toAddress}\nDate: ${new Date(travelDate).toLocaleDateString()}\nDeparture: ${bus.departureTime}\nArrival: ${bus.arrivalTime}\nSeats: ${seatNumbers.join(', ')}\nTotal Fare: ₹${totalFare}\nAdmin Contact: ${admin.adminPhone}\n\nThank you for booking with us!\n\nBest,\n${bus.agencyName}`,
    });

    // Send WhatsApp to the first passenger
    try {
      await twilioClient.messages.create({
        body: `Dear ${firstPassenger.name}, your booking is confirmed! Details: Bus ${bus.busNumber}, Route ${bus.fromAddress} to ${bus.toAddress}, Date ${new Date(travelDate).toLocaleDateString()}, Departure ${bus.departureTime}, Arrival ${bus.arrivalTime}, Seats ${seatNumbers.join(', ')}, Total Fare ₹${totalFare}. Admin Contact: ${admin.adminPhone}.`,
        from: `whatsapp:${TWILIO_PHONE_NUMBER}`,
        to: `whatsapp:+91${firstPassenger.phone}`,
      });
      console.log(`WhatsApp sent to passenger: +91${firstPassenger.phone}`);
    } catch (twilioError) {
      console.error('Twilio error for passenger:', twilioError);
    }

    // Send WhatsApp to the first passenger's parent
    try {
      await twilioClient.messages.create({
        body: `Dear Parent, ${firstPassenger.name} has booked a bus ticket. Details: Bus ${bus.busNumber}, Route ${bus.fromAddress} to ${bus.toAddress}, Date ${new Date(travelDate).toLocaleDateString()}, Departure ${bus.departureTime}, Arrival ${bus.arrivalTime}, Seats ${seatNumbers.join(', ')}, Total Fare ₹${totalFare}. Admin Contact: ${admin.adminPhone}.`,
        from: `whatsapp:${TWILIO_PHONE_NUMBER}`,
        to: `whatsapp:+91${firstPassenger.parentPhone}`,
      });
      console.log(`WhatsApp sent to parent: +91${firstPassenger.parentPhone}`);
    } catch (twilioError) {
      console.error('Twilio error for parent:', twilioError);
    }

    res.status(201).json({ message: 'Booking successful', booking });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ message: 'Error booking seats', details: error.message });
  }
});

// ... (rest of the routes remain the same)

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

    // Free up seats
    const bus = await Bus.findById(booking.busId);
    booking.seatsBooked.forEach(seat => {
      const busSeat = bus.seats.find(s => s.seatNumber === seat.seatNumber);
      if (busSeat) busSeat.isBooked = false;
    });
    await bus.save();

    const seats = booking.seatsBooked.map(s => s.seatNumber).join(', ');

    // Use the first passenger's details for notifications
    const firstPassenger = booking.userDetails.passengers[0];

    // Send cancellation email to the first passenger
    await transporter.sendMail({
      from: EMAIL_USER,
      to: firstPassenger.email,
      subject: 'Booking Cancellation Confirmation',
      text: `Dear ${firstPassenger.name},\n\nYour booking has been cancelled.\n\nDetails:\nBus: ${booking.busId.agencyName} (${booking.busId.busNumber})\nRoute: ${booking.busId.fromAddress} to ${booking.busId.toAddress}\nDate: ${new Date(booking.travelDate).toLocaleDateString()}\nSeats: ${seats}\nTotal Fare: ₹${booking.totalFare}\n\nIf you have any questions, please contact us.\n\nBest,\n${booking.busId.agencyName}`,
    });

    // Send WhatsApp to the first passenger
    try {
      await twilioClient.messages.create({
        body: `Dear ${firstPassenger.name}, your booking has been cancelled. Details: Bus ${booking.busId.busNumber}, Route ${booking.busId.fromAddress} to ${booking.busId.toAddress}, Date ${new Date(booking.travelDate).toLocaleDateString()}, Seats ${seats}, Total Fare ₹${booking.totalFare}.`,
        from: `whatsapp:${TWILIO_PHONE_NUMBER}`,
        to: `whatsapp:+91${firstPassenger.phone}`,
      });
      console.log(`WhatsApp sent to passenger: +91${firstPassenger.phone}`);
    } catch (twilioError) {
      console.error('Twilio error for passenger:', twilioError);
    }

    // Send WhatsApp to the first passenger's parent
    try {
      await twilioClient.messages.create({
        body: `Dear Parent, ${firstPassenger.name}'s booking has been cancelled. Details: Bus ${booking.busId.busNumber}, Route ${booking.busId.fromAddress} to ${booking.busId.toAddress}, Date ${new Date(booking.travelDate).toLocaleDateString()}, Seats ${seats}, Total Fare ₹${booking.totalFare}.`,
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

module.exports = router;