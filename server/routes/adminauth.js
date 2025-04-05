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
//   TWILIO_PHONE_NUMBER,
// } = process.env;

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: CLOUDINARY_CLOUD_NAME,
//   api_key: CLOUDINARY_API_KEY,
//   api_secret: CLOUDINARY_API_SECRET,
// });
// console.log('Cloudinary Config:', {
//   cloud_name: CLOUDINARY_CLOUD_NAME,
//   api_key: CLOUDINARY_API_KEY,
//   api_secret: '[REDACTED]',
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
//     res.status(500).json({ message: 'Error verifying OTP', details: error.message });
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
//     res.status(500).json({ message: 'Error during signup', details: error.message });
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
//     res.status(500).json({ message: 'Error logging in', details: error.message });
//   }
// });

// // Update Admin Profile (Agency Details)
// router.put('/update-profile', authenticateToken, async (req, res) => {
//   const { agencyName, adminName, adminPhone } = req.body;
//   const adminId = req.user.id;

//   if (!agencyName || !adminName || !adminPhone) {
//     return res.status(400).json({ message: 'All fields are required' });
//   }

//   if (!/^\d{10}$/.test(adminPhone)) {
//     return res.status(400).json({ message: 'Admin phone must be a valid 10-digit number' });
//   }

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
//     res.status(500).json({ message: 'Error updating profile', details: error.message });
//   }
// });

// // Add a Bus with Image Upload to Cloudinary and AC/Non-AC Option
// router.post('/add-bus', authenticateToken, upload.array('busImages', 5), async (req, res) => {
//   const { busNumber, fromAddress, toAddress, departureTime, arrivalTime, fare, isAC } = req.body;
//   const adminId = req.user.id;

//   if (!busNumber || !fromAddress || !toAddress || !departureTime || !arrivalTime || !fare) {
//     return res.status(400).json({ message: 'All fields are required' });
//   }

//   try {
//     const admin = await User.findById(adminId);
//     if (!admin || admin.role !== 'Admin') {
//       return res.status(404).json({ message: 'Admin not found' });
//     }

//     const existingBus = await Bus.findOne({ busNumber });
//     if (existingBus) {
//       return res.status(400).json({ message: 'Bus number already exists' });
//     }

//     const busImages = req.files ? req.files.map(file => file.path) : [];
//     const seats = Array.from({ length: 50 }, (_, index) => ({
//       seatNumber: index + 1,
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
//       isAC: isAC === 'true',
//     });

//     await bus.save();
//     res.status(201).json({ message: 'Bus added successfully', bus });
//   } catch (error) {
//     console.error('Add bus error:', error);
//     res.status(500).json({ message: 'Error adding bus', details: error.message });
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
//     res.status(500).json({ message: 'Error fetching buses', details: error.message });
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
//     res.status(500).json({ message: 'Error fetching bookings', details: error.message });
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
//     res.status(500).json({ message: 'Error fetching profile', details: error.message });
//   }
// });

// // Update Booking Status with Enhanced Notifications
// router.put('/update-booking-status/:bookingId', authenticateToken, async (req, res) => {
//   const { bookingId } = req.params;
//   const { status } = req.body;
//   const adminId = req.user.id;

//   if (!['Done', 'Not Done'].includes(status)) {
//     return res.status(400).json({ message: 'Invalid status value' });
//   }

//   try {
//     const booking = await Booking.findById(bookingId)
//       .populate('userId', 'email')
//       .populate('busId', 'agencyName busNumber fromAddress toAddress departureTime fare arrivalTime');
//     if (!booking || booking.adminId.toString() !== adminId) {
//       return res.status(404).json({ message: 'Booking not found or unauthorized' });
//     }

//     if (booking.status !== 'Confirmed') {
//       return res.status(400).json({ message: 'Booking status cannot be updated' });
//     }

//     const firstPassenger = booking.userDetails.passengers && booking.userDetails.passengers.length > 0
//       ? booking.userDetails.passengers[0]
//       : null;

//     if (!firstPassenger) {
//       return res.status(400).json({ message: 'No passenger details found for this booking' });
//     }

//     const { email, phone: passengerPhone, parentPhone, name: passengerName } = firstPassenger;
//     const seats = booking.seatsBooked.map(s => s.seatNumber).join(', ');

//     if (!email || !passengerPhone || !parentPhone) {
//       return res.status(400).json({ message: 'Passenger email, phone, or parent phone is missing' });
//     }

//     if (status === 'Done') {
//       booking.status = 'Completed';
//       await booking.save();

//       // Enhanced email for successful boarding
//       await transporter.sendMail({
//         from: EMAIL_USER,
//         to: email,
//         subject: '🎉 Happy Journey! Your Bus Boarding Confirmation',
//         html: `
//           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
//             <h2 style="color: #28a745; text-align: center;">Happy Journey, ${passengerName}!</h2>
//             <p style="font-size: 16px; color: #333;">We are delighted to inform you that you have successfully boarded your bus. Here are your journey details:</p>
//             <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
//               <tr>
//                 <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e0e0e0;">Bus:</td>
//                 <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${booking.busId.agencyName} (${booking.busId.busNumber}) ${booking.busId.isAC ? '(AC)' : '(Non-AC)'}</td>
//               </tr>
//               <tr>
//                 <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e0e0e0;">Route:</td>
//                 <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${booking.busId.fromAddress} to ${booking.busId.toAddress}</td>
//               </tr>
//               <tr>
//                 <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e0e0e0;">Travel Date:</td>
//                 <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${new Date(booking.travelDate).toLocaleDateString()}</td>
//               </tr>
//               <tr>
//                 <td style="padding: 8px; font-weight: bold; border-bottom: 1px16px; border-bottom: 1px solid #e0e0e0;">Departure:</td>
//                 <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${booking.busId.departureTime}</td>
//               </tr>
//               <tr>
//                 <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e0e0e0;">Arrival:</td>
//                 <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${booking.busId.arrivalTime}</td>
//               </tr>
//               <tr>
//                 <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e0e0e0;">Seats:</td>
//                 <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${seats}</td>
//               </tr>
//               <tr>
//                 <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e0e0e0;">Total Fare:</td>
//                 <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">₹${booking.totalFare}</td>
//               </tr>
//             </table>
//             <p style="font-size: 16px; color: #333;">We wish you a safe and pleasant journey! If you have any questions or need assistance, feel free to contact us at ${booking.busId.agencyName}.</p>
//             <p style="font-size: 14px; color: #777; text-align: center; margin-top: 20px;">Thank you for choosing ${booking.busId.agencyName}!</p>
//           </div>
//         `,
//       });

//       // Enhanced WhatsApp message for passenger
//       try {
//         await twilioClient.messages.create({
//           body: `🎉 Dear ${passengerName}, you have successfully boarded the bus! 🚍\n\nDetails:\n- Bus: ${booking.busId.busNumber} (${booking.busId.agencyName})\n- Route: ${booking.busId.fromAddress} to ${booking.busId.toAddress}\n- Date: ${new Date(booking.travelDate).toLocaleDateString()}\n- Departure: ${booking.busId.departureTime}\n- Arrival: ${booking.busId.arrivalTime}\n- Seats: ${seats}\n- Total Fare: ₹${booking.totalFare}\n\nWishing you a happy journey! 🌟 If you need assistance, contact ${booking.busId.agencyName}.`,
//           from: `whatsapp:${TWILIO_PHONE_NUMBER}`,
//           to: `whatsapp:+91${passengerPhone}`,
//         });
//         console.log(`WhatsApp sent to passenger: +91${passengerPhone}`);
//       } catch (twilioError) {
//         console.error('Twilio error for passenger:', twilioError);
//       }

//       // Enhanced WhatsApp message for parent
//       try {
//         await twilioClient.messages.create({
//           body: `Dear Parent, your child ${passengerName} has boarded the bus! 🚍\n\nDetails:\n- Bus: ${booking.busId.busNumber} (${booking.busId.agencyName})\n- Route: ${booking.busId.fromAddress} to ${booking.busId.toAddress}\n- Date: ${new Date(booking.travelDate).toLocaleDateString()}\n- Departure: ${booking.busId.departureTime}\n- Arrival: ${booking.busId.arrivalTime}\n- Seats: ${seats}\n- Total Fare: ₹${booking.totalFare}\n\nWishing them a safe journey! 🌟`,
//           from: `whatsapp:${TWILIO_PHONE_NUMBER}`,
//           to: `whatsapp:+91${parentPhone}`,
//         });
//         console.log(`WhatsApp sent to parent: +91${parentPhone}`);
//       } catch (twilioError) {
//         console.error('Twilio error for parent:', twilioError);
//       }

//       res.status(200).json({ message: 'Passenger boarded, notifications sent' });
//     } else if (status === 'Not Done') {
//       booking.status = 'Missed';
//       await booking.save();

//       const now = new Date();
//       const currentTime = now.getHours() * 60 + now.getMinutes();
//       const [depHours, depMinutes] = booking.busId.departureTime.split(':').map(Number);
//       const departureTime = depHours * 60 + depMinutes;

//       // Find alternate buses
//       const alternateBuses = await Bus.find({
//         adminId,
//         fromAddress: booking.busId.fromAddress,
//         toAddress: booking.busId.toAddress,
//         _id: { $ne: booking.busId._id },
//         departureTime: {
//           $gt: departureTime > currentTime ? booking.busId.departureTime : `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
//         },
//       }).select('busNumber departureTime arrivalTime fare isAC').limit(3);

//       // Format alternate bus options for email and WhatsApp
//       const alternateOptionsEmail = alternateBuses.length
//         ? alternateBuses.map(bus => `
//             <tr>
//               <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${bus.busNumber} (${bus.isAC ? 'AC' : 'Non-AC'})</td>
//               <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${bus.departureTime}</td>
//               <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${bus.arrivalTime}</td>
//               <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">₹${bus.fare}</td>
//             </tr>
//           `).join('')
//         : '<tr><td colspan="4" style="padding: 8px; text-align: center;">No alternate buses available at this time.</td></tr>';

//       const alternateOptionsWhatsApp = alternateBuses.length
//         ? alternateBuses.map(bus => `- ${bus.busNumber} (${bus.isAC ? 'AC' : 'Non-AC'}) at ${bus.departureTime} (Arrival: ${bus.arrivalTime}, Fare: ₹${bus.fare})`).join('\n')
//         : 'No alternate buses available at this time.';

//       // Enhanced email for missed bus
//       await transporter.sendMail({
//         from: EMAIL_USER,
//         to: email,
//         subject: '⚠️ Missed Bus Notification - Alternate Options Available',
//         html: `
//           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
//             <h2 style="color: #dc3545; text-align: center;">Missed Bus Notification</h2>
//             <p style="font-size: 16px; color: #333;">Dear ${passengerName},</p>
//             <p style="font-size: 16px; color: #333;">We regret to inform you that you have missed your scheduled bus. Below are the details of your missed journey:</p>
//             <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
//               <tr>
//                 <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e0e0e0;">Bus:</td>
//                 <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${booking.busId.agencyName} (${booking.busId.busNumber}) ${booking.busId.isAC ? '(AC)' : '(Non-AC)'}</td>
//               </tr>
//               <tr>
//                 <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e0e0e0;">Route:</td>
//                 <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${booking.busId.fromAddress} to ${booking.busId.toAddress}</td>
//               </tr>
//               <tr>
//                 <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e0e0e0;">Travel Date:</td>
//                 <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${new Date(booking.travelDate).toLocaleDateString()}</td>
//               </tr>
//               <tr>
//                 <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e0e0e0;">Departure:</td>
//                 <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${booking.busId.departureTime}</td>
//               </tr>
//               <tr>
//                 <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e0e0e0;">Seats:</td>
//                 <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${seats}</td>
//               </tr>
//             </table>
//             <h3 style="color: #264d68; margin-top: 20px;">Alternate Bus Options</h3>
//             <p style="font-size: 16px; color: #333;">We’ve found some alternate buses for your route. Please book a new ticket if one of these options works for you:</p>
//             <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
//               <thead>
//                 <tr style="background-color: #f8f9fa;">
//                   <th style="padding: 8px; border-bottom: 1px solid #e0e0e0;">Bus</th>
//                   <th style="padding: 8px; border-bottom: 1px solid #e0e0e0;">Departure</th>
//                   <th style="padding: 8px; border-bottom: 1px solid #e0e0e0;">Arrival</th>
//                   <th style="padding: 8px; border-bottom: 1px solid #e0e0e0;">Fare</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 ${alternateOptionsEmail}
//               </tbody>
//             </table>
//             <p style="font-size: 16px; color: #333;">To book a new ticket, please visit our website or contact our support team at ${booking.busId.agencyName}. We apologize for the inconvenience and appreciate your understanding.</p>
//             <p style="font-size: 14px; color: #777; text-align: center; margin-top: 20px;">Thank you for choosing ${booking.busId.agencyName}!</p>
//           </div>
//         `,
//       });

//       // Enhanced WhatsApp message for passenger
//       try {
//         await twilioClient.messages.create({
//           body: `⚠️ Dear ${passengerName}, you missed your bus ${booking.busId.busNumber} (${booking.busId.agencyName}) from ${booking.busId.fromAddress} to ${booking.busId.toAddress} on ${new Date(booking.travelDate).toLocaleDateString()} at ${booking.busId.departureTime}. Seats: ${seats}.\n\nAlternate buses:\n${alternateOptionsWhatsApp}\n\nPlease rebook on our website or contact ${booking.busId.agencyName} for assistance. We’re sorry for the inconvenience!`,
//           from: `whatsapp:${TWILIO_PHONE_NUMBER}`,
//           to: `whatsapp:+91${passengerPhone}`,
//         });
//         console.log(`WhatsApp sent to passenger: +91${passengerPhone}`);
//       } catch (twilioError) {
//         console.error('Twilio error for passenger:', twilioError);
//       }

//       // Enhanced WhatsApp message for parent
//       try {
//         await twilioClient.messages.create({
//           body: `⚠️ Dear Parent, your child ${passengerName} missed the bus ${booking.busId.busNumber} (${booking.busId.agencyName}) from ${booking.busId.fromAddress} to ${booking.busId.toAddress} on ${new Date(booking.travelDate).toLocaleDateString()} at ${booking.busId.departureTime}. Seats: ${seats}.\n\nAlternate buses:\n${alternateOptionsWhatsApp}\n\nPlease assist with rebooking on our website or contact ${booking.busId.agencyName}.`,
//           from: `whatsapp:${TWILIO_PHONE_NUMBER}`,
//           to: `whatsapp:+91${parentPhone}`,
//         });
//         console.log(`WhatsApp sent to parent: +91${parentPhone}`);
//       } catch (twilioError) {
//         console.error('Twilio error for parent:', twilioError);
//       }

//       res.status(200).json({ message: 'Passenger missed bus, notifications sent', alternateBuses });
//     }
//   } catch (error) {
//     console.error('Update booking status error:', error);
//     res.status(500).json({ message: 'Error updating booking status', details: error.message });
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
const { v4: uuidv4 } = require('uuid'); // Added for unique temporary usernames

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
  const { email, phone, role, username } = req.body;

  if (!email || !phone || !role) {
    return res.status(400).json({ message: 'Email, phone, and role are required' });
  }

  try {
    let user = await User.findOne({ email, phone, role });
    if (!user) {
      // Use a unique temporary username based on email and UUID
      const tempUsername = `temp_${email.split('@')[0]}_${uuidv4().split('-')[0]}`;
      user = new User({ email, phone, role, username: tempUsername });
    } else {
      // Update username if provided and valid
      if (username && username.trim().length >= 3) {
        user.username = username.trim();
      }
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
    let user = await User.findOne({ email, phone, role });
    if (!user) {
      return res.status(400).json({ message: 'User not found for OTP verification' });
    }

    if (!user.otp || user.otp !== otp || new Date() > user.otpExpires) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Check for existing username, but allow overwrite if it's a temp username or no password
    const existingUser = await User.findOne({ username });
    if (existingUser && existingUser.password) {
      return res.status(400).json({ message: 'Username already exists' });
    } else if (existingUser && !existingUser.password) {
      // Overwrite the existing temp user
      user = existingUser;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.username = username.trim();
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
      return res.status(400).json({ message: 'User not fully registered. Please complete signup with password.' });
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

// Update Booking Status with Enhanced Notifications
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
      .populate('busId', 'agencyName busNumber fromAddress toAddress departureTime fare arrivalTime');
    if (!booking || booking.adminId.toString() !== adminId) {
      return res.status(404).json({ message: 'Booking not found or unauthorized' });
    }

    if (booking.status !== 'Confirmed') {
      return res.status(400).json({ message: 'Booking status cannot be updated' });
    }

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

      // Enhanced email for successful boarding
      await transporter.sendMail({
        from: EMAIL_USER,
        to: email,
        subject: '🎉 Happy Journey! Your Bus Boarding Confirmation',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #28a745; text-align: center;">Happy Journey, ${passengerName}!</h2>
            <p style="font-size: 16px; color: #333;">We are delighted to inform you that you have successfully boarded your bus. Here are your journey details:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
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
                <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e0e0e0;">Departure:</td>
                <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${booking.busId.departureTime}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e0e0e0;">Arrival:</td>
                <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${booking.busId.arrivalTime}</td>
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
            <p style="font-size: 16px; color: #333;">We wish you a safe and pleasant journey! If you have any questions or need assistance, feel free to contact us at ${booking.busId.agencyName}.</p>
            <p style="font-size: 14px; color: #777; text-align: center; margin-top: 20px;">Thank you for choosing ${booking.busId.agencyName}!</p>
          </div>
        `,
      });

      // Enhanced WhatsApp message for passenger
      try {
        await twilioClient.messages.create({
          body: `🎉 Dear ${passengerName}, you have successfully boarded the bus! 🚍\n\nDetails:\n- Bus: ${booking.busId.busNumber} (${booking.busId.agencyName})\n- Route: ${booking.busId.fromAddress} to ${booking.busId.toAddress}\n- Date: ${new Date(booking.travelDate).toLocaleDateString()}\n- Departure: ${booking.busId.departureTime}\n- Arrival: ${booking.busId.arrivalTime}\n- Seats: ${seats}\n- Total Fare: ₹${booking.totalFare}\n\nWishing you a happy journey! 🌟 If you need assistance, contact ${booking.busId.agencyName}.`,
          from: `whatsapp:${TWILIO_PHONE_NUMBER}`,
          to: `whatsapp:+91${passengerPhone}`,
        });
        console.log(`WhatsApp sent to passenger: +91${passengerPhone}`);
      } catch (twilioError) {
        console.error('Twilio error for passenger:', twilioError);
      }

      // Enhanced WhatsApp message for parent
      try {
        await twilioClient.messages.create({
          body: `Dear Parent, your child ${passengerName} has boarded the bus! 🚍\n\nDetails:\n- Bus: ${booking.busId.busNumber} (${booking.busId.agencyName})\n- Route: ${booking.busId.fromAddress} to ${booking.busId.toAddress}\n- Date: ${new Date(booking.travelDate).toLocaleDateString()}\n- Departure: ${booking.busId.departureTime}\n- Arrival: ${booking.busId.arrivalTime}\n- Seats: ${seats}\n- Total Fare: ₹${booking.totalFare}\n\nWishing them a safe journey! 🌟`,
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
      }).select('busNumber departureTime arrivalTime fare isAC').limit(3);

      // Format alternate bus options for email and WhatsApp
      const alternateOptionsEmail = alternateBuses.length
        ? alternateBuses.map(bus => `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${bus.busNumber} (${bus.isAC ? 'AC' : 'Non-AC'})</td>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${bus.departureTime}</td>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${bus.arrivalTime}</td>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">₹${bus.fare}</td>
            </tr>
          `).join('')
        : '<tr><td colspan="4" style="padding: 8px; text-align: center;">No alternate buses available at this time.</td></tr>';

      const alternateOptionsWhatsApp = alternateBuses.length
        ? alternateBuses.map(bus => `- ${bus.busNumber} (${bus.isAC ? 'AC' : 'Non-AC'}) at ${bus.departureTime} (Arrival: ${bus.arrivalTime}, Fare: ₹${bus.fare})`).join('\n')
        : 'No alternate buses available at this time.';

      // Enhanced email for missed bus
      await transporter.sendMail({
        from: EMAIL_USER,
        to: email,
        subject: '⚠️ Missed Bus Notification - Alternate Options Available',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #dc3545; text-align: center;">Missed Bus Notification</h2>
            <p style="font-size: 16px; color: #333;">Dear ${passengerName},</p>
            <p style="font-size: 16px; color: #333;">We regret to inform you that you have missed your scheduled bus. Below are the details of your missed journey:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
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
                <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e0e0e0;">Departure:</td>
                <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${booking.busId.departureTime}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e0e0e0;">Seats:</td>
                <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${seats}</td>
              </tr>
            </table>
            <h3 style="color: #264d68; margin-top: 20px;">Alternate Bus Options</h3>
            <p style="font-size: 16px; color: #333;">We’ve found some alternate buses for your route. Please book a new ticket if one of these options works for you:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="padding: 8px; border-bottom: 1px solid #e0e0e0;">Bus</th>
                  <th style="padding: 8px; border-bottom: 1px solid #e0e0e0;">Departure</th>
                  <th style="padding: 8px; border-bottom: 1px solid #e0e0e0;">Arrival</th>
                  <th style="padding: 8px; border-bottom: 1px solid #e0e0e0;">Fare</th>
                </tr>
              </thead>
              <tbody>
                ${alternateOptionsEmail}
              </tbody>
            </table>
            <p style="font-size: 16px; color: #333;">To book a new ticket, please visit our website or contact our support team at ${booking.busId.agencyName}. We apologize for the inconvenience and appreciate your understanding.</p>
            <p style="font-size: 14px; color: #777; text-align: center; margin-top: 20px;">Thank you for choosing ${booking.busId.agencyName}!</p>
          </div>
        `,
      });

      // Enhanced WhatsApp message for passenger
      try {
        await twilioClient.messages.create({
          body: `⚠️ Dear ${passengerName}, you missed your bus ${booking.busId.busNumber} (${booking.busId.agencyName}) from ${booking.busId.fromAddress} to ${booking.busId.toAddress} on ${new Date(booking.travelDate).toLocaleDateString()} at ${booking.busId.departureTime}. Seats: ${seats}.\n\nAlternate buses:\n${alternateOptionsWhatsApp}\n\nPlease rebook on our website or contact ${booking.busId.agencyName} for assistance. We’re sorry for the inconvenience!`,
          from: `whatsapp:${TWILIO_PHONE_NUMBER}`,
          to: `whatsapp:+91${passengerPhone}`,
        });
        console.log(`WhatsApp sent to passenger: +91${passengerPhone}`);
      } catch (twilioError) {
        console.error('Twilio error for passenger:', twilioError);
      }

      // Enhanced WhatsApp message for parent
      try {
        await twilioClient.messages.create({
          body: `⚠️ Dear Parent, your child ${passengerName} missed the bus ${booking.busId.busNumber} (${booking.busId.agencyName}) from ${booking.busId.fromAddress} to ${booking.busId.toAddress} on ${new Date(booking.travelDate).toLocaleDateString()} at ${booking.busId.departureTime}. Seats: ${seats}.\n\nAlternate buses:\n${alternateOptionsWhatsApp}\n\nPlease assist with rebooking on our website or contact ${booking.busId.agencyName}.`,
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