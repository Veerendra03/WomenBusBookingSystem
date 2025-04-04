import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { motion } from 'framer-motion';
import '../styles/Userhome.css';

// Dummy QR code URL (replace with a real QR code image URL or generate dynamically in a real app)
const dummyQrCode = 'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg';

function Userhome() {
  const [user, setUser] = useState(null);
  const [searchParams, setSearchParams] = useState({
    fromAddress: '',
    toAddress: '',
    travelDate: '',
  });
  const [buses, setBuses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [bookingDetails, setBookingDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPaymentPopup, setShowPaymentPopup] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Hello! I’m your travel assistant. How can I help you today? Type "tips" for travel tips, "billings" for your booking details, or ask me anything!' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
        fetchUserProfile();
        fetchBookings();
      } catch (err) {
        setError('Invalid token. Please log in again.');
        localStorage.removeItem('token');
      }
    }
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser((prevUser) => ({ ...prevUser, username: response.data.username }));
    } catch (err) {
      setError('Error fetching user profile');
    }
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching bookings');
    }
  };

  const handleSearchChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/search-buses`, {
        params: searchParams,
        headers: { Authorization: `Bearer ${token}` },
      });
      setBuses(response.data);
      const initialBookingDetails = {};
      response.data.forEach((bus) => {
        initialBookingDetails[bus._id] = {
          busId: bus._id,
          travelDate: searchParams.travelDate,
          seatsBooked: [],
          userDetails: { passengers: [] },
          bookedSeatNumbers: [],
        };
      });
      setBookingDetails(initialBookingDetails);
    } catch (err) {
      setError(err.response?.data?.message || 'Error searching buses');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookedSeats = async (busId, travelDate) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/check-seat-availability`, {
        params: {
          busId,
          travelDate,
          seats: Array.from({ length: 50 }, (_, i) => i + 1).join(','),
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.bookedSeats || [];
    } catch (err) {
      console.error('Error fetching booked seats:', err);
      return [];
    }
  };

  const addPassenger = (busId) => {
    const busBooking = bookingDetails[busId] || {
      busId,
      travelDate: searchParams.travelDate,
      seatsBooked: [],
      userDetails: { passengers: [] },
      bookedSeatNumbers: [],
    };
    if (busBooking.userDetails.passengers.length >= 3) {
      setError('Maximum 3 passengers allowed');
      return;
    }
    setBookingDetails({
      ...bookingDetails,
      [busId]: {
        ...busBooking,
        userDetails: {
          passengers: [
            ...busBooking.userDetails.passengers,
            { name: '', age: '', gender: '', phone: '', email: '', parentPhone: '' },
          ],
        },
      },
    });
  };

  const removePassenger = (busId, index) => {
    const busBooking = bookingDetails[busId];
    const updatedPassengers = busBooking.userDetails.passengers.filter((_, i) => i !== index);
    setBookingDetails({
      ...bookingDetails,
      [busId]: {
        ...busBooking,
        userDetails: { passengers: updatedPassengers },
        seatsBooked: busBooking.seatsBooked.slice(0, updatedPassengers.length),
      },
    });
  };

  const handlePassengerChange = (busId, index, field, value) => {
    const busBooking = bookingDetails[busId];
    const updatedPassengers = [...busBooking.userDetails.passengers];
    updatedPassengers[index] = { ...updatedPassengers[index], [field]: value };
    setBookingDetails({
      ...bookingDetails,
      [busId]: {
        ...busBooking,
        userDetails: { passengers: updatedPassengers },
      },
    });
  };

  const handleSeatSelection = async (busId, seatNumber) => {
    const busBooking = bookingDetails[busId];
    if (!busBooking.bookedSeatNumbers || busBooking.bookedSeatNumbers.length === 0) {
      const bookedSeats = await fetchBookedSeats(busId, searchParams.travelDate);
      setBookingDetails((prev) => ({
        ...prev,
        [busId]: {
          ...prev[busId],
          bookedSeatNumbers: bookedSeats,
        },
      }));
      busBooking.bookedSeatNumbers = bookedSeats;
    }

    if (busBooking.bookedSeatNumbers.includes(seatNumber)) {
      setError(`Seat ${seatNumber} is already booked`);
      return;
    }

    const totalPassengers = busBooking.userDetails.passengers.length;
    if (totalPassengers === 0) {
      setError('Please add at least one passenger before selecting seats');
      return;
    }

    let updatedSeats = [...busBooking.seatsBooked];
    if (updatedSeats.includes(seatNumber)) {
      updatedSeats = updatedSeats.filter((seat) => seat !== seatNumber);
    } else {
      if (updatedSeats.length >= totalPassengers) {
        setError(`You can only select ${totalPassengers} seats for ${totalPassengers} passengers`);
        return;
      }
      updatedSeats.push(seatNumber);
    }

    setBookingDetails({
      ...bookingDetails,
      [busId]: {
        ...busBooking,
        seatsBooked: updatedSeats,
      },
    });
  };

  const validatePassengerDetails = (busId) => {
    const passengers = bookingDetails[busId]?.userDetails.passengers || [];
    if (passengers.length < 1 || passengers.length > 3) {
      return 'Must include 1 to 3 passengers';
    }
    for (const p of passengers) {
      if (
        !p.name ||
        !p.age ||
        !['Male', 'Female', 'Other'].includes(p.gender) ||
        !/^\d{10}$/.test(p.phone) ||
        !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(p.email) ||
        !/^\d{10}$/.test(p.parentPhone) ||
        p.age < 1
      ) {
        return 'Invalid passenger details. Ensure all fields are filled correctly.';
      }
    }
    return null;
  };

  const handleBookingSubmit = async (busId) => {
    setLoading(true);
    setError('');

    const busBooking = bookingDetails[busId];
    const totalPassengers = busBooking.userDetails.passengers.length;

    const validationError = validatePassengerDetails(busId);
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    if (busBooking.seatsBooked.length !== totalPassengers) {
      setError(`Please select ${totalPassengers} seats for all passengers`);
      setLoading(false);
      return;
    }

    if (!searchParams.travelDate) {
      setError('Travel date is required');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/check-seat-availability`, {
        params: {
          busId,
          travelDate: searchParams.travelDate,
          seats: busBooking.seatsBooked.join(','),
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.available) {
        setShowPaymentPopup(busId);
      } else {
        setError('One or more selected seats are already booked. Please select different seats.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error checking seat availability');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (busId, paymentSuccess) => {
    setLoading(true);
    setShowPaymentPopup(null);

    if (paymentSuccess) {
      try {
        const token = localStorage.getItem('token');
        const busBooking = bookingDetails[busId];
        const payload = {
          busId,
          travelDate: searchParams.travelDate,
          seatsBooked: busBooking.seatsBooked.map((seatNumber) => ({ seatNumber })),
          userDetails: busBooking.userDetails,
        };
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/book-seats`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPaymentStatus('success');
        alert(`Booking successful! Transaction ID: ${response.data.transactionId}. Check your email and WhatsApp for confirmation.`);
        fetchBookings();
        setBookingDetails((prev) => ({
          ...prev,
          [busId]: {
            busId,
            travelDate: searchParams.travelDate,
            seatsBooked: [],
            userDetails: { passengers: [] },
            bookedSeatNumbers: [],
          },
        }));
      } catch (err) {
        setError(err.response?.data?.message || 'Error booking seats');
        setPaymentStatus('failure');
      }
    } else {
      setPaymentStatus('failure');
      setError('Payment failed. Please try again.');
    }
    setLoading(false);
  };

  const handleCancelBooking = async (bookingId) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/user/cancel-booking/${bookingId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Booking cancelled successfully');
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Error cancelling booking');
    } finally {
      setLoading(false);
    }
  };

  const handleViewImages = (images) => {
    setSelectedImages(images);
    setShowImagePopup(true);
  };

  const handleCloseImagePopup = () => {
    setShowImagePopup(false);
    setSelectedImages([]);
  };

  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
  };

  const handleChatInputChange = (e) => {
    setChatInput(e.target.value);
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    // Add user message to chat
    setChatMessages([...chatMessages, { sender: 'user', text: chatInput }]);
    const userMessage = chatInput.trim().toLowerCase();
    setChatInput('');

    try {
      const token = localStorage.getItem('token');

      if (userMessage === 'tips') {
        // Fetch travel tips
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/chatbot/tips`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChatMessages((prev) => [...prev, { sender: 'bot', text: response.data.tips }]);
      } else if (userMessage === 'billings') {
        // Fetch billing details
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/chatbot/billings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.billings) {
          const billingText = response.data.billings
            .map((billing) => `Booking ID: ${billing.bookingId}\nBus: ${billing.bus}\nRoute: ${billing.route}\nDate: ${billing.travelDate}\nSeats: ${billing.seats}\nTotal Fare: ${billing.totalFare}\nStatus: ${billing.status}`)
            .join('\n\n');
          setChatMessages((prev) => [...prev, { sender: 'bot', text: billingText }]);
        } else {
          setChatMessages((prev) => [...prev, { sender: 'bot', text: response.data.message }]);
        }
      } else {
        // General interaction with Gemini API
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/user/chatbot/interact`,
          { message: chatInput },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setChatMessages((prev) => [...prev, { sender: 'bot', text: response.data.reply }]);
      }
    } catch (err) {
      setChatMessages((prev) => [...prev, { sender: 'bot', text: 'Sorry, I encountered an error. Please try again!' }]);
    }
  };

  return (
    <div className="user-home">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Hello, {user?.username || 'User'}
      </motion.h1>
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

      {/* Search Buses Form */}
      <motion.section
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2>Search Buses</h2>
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="form-group">
            <label>From:</label>
            <input
              type="text"
              name="fromAddress"
              value={searchParams.fromAddress}
              onChange={handleSearchChange}
              required
            />
          </div>
          <div className="form-group">
            <label>To:</label>
            <input
              type="text"
              name="toAddress"
              value={searchParams.toAddress}
              onChange={handleSearchChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Travel Date:</label>
            <input
              type="date"
              name="travelDate"
              value={searchParams.travelDate}
              onChange={handleSearchChange}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Searching...' : 'Search Buses'}
          </button>
        </form>
      </motion.section>

      {/* List of Available Buses */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2>Available Buses</h2>
        {buses.length === 0 ? (
          <p>No buses found.</p>
        ) : (
          buses.map((bus) => (
            <motion.div
              key={bus._id}
              className="bus-card"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <h3>
                {bus.agencyName} - {bus.busNumber} ({bus.isAC ? 'AC' : 'Non-AC'})
              </h3>
              <p>
                <span className="icon">🛤️</span> Route: {bus.fromAddress} to {bus.toAddress} | <span className="icon">⏰</span> Departure: {bus.departureTime} | Arrival: {bus.arrivalTime} | <span className="icon">💵</span> Fare: ₹{bus.fare} per seat | <span className="icon">💺</span> Available Seats: {bus.availableSeats}
              </p>
              {bus.busImages && bus.busImages.length > 0 && (
                <button
                  type="button"
                  className="view-images-button"
                  onClick={() => handleViewImages(bus.busImages)}
                >
                  View Images
                </button>
              )}
              {bus.availableSeats > 0 && (
                <div>
                  <h4>Book Seats</h4>

                  {/* Passengers */}
                  <div>
                    <h5>Passengers (Minimum 1, Maximum 3)</h5>
                    {(bookingDetails[bus._id]?.userDetails.passengers || []).map((passenger, index) => (
                      <div key={index} className="passenger-details">
                        <input
                          type="text"
                          placeholder="Name"
                          value={passenger.name}
                          onChange={(e) => handlePassengerChange(bus._id, index, 'name', e.target.value)}
                          required
                        />
                        <input
                          type="number"
                          placeholder="Age"
                          value={passenger.age}
                          onChange={(e) => handlePassengerChange(bus._id, index, 'age', e.target.value)}
                          min="1"
                          required
                        />
                        <select
                          value={passenger.gender}
                          onChange={(e) => handlePassengerChange(bus._id, index, 'gender', e.target.value)}
                          required
                        >
                          <option value="">Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                        <input
                          type="tel"
                          placeholder="Phone (10 digits)"
                          value={passenger.phone}
                          onChange={(e) => handlePassengerChange(bus._id, index, 'phone', e.target.value)}
                          pattern="[0-9]{10}"
                          required
                        />
                        <input
                          type="email"
                          placeholder="Email"
                          value={passenger.email}
                          onChange={(e) => handlePassengerChange(bus._id, index, 'email', e.target.value)}
                          required
                        />
                        <input
                          type="tel"
                          placeholder="Parent Phone (10 digits)"
                          value={passenger.parentPhone}
                          onChange={(e) => handlePassengerChange(bus._id, index, 'parentPhone', e.target.value)}
                          pattern="[0-9]{10}"
                          required
                        />
                        <button type="button" onClick={() => removePassenger(bus._id, index)} className="remove-btn">
                          Remove
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={() => addPassenger(bus._id)} className="add-passenger-btn">
                      Add Passenger
                    </button>
                  </div>

                  {/* Seat Selection */}
                  <div>
                    <h5>Select Seats (Total: {(bookingDetails[bus._id]?.seatsBooked || []).length})</h5>
                    <div className="seat-selection">
                      {Array.from({ length: 50 }, (_, i) => i + 1).map((seat) => {
                        const isBooked = (bookingDetails[bus._id]?.bookedSeatNumbers || []).includes(seat);
                        const isSelected = (bookingDetails[bus._id]?.seatsBooked || []).includes(seat);
                        return (
                          <button
                            key={seat}
                            type="button"
                            disabled={isBooked}
                            className={isBooked ? 'booked' : isSelected ? 'selected' : 'available'}
                            onClick={() => handleSeatSelection(bus._id, seat)}
                          >
                            {seat}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleBookingSubmit(bus._id)}
                    disabled={loading || (bookingDetails[bus._id]?.userDetails.passengers || []).length === 0}
                    className="proceed-btn"
                  >
                    {loading ? 'Checking...' : 'Proceed to Payment'}
                  </button>
                </div>
              )}
            </motion.div>
          ))
        )}
      </motion.section>

      {/* Booking History */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <h2>Your Bookings</h2>
        {bookings.length === 0 ? (
          <p>No bookings yet.</p>
        ) : (
          <div className="bookings-table">
            <table>
              <thead>
                <tr>
                  <th>Bus</th>
                  <th>Route</th>
                  <th>Seats</th>
                  <th>Travel Date</th>
                  <th>Total Fare</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>
                      {booking.busId.agencyName} ({booking.busId.busNumber}) {booking.busId.isAC ? '(AC)' : '(Non-AC)'}
                    </td>
                    <td>
                      {booking.busId.fromAddress} to {booking.busId.toAddress}
                    </td>
                    <td>{booking.seatsBooked.map((s) => s.seatNumber).join(', ')}</td>
                    <td>{new Date(booking.travelDate).toLocaleDateString()}</td>
                    <td>₹{booking.totalFare}</td>
                    <td>{booking.status}</td>
                    <td>
                      {booking.status === 'Confirmed' && (
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          disabled={loading}
                          className="cancel-btn"
                        >
                          {loading ? 'Cancelling...' : 'Cancel Booking'}
                        </button>
                      )}
                      {(booking.status === 'Completed' || booking.status === 'Missed' || booking.status === 'Cancelled') && booking.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.section>

      {/* Payment Popup */}
      {showPaymentPopup && (
        <div className="payment-popup">
          <div className="payment-content">
            <h3>Process Payment (Test Mode)</h3>
            <p>Amount: ₹{buses.find((bus) => bus._id === showPaymentPopup)?.fare * (bookingDetails[showPaymentPopup]?.seatsBooked.length || 0)}</p>
            <p>Scan the QR code below to make the payment:</p>
            <img src={dummyQrCode} alt="Dummy QR Code for Payment" className="qr-code" />
            <p>Simulate payment outcome:</p>
            <button className="success-button" onClick={() => handlePayment(showPaymentPopup, true)} disabled={loading}>
              {loading ? 'Processing...' : 'Payment Success'}
            </button>
            <button className="failure-button" onClick={() => handlePayment(showPaymentPopup, false)} disabled={loading}>
              {loading ? 'Processing...' : 'Payment Failure'}
            </button>
            <button className="cancel-button" onClick={() => setShowPaymentPopup(null)} disabled={loading}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Payment Status */}
      {paymentStatus === 'success' && (
        <div className="payment-status success">
          <p>Payment Successful! Booking Confirmed.</p>
        </div>
      )}
      {paymentStatus === 'failure' && (
        <div className="payment-status failure">
          <p>Payment Failed! Booking Not Confirmed.</p>
        </div>
      )}

      {/* Image Popup */}
      {showImagePopup && (
        <div className="image-popup">
          <div className="image-content">
            <button className="close-button" onClick={handleCloseImagePopup}>
              ×
            </button>
            <div className="image-gallery">
              {selectedImages.map((image, index) => (
                <img key={index} src={image} alt={`Bus Image ${index + 1}`} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chatbot */}
      <div className="chatbot-container">
        <motion.div
          className="chatbot-toggle"
          onClick={toggleChatbot}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          💬
        </motion.div>
        {isChatbotOpen && (
          <motion.div
            className="chatbot-window"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="chatbot-header">
              <h3>Travel Assistant</h3>
              <button onClick={toggleChatbot} className="chatbot-close">×</button>
            </div>
            <div className="chatbot-messages" ref={chatContainerRef}>
              {chatMessages.map((msg, index) => (
                <div key={index} className={`chat-message ${msg.sender}`}>
                  <span>{msg.text}</span>
                </div>
              ))}
            </div>
            <form onSubmit={handleChatSubmit} className="chatbot-input-form">
              <input
                type="text"
                value={chatInput}
                onChange={handleChatInputChange}
                placeholder="Type your message..."
              />
              <button type="submit">Send</button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Userhome;