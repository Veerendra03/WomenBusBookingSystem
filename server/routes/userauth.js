const express = require('express');
const router = express.Router();
const RegularUser = require('../models/Users'); // Use the new model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Environment variables
const { JWT_SECRET, EMAIL_USER, EMAIL_PASS } = process.env;

// Nodemailer transporter for email OTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

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
      user = new RegularUser({ email, phone, role }); // Create partial user
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP via email
    await transporter.sendMail({
      from: EMAIL_USER,
      to: email,
      subject: 'Your OTP for User Verification',
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    });

    res.status(200).json({ message: `OTP sent to ${email}. Check your inbox.` });
  } catch (error) {
    console.error('OTP sending error:', error);
    res.status(500).json({ message: 'Error sending OTP' });
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
    res.status(500).json({ message: 'Error verifying OTP' });
  }
});

// User Signup route
router.post('/user-signup', async (req, res) => {
  const { username, email, password, phone, role, otp } = req.body;

  if (!username || !email || !password || !phone || !role || !otp) {
    return res.status(400).json({ message: 'All fields are required' });
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

    // Hash password
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
    res.status(500).json({ message: 'Error during signup' });
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
    res.status(500).json({ message: 'Error logging in' });
  }
});

module.exports = router;