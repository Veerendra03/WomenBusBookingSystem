import React, { useState } from 'react';
import '../styles/User.css';
import logo from '../assets/logo2.jpg';
import loginImage from '../assets/52233.jpg';
import signupImage from '../assets/52233.jpg';
import { Mail, Lock, User, CheckCircle, Eye, EyeOff, Home, Phone } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Users() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logoClicked, setLogoClicked] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    phone: '',
    otp: '',
    role: 'User',
  });

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setOtpSent(false);
    setFormData({ ...formData, otp: '' });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const showToastNotification = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/send-otp`, {
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
      });
      showToastNotification(`OTP sent to ${formData.email}. Check your inbox.`);
      setOtpSent(true);
    } catch (error) {
      showToastNotification(error.response?.data?.message || 'Error sending OTP');
      console.error('Send OTP error:', error.response || error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/verify-otp`, {
        email: formData.email,
        otp: formData.otp,
      });
      showToastNotification(response.data.message);
      return true;
    } catch (error) {
      showToastNotification(error.response?.data?.message || 'Error verifying OTP');
      console.error('Verify OTP error:', error.response || error);
      return false;
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const isOtpValid = await handleVerifyOtp();
      if (!isOtpValid) {
        setLoading(false);
        return;
      }

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/user-signup`, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
        otp: formData.otp,
      });

      localStorage.setItem('token', response.data.token);
      showToastNotification(response.data.message);
      navigate('/user-dashboard', { replace: true });
    } catch (error) {
      showToastNotification(error.response?.data?.message || 'Error during signup');
      console.error('Signup error:', error.response || error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/user-login`, {
        email: formData.email,
        password: formData.password,
      });
      localStorage.setItem('token', response.data.token);
      showToastNotification(response.data.message);
      navigate('/user-dashboard', { replace: true });
    } catch (error) {
      showToastNotification(error.response?.data?.message || 'Error logging in');
      console.error('Login error:', error.response || error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleLogoClick = () => {
    setLogoClicked(true);
    setTimeout(() => setLogoClicked(false), 1500);
  };

  return (
    <div className="user-container">
      <div className="auth-header slide-left">
        <div className="logo-wrapper">
          <img
            src={logo}
            alt="BudgetBuddy Logo"
            className={`auth-logo ${logoClicked ? 'animate-circle' : ''}`}
            onClick={handleLogoClick}
          />
        </div>
      </div>
      <div className="auth-toggle slide-left">
        <button className={`toggle-btn ${isLogin ? 'active' : ''}`} onClick={handleToggle}>
          Login
        </button>
        <button className={`toggle-btn ${!isLogin ? 'active' : ''}`} onClick={handleToggle}>
          Signup
        </button>
      </div>
      <div className="auth-content">
        {isLogin ? (
          <div className="auth-form login-form">
            <img src={loginImage} alt="Login" className="auth-image slide-right" />
            <div className="form-wrapper slide-left">
              <h2>User Login</h2>
              <form onSubmit={handleLoginSubmit}>
                <div className="input-group">
                  <Mail className="input-icon" size={20} />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="input-group">
                  <Lock className="input-icon" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                  <span className="password-toggle" onClick={togglePasswordVisibility}>
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </span>
                </div>
                <button type="submit" className="auth-btn" disabled={loading}>
                  {loading ? 'Loading...' : 'Login'}
                </button>
              </form>
              <p className="auth-link">
                Don’t have an account?{' '}
                <span className="link" onClick={handleToggle}>
                  Create Account
                </span>
              </p>
            </div>
          </div>
        ) : (
          <div className="auth-form signup-form">
            <img src={signupImage} alt="Signup" className="auth-image slide-right" />
            <div className="form-wrapper slide-left">
              <h2>User Signup</h2>
              <form onSubmit={otpSent ? handleSignupSubmit : handleSendOtp}>
                <div className="input-group">
                  <User className="input-icon" size={20} />
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    disabled={otpSent || loading}
                  />
                </div>
                <div className="input-group">
                  <Mail className="input-icon" size={20} />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={otpSent || loading}
                  />
                </div>
                <div className="input-group">
                  <Phone className="input-icon" size={20} />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    disabled={otpSent || loading}
                    pattern="[0-9]{10}"
                    title="Please enter a 10-digit phone number"
                  />
                </div>
                <div className="input-group">
                  <Lock className="input-icon" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    disabled={otpSent || loading}
                  />
                  <span className="password-toggle" onClick={togglePasswordVisibility}>
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </span>
                </div>
                {otpSent && (
                  <>
                    <p className="otp-sent-message">OTP sent to: {formData.email}</p>
                    <div className="input-group slide-left">
                      <CheckCircle className="input-icon" size={20} />
                      <input
                        type="text"
                        name="otp"
                        placeholder="Enter OTP from email"
                        value={formData.otp}
                        onChange={handleInputChange}
                        required
                        disabled={loading}
                      />
                    </div>
                  </>
                )}
                <div className="input-group">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="role-select"
                    disabled={otpSent || loading}
                  >
                    <option value="User">User</option>
                  </select>
                </div>
                <button type="submit" className="auth-btn" disabled={loading || (otpSent && !formData.otp)}>
                  {loading ? 'Loading...' : otpSent ? 'Verify & Signup' : 'Send OTP'}
                </button>
              </form>
              <p className="auth-link">
                Already have an account?{' '}
                <span className="link" onClick={handleToggle}>
                  Login
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="auth-footer">
        <button className="auth-back-btn" onClick={handleBackToHome} disabled={loading}>
          <Home size={20} style={{ marginRight: '8px' }} /> Back to Home
        </button>
      </div>
      {showToast && <div className="auth-toast">{toastMessage}</div>}
      {loading && (
        <div className="auth-loader">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
}

export default Users;