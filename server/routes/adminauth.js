// const express = require('express');
// const router = express.Router();
// const User = require('../models/Admin');
// const Bus = require('../models/Bus');
// const Booking = require('../models/Booking');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const nodemailer = require('nodemailer');
// const authenticateToken = require('../middleware/auth');
// const multer = require('multer');
// const { CloudinaryStorage } = require('multer-storage-cloudinary');
// const cloudinary = require('cloudinary').v2;
// const twilio = require('twilio');

// // Environment variables
// const { 
//   JWT_SECRET, 
//   EMAIL_USER, 
//   EMAIL_PASS, 
//   CLOUDINARY_CLOUD_NAME, 
//   CLOUDINARY_API_KEY, 
//   CLOUDINARY_API_SECRET,
//   TWILIO_ACCOUNT_SID,
//   TWILIO_AUTH_TOKEN,
//   TWILIO_PHONE_NUMBER
// } = process.env;

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: CLOUDINARY_CLOUD_NAME,
//   api_key: CLOUDINARY_API_KEY,
//   api_secret: CLOUDINARY_API_SECRET,
// });
// console.log('Cloudinary Config:', {
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // Configure Multer with Cloudinary storage
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'bus_images',
//     allowed_formats: ['jpg', 'png', 'jpeg'],
//   },
// });

// const upload = multer({ storage });

// // Nodemailer transporter for email
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

//   try {
//     let user = await User.findOne({ email, phone, role });
//     if (!user) {
//       user = new User({ email, phone, role });
//     }

//     const otp = generateOTP();
//     const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

//     user.otp = otp;
//     user.otpExpires = otpExpires;
//     await user.save();

//     await transporter.sendMail({
//       from: EMAIL_USER,
//       to: email,
//       subject: 'Your OTP for Admin Verification',
//       text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
//     });

//     res.status(200).json({ message: `OTP sent to ${email}. Check your inbox.` });
//   } catch (error) {
//     console.error('OTP sending error:', error);
//     res.status(500).json({ message: 'Error sending OTP' });
//   }
// });

// // Verify OTP
// router.post('/verify-otp', async (req, res) => {
//   const { email, otp } = req.body;

//   if (!email || !otp) {
//     return res.status(400).json({ message: 'Email and OTP are required' });
//   }

//   try {
//     const user = await User.findOne({ email, role: 'Admin' });
//     if (!user) {
//       return res.status(400).json({ message: 'User not found' });
//     }

//     if (!user.otp || user.otp !== otp || new Date() > user.otpExpires) {
//       return res.status(400).json({ message: 'Invalid or expired OTP' });
//     }

//     res.status(200).json({ message: 'OTP verified successfully' });
//   } catch (error) {
//     console.error('OTP verification error:', error);
//     res.status(500).json({ message: 'Error verifying OTP' });
//   }
// });

// // Admin Signup route
// router.post('/admin-signup', async (req, res) => {
//   const { username, email, password, phone, role, otp } = req.body;

//   if (!username || !email || !password || !phone || !role || !otp) {
//     return res.status(400).json({ message: 'All fields are required' });
//   }

//   if (password.length < 6) {
//     return res.status(400).json({ message: 'Password must be at least 6 characters long' });
//   }

//   try {
//     const user = await User.findOne({ email, phone, role });
//     if (!user) {
//       return res.status(400).json({ message: 'User not found for OTP verification' });
//     }

//     if (!user.otp || user.otp !== otp || new Date() > user.otpExpires) {
//       return res.status(400).json({ message: 'Invalid or expired OTP' });
//     }

//     const existingUser = await User.findOne({ username });
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
//     res.status(500).json({ message: 'Error during signup' });
//   }
// });

// // Admin Login route
// router.post('/admin-login', async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ message: 'Email and password are required' });
//   }

//   try {
//     const user = await User.findOne({ email, role: 'Admin' });
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

//     const token = jwt.sign({ id: user._id, role: user.role, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
//     user.token = token;
//     await user.save();

//     res.status(200).json({ message: 'Login successful', token, username: user.username });
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({ message: 'Error logging in' });
//   }
// });

// // Update Admin Profile (Agency Details)
// router.put('/update-profile', authenticateToken, async (req, res) => {
//   const { agencyName, adminName, adminPhone } = req.body;
//   const adminId = req.user.id;

//   try {
//     const admin = await User.findById(adminId);
//     if (!admin || admin.role !== 'Admin') {
//       return res.status(404).json({ message: 'Admin not found' });
//     }

//     admin.agencyName = agencyName;
//     admin.adminName = adminName;
//     admin.adminPhone = adminPhone;
//     await admin.save();

//     res.status(200).json({ message: 'Profile updated successfully', admin });
//   } catch (error) {
//     console.error('Profile update error:', error);
//     res.status(500).json({ message: 'Error updating profile' });
//   }
// });

// // Add a Bus with Image Upload to Cloudinary and AC/Non-AC Option
// router.post('/add-bus', authenticateToken, upload.array('busImages', 5), async (req, res) => {
//   const {
//     busNumber,
//     fromAddress,
//     toAddress,
//     departureTime,
//     arrivalTime,
//     fare,
//     isAC, // New field for AC/Non-AC
//   } = req.body;
//   const adminId = req.user.id;

//   try {
//     const admin = await User.findById(adminId);
//     if (!admin || admin.role !== 'Admin') {
//       return res.status(404).json({ message: 'Admin not found' });
//     }

//     const existingBus = await Bus.findOne({ busNumber });
//     if (existingBus) {
//       return res.status(400).json({ message: 'Bus number already exists' });
//     }

//     // Get image URLs from Cloudinary (uploaded by multer-storage-cloudinary)
//     const busImages = req.files ? req.files.map(file => file.path) : [];

//     // Create seats array (50 seats)
//     const seats = Array.from({ length: 50 }, (_, index) => ({
//       seatNumber: index + 1,
//       isBooked: false,
//     }));

//     const bus = new Bus({
//       agencyName: admin.agencyName,
//       adminId,
//       busNumber,
//       busImages,
//       fromAddress,
//       toAddress,
//       departureTime,
//       arrivalTime,
//       totalSeats: 50,
//       seats,
//       fare,
//       isAC: isAC === 'true', // Convert string to boolean
//     });

//     await bus.save();
//     res.status(201).json({ message: 'Bus added successfully', bus });
//   } catch (error) {
//     console.error('Add bus error:', error);
//     res.status(500).json({ message: 'Error adding bus' });
//   }
// });

// // Get All Buses for Admin
// router.get('/buses', authenticateToken, async (req, res) => {
//   const adminId = req.user.id;

//   try {
//     const buses = await Bus.find({ adminId });
//     res.status(200).json(buses);
//   } catch (error) {
//     console.error('Get buses error:', error);
//     res.status(500).json({ message: 'Error fetching buses' });
//   }
// });

// // Get Bookings for Admin's Agency
// router.get('/bookings', authenticateToken, async (req, res) => {
//   const adminId = req.user.id;

//   try {
//     const bookings = await Booking.find({ adminId })
//       .populate('userId', 'username email phone')
//       .populate('busId', 'agencyName busNumber fromAddress toAddress departureTime arrivalTime isAC');
//     res.status(200).json(bookings);
//   } catch (error) {
//     console.error('Get bookings error:', error);
//     res.status(500).json({ message: 'Error fetching bookings' });
//   }
// });

// // Get Admin Profile
// router.get('/profile', authenticateToken, async (req, res) => {
//   const adminId = req.user.id;

//   try {
//     const admin = await User.findById(adminId);
//     if (!admin || admin.role !== 'Admin') {
//       return res.status(404).json({ message: 'Admin not found' });
//     }

//     res.status(200).json({
//       agencyName: admin.agencyName,
//       adminName: admin.adminName,
//       adminPhone: admin.adminPhone,
//     });
//   } catch (error) {
//     console.error('Get profile error:', error);
//     res.status(500).json({ message: 'Error fetching profile' });
//   }
// });

// // Update Booking Status with WhatsApp Notifications
// router.put('/update-booking-status/:bookingId', authenticateToken, async (req, res) => {
//   const { bookingId } = req.params;
//   const { status } = req.body; // Expected values: 'Done' or 'Not Done'
//   const adminId = req.user.id;

//   try {
//     const booking = await Booking.findById(bookingId)
//       .populate('userId', 'email')
//       .populate('busId', 'agencyName busNumber fromAddress toAddress departureTime');
//     if (!booking || booking.adminId.toString() !== adminId) {
//       return res.status(404).json({ message: 'Booking not found or unauthorized' });
//     }

//     if (status !== 'Done' && status !== 'Not Done') {
//       return res.status(400).json({ message: 'Invalid status value' });
//     }

//     booking.status = status === 'Done' ? 'Completed' : 'Missed';
//     await booking.save();

//     const { email, parentPhone } = booking.userDetails;
//     const passengerPhone = booking.userDetails.phone;

//     // Send notifications based on status
//     if (status === 'Done') {
//       // Email to passenger
//       await transporter.sendMail({
//         from: EMAIL_USER,
//         to: email,
//         subject: 'Happy Journey!',
//         text: `Dear ${booking.userDetails.name},\n\nYou have successfully boarded the bus!\n\nDetails:\nBus: ${booking.busId.agencyName} (${booking.busId.busNumber})\nRoute: ${booking.busId.fromAddress} to ${booking.busId.toAddress}\nTravel Date: ${new Date(booking.travelDate).toLocaleDateString()}\nSeats: ${booking.seatsBooked.map(s => s.seatNumber).join(', ')}\n\nWishing you a happy journey!\n\nBest,\nYour Bus Agency`,
//       });

//       // WhatsApp to passenger
//       await twilioClient.messages.create({
//         body: `Dear ${booking.userDetails.name}, you have successfully boarded the bus! Details: Bus ${booking.busId.busNumber}, Route ${booking.busId.fromAddress} to ${booking.busId.toAddress}, Date ${new Date(booking.travelDate).toLocaleDateString()}. Happy journey!`,
//         from: `whatsapp:${TWILIO_PHONE_NUMBER}`,
//         to: `whatsapp:+91${passengerPhone}`, // Assuming Indian numbers, adjust country code as needed
//       });

//       // WhatsApp to parent
//       await twilioClient.messages.create({
//         body: `Dear Parent, your child ${booking.userDetails.name} has boarded the bus ${booking.busId.busNumber} from ${booking.busId.fromAddress} to ${booking.busId.toAddress} on ${new Date(booking.travelDate).toLocaleDateString()}. Happy journey!`,
//         from: `whatsapp:${TWILIO_PHONE_NUMBER}`,
//         to: `whatsapp:+91${parentPhone}`, // Assuming Indian numbers, adjust country code as needed
//       });

//       res.status(200).json({ message: 'Passenger boarded, email and WhatsApp sent' });
//     } else if (status === 'Not Done') {
//       // Find alternate buses
//       const currentTime = new Date();
//       const alternateBuses = await Bus.find({
//         fromAddress: booking.busId.fromAddress,
//         toAddress: booking.busId.toAddress,
//         _id: { $ne: booking.busId._id },
//         departureTime: { $gt: currentTime.toTimeString().slice(0, 5) },
//       }).select('busNumber departureTime arrivalTime fare');

//       // WhatsApp to passenger
//       await twilioClient.messages.create({
//         body: `Dear ${booking.userDetails.name}, you missed your bus ${booking.busId.busNumber}. Alternate buses: ${alternateBuses.map(bus => `${bus.busNumber} at ${bus.departureTime}`).join(', ') || 'None available'}. Please rebook.`,
//         from: `whatsapp:${TWILIO_PHONE_NUMBER}`,
//         to: `whatsapp:+91${passengerPhone}`,
//       });

//       // WhatsApp to parent
//       await twilioClient.messages.create({
//         body: `Dear Parent, your child ${booking.userDetails.name} missed the bus ${booking.busId.busNumber}. Alternate buses: ${alternateBuses.map(bus => `${bus.busNumber} at ${bus.departureTime}`).join(', ') || 'None available'}. Please assist with rebooking.`,
//         from: `whatsapp:${TWILIO_PHONE_NUMBER}`,
//         to: `whatsapp:+91${parentPhone}`,
//       });

//       res.status(200).json({ message: 'Passenger missed bus, WhatsApp sent with alternate options', alternateBuses });
//     }
//   } catch (error) {
//     console.error('Update booking status error:', error);
//     res.status(500).json({ message: 'Error updating booking status', error: error.message });
//   }
// });

// module.exports = router;
const express = require('express');
const router = express.Router();
const User = require('../models/Admin');
const Bus = require('../models/Bus');
const Booking = require('../models/Booking');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const authenticateToken = require('../middleware/auth');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const twilio = require('twilio');

// Environment variables
const {
  JWT_SECRET,
  EMAIL_USER,
  EMAIL_PASS,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER,
} = process.env;

// Configure Cloudinary
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});
console.log('Cloudinary Config:', {
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: '[REDACTED]',
});

// Configure Multer with Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bus_images',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

const upload = multer({ storage });

// Nodemailer transporter for email
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

  try {
    let user = await User.findOne({ email, phone, role });
    if (!user) {
      user = new User({ email, phone, role });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    await transporter.sendMail({
      from: EMAIL_USER,
      to: email,
      subject: 'Your OTP for Admin Verification',
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
    const user = await User.findOne({ email, role: 'Admin' });
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

// Admin Signup route
router.post('/admin-signup', async (req, res) => {
  const { username, email, password, phone, role, otp } = req.body;

  if (!username || !email || !password || !phone || !role || !otp) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    const user = await User.findOne({ email, phone, role });
    if (!user) {
      return res.status(400).json({ message: 'User not found for OTP verification' });
    }

    if (!user.otp || user.otp !== otp || new Date() > user.otpExpires) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const existingUser = await User.findOne({ username });
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

// Admin Login route
router.post('/admin-login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email, role: 'Admin' });
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

    const token = jwt.sign({ id: user._id, role: user.role, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    user.token = token;
    await user.save();

    res.status(200).json({ message: 'Login successful', token, username: user.username });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', details: error.message });
  }
});

// Update Admin Profile (Agency Details)
router.put('/update-profile', authenticateToken, async (req, res) => {
  const { agencyName, adminName, adminPhone } = req.body;
  const adminId = req.user.id;

  if (!agencyName || !adminName || !adminPhone) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (!/^\d{10}$/.test(adminPhone)) {
    return res.status(400).json({ message: 'Admin phone must be a valid 10-digit number' });
  }

  try {
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'Admin') {
      return res.status(404).json({ message: 'Admin not found' });
    }

    admin.agencyName = agencyName;
    admin.adminName = adminName;
    admin.adminPhone = adminPhone;
    await admin.save();

    res.status(200).json({ message: 'Profile updated successfully', admin });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Error updating profile', details: error.message });
  }
});

// Add a Bus with Image Upload to Cloudinary and AC/Non-AC Option
router.post('/add-bus', authenticateToken, upload.array('busImages', 5), async (req, res) => {
  const { busNumber, fromAddress, toAddress, departureTime, arrivalTime, fare, isAC } = req.body;
  const adminId = req.user.id;

  if (!busNumber || !fromAddress || !toAddress || !departureTime || !arrivalTime || !fare) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'Admin') {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const existingBus = await Bus.findOne({ busNumber });
    if (existingBus) {
      return res.status(400).json({ message: 'Bus number already exists' });
    }

    const busImages = req.files ? req.files.map(file => file.path) : [];
    const seats = Array.from({ length: 50 }, (_, index) => ({
      seatNumber: index + 1,
      isBooked: false,
    }));

    const bus = new Bus({
      agencyName: admin.agencyName,
      adminId,
      busNumber,
      busImages,
      fromAddress,
      toAddress,
      departureTime,
      arrivalTime,
      totalSeats: 50,
      seats,
      fare,
      isAC: isAC === 'true',
    });

    await bus.save();
    res.status(201).json({ message: 'Bus added successfully', bus });
  } catch (error) {
    console.error('Add bus error:', error);
    res.status(500).json({ message: 'Error adding bus', details: error.message });
  }
});

// Get All Buses for Admin
router.get('/buses', authenticateToken, async (req, res) => {
  const adminId = req.user.id;

  try {
    const buses = await Bus.find({ adminId });
    res.status(200).json(buses);
  } catch (error) {
    console.error('Get buses error:', error);
    res.status(500).json({ message: 'Error fetching buses', details: error.message });
  }
});

// Get Bookings for Admin's Agency
router.get('/bookings', authenticateToken, async (req, res) => {
  const adminId = req.user.id;

  try {
    const bookings = await Booking.find({ adminId })
      .populate('userId', 'username email phone')
      .populate('busId', 'agencyName busNumber fromAddress toAddress departureTime arrivalTime isAC');
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Error fetching bookings', details: error.message });
  }
});

// Get Admin Profile
router.get('/profile', authenticateToken, async (req, res) => {
  const adminId = req.user.id;

  try {
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'Admin') {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.status(200).json({
      agencyName: admin.agencyName,
      adminName: admin.adminName,
      adminPhone: admin.adminPhone,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error fetching profile', details: error.message });
  }
});

// Update Booking Status with WhatsApp Notifications
router.put('/update-booking-status/:bookingId', authenticateToken, async (req, res) => {
  const { bookingId } = req.params;
  const { status } = req.body;
  const adminId = req.user.id;

  if (!['Done', 'Not Done'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const booking = await Booking.findById(bookingId)
      .populate('userId', 'email')
      .populate('busId', 'agencyName busNumber fromAddress toAddress departureTime fare');
    if (!booking || booking.adminId.toString() !== adminId) {
      return res.status(404).json({ message: 'Booking not found or unauthorized' });
    }

    if (booking.status !== 'Confirmed') {
      return res.status(400).json({ message: 'Booking status cannot be updated' });
    }

    // Access the first passenger's details from the passengers array
    const firstPassenger = booking.userDetails.passengers && booking.userDetails.passengers.length > 0
      ? booking.userDetails.passengers[0]
      : null;

    if (!firstPassenger) {
      return res.status(400).json({ message: 'No passenger details found for this booking' });
    }

    const { email, phone: passengerPhone, parentPhone, name: passengerName } = firstPassenger;
    const seats = booking.seatsBooked.map(s => s.seatNumber).join(', ');

    if (!email || !passengerPhone || !parentPhone) {
      return res.status(400).json({ message: 'Passenger email, phone, or parent phone is missing' });
    }

    if (status === 'Done') {
      booking.status = 'Completed';
      await booking.save();

      // Send email to passenger
      await transporter.sendMail({
        from: EMAIL_USER,
        to: email,
        subject: 'Happy Journey!',
        text: `Dear ${passengerName},\n\nYou have successfully boarded the bus!\n\nDetails:\nBus: ${booking.busId.agencyName} (${booking.busId.busNumber})\nRoute: ${booking.busId.fromAddress} to ${booking.busId.toAddress}\nTravel Date: ${new Date(booking.travelDate).toLocaleDateString()}\nSeats: ${seats}\nTotal Fare: ₹${booking.totalFare}\n\nWishing you a happy journey!\n\nBest,\n${booking.busId.agencyName}`,
      });

      // Send WhatsApp to passenger
      try {
        await twilioClient.messages.create({
          body: `Dear ${passengerName}, you have successfully boarded the bus! Details: Bus ${booking.busId.busNumber}, Route ${booking.busId.fromAddress} to ${booking.busId.toAddress}, Date ${new Date(booking.travelDate).toLocaleDateString()}, Seats ${seats}, Total Fare ₹${booking.totalFare}. Happy journey!`,
          from: `whatsapp:${TWILIO_PHONE_NUMBER}`,
          to: `whatsapp:+91${passengerPhone}`,
        });
        console.log(`WhatsApp sent to passenger: +91${passengerPhone}`);
      } catch (twilioError) {
        console.error('Twilio error for passenger:', twilioError);
      }

      // Send WhatsApp to parent
      try {
        await twilioClient.messages.create({
          body: `Dear Parent, your child ${passengerName} has boarded the bus ${booking.busId.busNumber} from ${booking.busId.fromAddress} to ${booking.busId.toAddress} on ${new Date(booking.travelDate).toLocaleDateString()}. Seats: ${seats}, Total Fare: ₹${booking.totalFare}. Happy journey!`,
          from: `whatsapp:${TWILIO_PHONE_NUMBER}`,
          to: `whatsapp:+91${parentPhone}`,
        });
        console.log(`WhatsApp sent to parent: +91${parentPhone}`);
      } catch (twilioError) {
        console.error('Twilio error for parent:', twilioError);
      }

      res.status(200).json({ message: 'Passenger boarded, notifications sent' });
    } else if (status === 'Not Done') {
      booking.status = 'Missed';
      await booking.save();

      // Convert current time and departure time to comparable format (minutes since midnight)
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const [depHours, depMinutes] = booking.busId.departureTime.split(':').map(Number);
      const departureTime = depHours * 60 + depMinutes;

      // Find alternate buses
      const alternateBuses = await Bus.find({
        adminId,
        fromAddress: booking.busId.fromAddress,
        toAddress: booking.busId.toAddress,
        _id: { $ne: booking.busId._id },
        departureTime: {
          $gt: departureTime > currentTime ? booking.busId.departureTime : `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
        },
      }).select('busNumber departureTime arrivalTime fare').limit(3);

      const alternateOptions = alternateBuses.length
        ? alternateBuses.map(bus => `${bus.busNumber} at ${bus.departureTime} (Fare: ₹${bus.fare})`).join(', ')
        : 'None available';

      // Send email to passenger
      await transporter.sendMail({
        from: EMAIL_USER,
        to: email,
        subject: 'Missed Bus Notification',
        text: `Dear ${passengerName},\n\nYou have missed your bus!\n\nDetails:\nBus: ${booking.busId.agencyName} (${booking.busId.busNumber})\nRoute: ${booking.busId.fromAddress} to ${booking.busId.toAddress}\nTravel Date: ${new Date(booking.travelDate).toLocaleDateString()}\nSeats: ${seats}\n\nAlternate Buses: ${alternateOptions}\n\nPlease rebook if needed.\n\nBest,\n${booking.busId.agencyName}`,
      });

      // Send WhatsApp to passenger
      try {
        await twilioClient.messages.create({
          body: `Dear ${passengerName}, you missed your bus ${booking.busId.busNumber} from ${booking.busId.fromAddress} to ${booking.busId.toAddress} on ${new Date(booking.travelDate).toLocaleDateString()}. Seats: ${seats}. Alternate buses: ${alternateOptions}. Please rebook.`,
          from: `whatsapp:${TWILIO_PHONE_NUMBER}`,
          to: `whatsapp:+91${passengerPhone}`,
        });
        console.log(`WhatsApp sent to passenger: +91${passengerPhone}`);
      } catch (twilioError) {
        console.error('Twilio error for passenger:', twilioError);
      }

      // Send WhatsApp to parent
      try {
        await twilioClient.messages.create({
          body: `Dear Parent, your child ${passengerName} missed the bus ${booking.busId.busNumber} from ${booking.busId.fromAddress} to ${booking.busId.toAddress} on ${new Date(booking.travelDate).toLocaleDateString()}. Seats: ${seats}. Alternate buses: ${alternateOptions}. Please assist with rebooking.`,
          from: `whatsapp:${TWILIO_PHONE_NUMBER}`,
          to: `whatsapp:+91${parentPhone}`,
        });
        console.log(`WhatsApp sent to parent: +91${parentPhone}`);
      } catch (twilioError) {
        console.error('Twilio error for parent:', twilioError);
      }

      res.status(200).json({ message: 'Passenger missed bus, notifications sent', alternateBuses });
    }
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Error updating booking status', details: error.message });
  }
});

module.exports = router;