import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { ToastContainer, toast } from 'react-toastify';
import { motion } from 'framer-motion';
import sideImage from '../assets/background.jpg'; // Adjust the path to your image
import '../styles/Adminhome.css';

function Adminhome() {
  const [admin, setAdmin] = useState(null);
  const [agencyDetails, setAgencyDetails] = useState({
    agencyName: '',
    adminName: '',
    adminPhone: '',
  });
  const [busDetails, setBusDetails] = useState({
    busNumber: '',
    fromAddress: '',
    toAddress: '',
    departureTime: '',
    arrivalTime: '',
    fare: '',
    isAC: false,
  });
  const [buses, setBuses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null); // State to track selected bus
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFiles, setImageFiles] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setAdmin({ ...decoded, username: storedUsername || decoded.username || 'Admin' });
        fetchAdminProfile();
        fetchBuses();
        fetchBookings();
      } catch (err) {
        setError('Invalid token. Please log in again.');
        toast.error('Invalid token. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('username');
      }
    }
  }, []);

  const fetchAdminProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAgencyDetails({
        agencyName: response.data.agencyName || '',
        adminName: response.data.adminName || '',
        adminPhone: response.data.adminPhone || '',
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error fetching profile';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const fetchBuses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/buses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBuses(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error fetching buses';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error fetching bookings';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleAgencyChange = (e) => {
    setAgencyDetails({ ...agencyDetails, [e.target.name]: e.target.value });
  };

  const handleBusChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBusDetails({
      ...busDetails,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    setImageFiles(Array.from(e.target.files));
  };

  const validateTimeFormat = (time) => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    return timeRegex.test(time);
  };

  const handleAgencySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/update-profile`,
        agencyDetails,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Profile updated successfully');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error updating profile';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBusSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateTimeFormat(busDetails.departureTime)) {
      setError('Departure time must be in HH:MM format (e.g., 14:30)');
      toast.error('Departure time must be in HH:MM format (e.g., 14:30)');
      setLoading(false);
      return;
    }
    if (!validateTimeFormat(busDetails.arrivalTime)) {
      setError('Arrival time must be in HH:MM format (e.g., 18:30)');
      toast.error('Arrival time must be in HH:MM format (e.g., 18:30)');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('busNumber', busDetails.busNumber);
      formData.append('fromAddress', busDetails.fromAddress);
      formData.append('toAddress', busDetails.toAddress);
      formData.append('departureTime', busDetails.departureTime);
      formData.append('arrivalTime', busDetails.arrivalTime);
      formData.append('fare', busDetails.fare);
      formData.append('isAC', busDetails.isAC);
      imageFiles.forEach((file) => {
        formData.append('busImages', file);
      });

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/add-bus`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      toast.success('Bus added successfully');
      fetchBuses();
      setBusDetails({
        busNumber: '',
        fromAddress: '',
        toAddress: '',
        departureTime: '',
        arrivalTime: '',
        fare: '',
        isAC: false,
      });
      setImageFiles([]);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error adding bus';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      // Map the frontend status to the backend-expected status
      const backendStatus = status === 'Completed' ? 'Done' : 'Not Done';
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/update-booking-status/${bookingId}`,
        { status: backendStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message);
      fetchBookings();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error updating booking status';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Group bookings by bus
  const groupedBookings = bookings.reduce((acc, booking) => {
    const busId = booking.busId._id;
    if (!acc[busId]) {
      acc[busId] = {
        bus: booking.busId,
        bookings: [],
      };
    }
    acc[busId].bookings.push(booking);
    return acc;
  }, {});

  // Handle bus click to show passenger details
  const handleBusClick = (bus) => {
    setSelectedBus(selectedBus && selectedBus._id === bus._id ? null : bus);
  };

  return (
    <div className="admin-home">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="admin-layout">
        {/* Side Image */}
        <motion.div
          className="side-image"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <img src={sideImage} alt="Side Illustration" />
        </motion.div>

        {/* Main Content */}
        <div className="main-content">
          <motion.div
            className="admin-header"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1>Hello, {admin?.username || 'Admin'}</h1>
          </motion.div>

          {error && (
            <motion.p
              className="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.p>
          )}

          {/* Agency Details Form */}
          <motion.section
            className="admin-section"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2>Update Agency Details</h2>
            <form onSubmit={handleAgencySubmit} className="admin-form">
              <div className="form-group">
                <label>Agency Name:</label>
                <input
                  type="text"
                  name="agencyName"
                  value={agencyDetails.agencyName}
                  onChange={handleAgencyChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Admin Name:</label>
                <input
                  type="text"
                  name="adminName"
                  value={agencyDetails.adminName}
                  onChange={handleAgencyChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Admin Phone:</label>
                <input
                  type="tel"
                  name="adminPhone"
                  value={agencyDetails.adminPhone}
                  onChange={handleAgencyChange}
                  pattern="[0-9]{10}"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </motion.section>

          {/* Add Bus Form */}
          <motion.section
            className="admin-section"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2>Add a Bus</h2>
            <form onSubmit={handleBusSubmit} className="admin-form">
              <div className="form-group">
                <label>Bus Number:</label>
                <input
                  type="text"
                  name="busNumber"
                  value={busDetails.busNumber}
                  onChange={handleBusChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Departure Address:</label>
                <input
                  type="text"
                  name="fromAddress"
                  value={busDetails.fromAddress}
                  onChange={handleBusChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Destination Address:</label>
                <input
                  type="text"
                  name="toAddress"
                  value={busDetails.toAddress}
                  onChange={handleBusChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Departure Time (HH:MM):</label>
                <input
                  type="text"
                  name="departureTime"
                  value={busDetails.departureTime}
                  onChange={handleBusChange}
                  placeholder="e.g., 14:30"
                  required
                />
              </div>
              <div className="form-group">
                <label>Arrival Time (HH:MM):</label>
                <input
                  type="text"
                  name="arrivalTime"
                  value={busDetails.arrivalTime}
                  onChange={handleBusChange}
                  placeholder="e.g., 18:30"
                  required
                />
              </div>
              <div className="form-group">
                <label>Fare per Seat (₹):</label>
                <input
                  type="number"
                  name="fare"
                  value={busDetails.fare}
                  onChange={handleBusChange}
                  min="1"
                  required
                />
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="isAC"
                    checked={busDetails.isAC}
                    onChange={handleBusChange}
                  />
                  Is AC Bus?
                </label>
              </div>
              <div className="form-group">
                <label>Upload Bus Images (up to 5):</label>
                <input
                  type="file"
                  name="busImages"
                  multiple
                  onChange={handleImageChange}
                  accept="image/*"
                />
              </div>
              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? 'Adding...' : 'Add Bus'}
              </button>
            </form>
          </motion.section>

          {/* List of Buses */}
          <motion.section
            className="admin-section"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h2>Your Buses</h2>
            {buses.length === 0 ? (
              <p>No buses added yet.</p>
            ) : (
              <div className="card-container">
                {buses.map((bus) => (
                  <motion.div
                    key={bus._id}
                    className={`card bus-card ${selectedBus && selectedBus._id === bus._id ? 'selected' : ''}`}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => handleBusClick(bus)}
                  >
                    <div className="card-header">
                      <h3>{bus.agencyName} - {bus.busNumber}</h3>
                      <span className="toggle-icon">
                        {selectedBus && selectedBus._id === bus._id ? '▼' : '▶'}
                      </span>
                    </div>
                    <p><span className="icon">🛤️</span> Route: {bus.fromAddress} to {bus.toAddress}</p>
                    <p><span className="icon">⏰</span> Departure: {bus.departureTime} | Arrival: {bus.arrivalTime}</p>
                    <p><span className="icon">💵</span> Fare: ₹{bus.fare} | Type: {bus.isAC ? 'AC' : 'Non-AC'}</p>
                    <p><span className="icon">💺</span> Seats: 1-50</p>

                    {/* Passenger Details for Selected Bus */}
                    {selectedBus && selectedBus._id === bus._id && (
                      <motion.div
                        className="passenger-details"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h4>Passenger Details</h4>
                        {groupedBookings[bus._id]?.bookings?.length > 0 ? (
                          <div className="passenger-list">
                            {groupedBookings[bus._id].bookings.map((booking) => (
                              <div key={booking._id} className="passenger-card">
                                <p><strong>User:</strong> {booking.userId?.username || 'Unknown User'}</p>
                                <p><strong>Passengers:</strong></p>
                                <ul>
                                  {booking.userDetails.passengers.map((passenger, index) => (
                                    <li key={index}>
                                      {passenger.name} (Age: {passenger.age}, Gender: {passenger.gender})
                                    </li>
                                  ))}
                                </ul>
                                <p><strong>Seats:</strong> {booking.seatsBooked.map((s) => s.seatNumber).join(', ')}</p>
                                <p><strong>Travel Date:</strong> {new Date(booking.travelDate).toLocaleDateString()}</p>
                                <p><strong>Total Fare:</strong> ₹{booking.totalFare}</p>
                                <p><strong>Status:</strong> {booking.status}</p>
                                {booking.status === 'Confirmed' && (
                                  <div className="action-buttons">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation(); // Prevent card click
                                        handleUpdateBookingStatus(booking._id, 'Completed');
                                      }}
                                      disabled={loading}
                                      className="action-btn complete-btn"
                                    >
                                      {loading ? 'Processing...' : 'Completed'}
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation(); // Prevent card click
                                        handleUpdateBookingStatus(booking._id, 'Missed');
                                      }}
                                      disabled={loading}
                                      className="action-btn missed-btn"
                                    >
                                      {loading ? 'Processing...' : 'Missed'}
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p>No passengers booked for this bus yet.</p>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>

          {/* Grouped Bookings by Bus */}
          <motion.section
            className="admin-section"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <h2>All Bookings for Your Agency</h2>
            {Object.keys(groupedBookings).length === 0 ? (
              <p>No bookings yet.</p>
            ) : (
              Object.values(groupedBookings).map(({ bus, bookings }) => (
                <div key={bus._id} className="bus-bookings">
                  <h3>
                    {bus.agencyName} ({bus.busNumber}) {bus.isAC ? '(AC)' : '(Non-AC)'}
                  </h3>
                  <div className="card-container">
                    {bookings.map((booking) => (
                      <motion.div
                        key={booking._id}
                        className="card booking-card"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p><span className="icon">👤</span> <strong>User:</strong> {booking.userId?.username || 'Unknown User'}</p>
                        <p><span className="icon">👥</span> <strong>Passengers:</strong></p>
                        <ul>
                          {booking.userDetails.passengers.map((passenger, index) => (
                            <li key={index}>
                              {passenger.name} (Age: {passenger.age}, Gender: {passenger.gender})
                            </li>
                          ))}
                        </ul>
                        <p><span className="icon">💺</span> <strong>Seats:</strong> {booking.seatsBooked.map((s) => s.seatNumber).join(', ')}</p>
                        <p><span className="icon">📅</span> <strong>Travel Date:</strong> {new Date(booking.travelDate).toLocaleDateString()}</p>
                        <p><span className="icon">💵</span> <strong>Total Fare:</strong> ₹{booking.totalFare}</p>
                        <p><span className="icon">📊</span> <strong>Status:</strong> {booking.status}</p>
                        {booking.status === 'Confirmed' && (
                          <div className="action-buttons">
                            <button
                              onClick={() => handleUpdateBookingStatus(booking._id, 'Completed')}
                              disabled={loading}
                              className="action-btn complete-btn"
                            >
                              {loading ? 'Processing...' : 'Completed'}
                            </button>
                            <button
                              onClick={() => handleUpdateBookingStatus(booking._id, 'Missed')}
                              disabled={loading}
                              className="action-btn missed-btn"
                            >
                              {loading ? 'Processing...' : 'Missed'}
                            </button>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </motion.section>
        </div>
      </div>
    </div>
  );
}

export default Adminhome;