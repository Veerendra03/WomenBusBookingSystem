// // import React, { useState, useEffect } from 'react';
// // import axios from 'axios';
// // import { jwtDecode } from 'jwt-decode';
// // import '../styles/Userhome.css';

// // function Userhome() {
// //   const [user, setUser] = useState(null);
// //   const [searchParams, setSearchParams] = useState({
// //     fromAddress: '',
// //     toAddress: '',
// //     travelDate: '',
// //   });
// //   const [buses, setBuses] = useState([]);
// //   const [selectedBus, setSelectedBus] = useState(null);
// //   const [selectedSeats, setSelectedSeats] = useState([]);
// //   const [userDetails, setUserDetails] = useState({
// //     name: '',
// //     phone: '',
// //     email: '',
// //     gender: '',
// //     age: '',
// //     parentPhone: '',
// //     passengers: [
// //       { name: '', age: '', gender: '' },
// //       { name: '', age: '', gender: '' },
// //     ], // Initialize with 2 additional passengers (minimum 3 total)
// //   });
// //   const [bookings, setBookings] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState('');

// //   useEffect(() => {
// //     const token = localStorage.getItem('token');
// //     if (token) {
// //       const decoded = jwtDecode(token);
// //       setUser(decoded);
// //       fetchBookings();
// //     }
// //   }, []);

// //   const fetchBookings = async () => {
// //     try {
// //       const token = localStorage.getItem('token');
// //       const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/bookings`, {
// //         headers: { Authorization: `Bearer ${token}` },
// //       });
// //       setBookings(response.data);
// //     } catch (err) {
// //       setError('Error fetching bookings');
// //     }
// //   };

// //   const handleSearchChange = (e) => {
// //     setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
// //   };

// //   const handleSearchSubmit = async (e) => {
// //     e.preventDefault();
// //     setLoading(true);
// //     try {
// //       const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/search-buses`, {
// //         params: searchParams,
// //       });
// //       setBuses(response.data);
// //     } catch (err) {
// //       setError('Error searching buses');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleSeatSelect = (seatNumber) => {
// //     if (selectedSeats.includes(seatNumber)) {
// //       setSelectedSeats(selectedSeats.filter(seat => seat !== seatNumber));
// //     } else {
// //       setSelectedSeats([...selectedSeats, seatNumber]);
// //     }
// //   };

// //   const handleUserDetailsChange = (e) => {
// //     setUserDetails({ ...userDetails, [e.target.name]: e.target.value });
// //   };

// //   const handlePassengerChange = (index, e) => {
// //     const updatedPassengers = [...userDetails.passengers];
// //     updatedPassengers[index] = {
// //       ...updatedPassengers[index],
// //       [e.target.name]: e.target.value,
// //     };
// //     setUserDetails({ ...userDetails, passengers: updatedPassengers });
// //   };

// //   const addPassenger = () => {
// //     if (userDetails.passengers.length >= 3) {
// //       setError('Maximum 3 additional passengers allowed');
// //       return;
// //     }
// //     setUserDetails({
// //       ...userDetails,
// //       passengers: [...userDetails.passengers, { name: '', age: '', gender: '' }],
// //     });
// //   };

// //   const removePassenger = (index) => {
// //     if (userDetails.passengers.length <= 2) {
// //       setError('Minimum 2 additional passengers required');
// //       return;
// //     }
// //     const updatedPassengers = userDetails.passengers.filter((_, i) => i !== index);
// //     setUserDetails({ ...userDetails, passengers: updatedPassengers });
// //   };

// //   // const handleBookingSubmit = async (e) => {
// //   //   e.preventDefault();
// //   //   const totalPassengers = 1 + userDetails.passengers.length;
// //   //   if (selectedSeats.length !== totalPassengers) {
// //   //     setError(`Please select ${totalPassengers} seats for all passengers`);
// //   //     return;
// //   //   }

// //   //   setLoading(true);
// //   //   try {
// //   //     const token = localStorage.getItem('token');
// //   //     const seatsBooked = selectedSeats.map(seatNumber => ({ seatNumber }));
// //   //     await axios.post(
// //   //       `${import.meta.env.VITE_API_URL}/api/user/book-seats`,
// //   //       {
// //   //         busId: selectedBus._id,
// //   //         travelDate: searchParams.travelDate,
// //   //         seatsBooked,
// //   //         userDetails,
// //   //       },
// //   //       { headers: { Authorization: `Bearer ${token}` } }
// //   //     );
// //   //     alert('Booking successful! Check your email for confirmation.');
// //   //     fetchBookings();
// //   //     setSelectedBus(null);
// //   //     setSelectedSeats([]);
// //   //     setUserDetails({
// //   //       name: '',
// //   //       phone: '',
// //   //       email: '',
// //   //       gender: '',
// //   //       age: '',
// //   //       parentPhone: '',
// //   //       passengers: [
// //   //         { name: '', age: '', gender: '' },
// //   //         { name: '', age: '', gender: '' },
// //   //       ],
// //   //     });
// //   //   } catch (err) {
// //   //     setError(err.response?.data?.message || 'Error booking seats');
// //   //   } finally {
// //   //     setLoading(false);
// //   //   }
// //   // };
// //   // Inside the handleBookingSubmit function in Userhome.jsx
// // const handleBookingSubmit = async (e) => {
// //   e.preventDefault();
// //   const totalPassengers = 1 + userDetails.passengers.length;
// //   if (selectedSeats.length === 0) {
// //     setError('Please select at least one seat');
// //     return;
// //   }

// //   setLoading(true);
// //   try {
// //     const token = localStorage.getItem('token');
// //     const seatsBooked = selectedSeats.map(seatNumber => ({ seatNumber }));
// //     await axios.post(
// //       `${import.meta.env.VITE_API_URL}/api/user/book-seats`,
// //       {
// //         busId: selectedBus._id,
// //         travelDate: searchParams.travelDate,
// //         seatsBooked,
// //         userDetails, // This includes name, phone, email, gender, age, parentPhone, passengers
// //       },
// //       { headers: { Authorization: `Bearer ${token}` } }
// //     );
// //     alert('Booking successful! Check your email for confirmation.');
// //     fetchBookings();
// //     setSelectedBus(null);
// //     setSelectedSeats([]);
// //     setUserDetails({
// //       name: '',
// //       phone: '',
// //       email: '',
// //       gender: '',
// //       age: '',
// //       parentPhone: '',
// //       passengers: [
// //         { name: '', age: '', gender: '' },
// //         { name: '', age: '', gender: '' },
// //       ],
// //     });
// //   } catch (err) {
// //     setError(err.response?.data?.message || 'Error booking seats');
// //   } finally {
// //     setLoading(false);
// //   }
// // };

// //   const handleCancelBooking = async (bookingId) => {
// //     setLoading(true);
// //     try {
// //       const token = localStorage.getItem('token');
// //       await axios.put(
// //         `${import.meta.env.VITE_API_URL}/api/user/cancel-booking/${bookingId}`,
// //         {},
// //         { headers: { Authorization: `Bearer ${token}` } }
// //       );
// //       alert('Booking cancelled successfully');
// //       fetchBookings();
// //     } catch (err) {
// //       setError('Error cancelling booking');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="user-home">
// //       <h1>Hello, {user?.username || 'User'}</h1>
// //       {error && <p className="error">{error}</p>}

// //       {/* Search Buses */}
// //       <section>
// //         <h2>Search Buses</h2>
// //         <form onSubmit={handleSearchSubmit}>
// //           <div>
// //             <label>From:</label>
// //             <input
// //               type="text"
// //               name="fromAddress"
// //               value={searchParams.fromAddress}
// //               onChange={handleSearchChange}
// //               required
// //             />
// //           </div>
// //           <div>
// //             <label>To:</label>
// //             <input
// //               type="text"
// //               name="toAddress"
// //               value={searchParams.toAddress}
// //               onChange={handleSearchChange}
// //               required
// //             />
// //           </div>
// //           <div>
// //             <label>Travel Date:</label>
// //             <input
// //               type="date"
// //               name="travelDate"
// //               value={searchParams.travelDate}
// //               onChange={handleSearchChange}
// //               required
// //             />
// //           </div>
// //           <button type="submit" disabled={loading}>
// //             {loading ? 'Searching...' : 'Search'}
// //           </button>
// //         </form>
// //       </section>

// //       {/* Search Results */}
// //       {buses.length > 0 && (
// //         <section>
// //           <h2>Search Results</h2>
// //           <ul>
// //             {buses.map(bus => (
// //               <li key={bus._id}>
// //                 {bus.agencyName} - {bus.busNumber} ({bus.fromAddress} to {bus.toAddress}) | Departure: {bus.departureTime} | Arrival: {bus.arrivalTime} | Fare: ₹{bus.fare} | Type: {bus.isAC ? 'AC' : 'Non-AC'} | Available Seats: {bus.availableSeats}
// //                 <button onClick={() => setSelectedBus(bus)} disabled={bus.availableSeats < 3}>
// //                   {bus.availableSeats < 3 ? 'Not Enough Seats' : 'View Seats'}
// //                 </button>
// //               </li>
// //             ))}
// //           </ul>
// //         </section>
// //       )}

// //       {/* Seat Selection and Booking Form */}
// //       {selectedBus && (
// //         <section>
// //           <h2>Select Seats for {selectedBus.agencyName} ({selectedBus.busNumber})</h2>
// //           <div className="seat-map">
// //             {selectedBus.seats.map(seat => (
// //               <div
// //                 key={seat.seatNumber}
// //                 className={`seat ${seat.isBooked ? 'booked' : selectedSeats.includes(seat.seatNumber) ? 'selected' : 'available'}`}
// //                 onClick={() => !seat.isBooked && handleSeatSelect(seat.seatNumber)}
// //               >
// //                 {seat.seatNumber}
// //               </div>
// //             ))}
// //           </div>
// //           <p>Total Fare: ₹{selectedSeats.length * selectedBus.fare}</p>

// //           {/* Booking Form */}
// //           <form onSubmit={handleBookingSubmit}>
// //             <h3>Primary Passenger Details</h3>
// //             <div>
// //               <label>Name:</label>
// //               <input
// //                 type="text"
// //                 name="name"
// //                 value={userDetails.name}
// //                 onChange={handleUserDetailsChange}
// //                 required
// //               />
// //             </div>
// //             <div>
// //               <label>Phone:</label>
// //               <input
// //                 type="tel"
// //                 name="phone"
// //                 value={userDetails.phone}
// //                 onChange={handleUserDetailsChange}
// //                 pattern="[0-9]{10}"
// //                 required
// //               />
// //             </div>
// //             <div>
// //               <label>Email:</label>
// //               <input
// //                 type="email"
// //                 name="email"
// //                 value={userDetails.email}
// //                 onChange={handleUserDetailsChange}
// //                 required
// //               />
// //             </div>
// //             <div>
// //               <label>Gender:</label>
// //               <select name="gender" value={userDetails.gender} onChange={handleUserDetailsChange} required>
// //                 <option value="">Select Gender</option>
// //                 <option value="Male">Male</option>
// //                 <option value="Female">Female</option>
// //                 <option value="Other">Other</option>
// //               </select>
// //             </div>
// //             <div>
// //               <label>Age:</label>
// //               <input
// //                 type="number"
// //                 name="age"
// //                 value={userDetails.age}
// //                 onChange={handleUserDetailsChange}
// //                 min="1"
// //                 required
// //               />
// //             </div>
// //             <div>
// //               <label>Parent Phone:</label>
// //               <input
// //                 type="tel"
// //                 name="parentPhone"
// //                 value={userDetails.parentPhone}
// //                 onChange={handleUserDetailsChange}
// //                 pattern="[0-9]{10}"
// //                 required
// //               />
// //             </div>

// //             {/* Additional Passengers */}
// //             <h3>Additional Passengers (Minimum 2, Maximum 3)</h3>
// //             {userDetails.passengers.map((passenger, index) => (
// //               <div key={index} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
// //                 <h4>Passenger {index + 1}</h4>
// //                 <div>
// //                   <label>Name:</label>
// //                   <input
// //                     type="text"
// //                     name="name"
// //                     value={passenger.name}
// //                     onChange={(e) => handlePassengerChange(index, e)}
// //                     required
// //                   />
// //                 </div>
// //                 <div>
// //                   <label>Age:</label>
// //                   <input
// //                     type="number"
// //                     name="age"
// //                     value={passenger.age}
// //                     onChange={(e) => handlePassengerChange(index, e)}
// //                     min="1"
// //                     required
// //                   />
// //                 </div>
// //                 <div>
// //                   <label>Gender:</label>
// //                   <select
// //                     name="gender"
// //                     value={passenger.gender}
// //                     onChange={(e) => handlePassengerChange(index, e)}
// //                     required
// //                   >
// //                     <option value="">Select Gender</option>
// //                     <option value="Male">Male</option>
// //                     <option value="Female">Female</option>
// //                     <option value="Other">Other</option>
// //                   </select>
// //                 </div>
// //                 {userDetails.passengers.length > 2 && (
// //                   <button type="button" onClick={() => removePassenger(index)}>
// //                     Remove Passenger
// //                   </button>
// //                 )}
// //               </div>
// //             ))}
// //             {userDetails.passengers.length < 3 && (
// //               <button type="button" onClick={addPassenger}>
// //                 Add Another Passenger
// //               </button>
// //             )}

// //             <button type="submit" disabled={loading}>
// //               {loading ? 'Booking...' : 'Confirm Booking'}
// //             </button>
// //           </form>
// //         </section>
// //       )}

// //       {/* Booking History */}
// //       <section>
// //         <h2>Booking History</h2>
// //         {bookings.length === 0 ? (
// //           <p>No bookings yet.</p>
// //         ) : (
// //           <table>
// //             <thead>
// //               <tr>
// //                 <th>Booking ID</th>
// //                 <th>Bus</th>
// //                 <th>Route</th>
// //                 <th>Travel Date</th>
// //                 <th>Seats</th>
// //                 <th>Total Fare</th>
// //                 <th>Status</th>
// //                 <th>Actions</th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {bookings.map(booking => (
// //                 <tr key={booking._id}>
// //                   <td>{booking._id}</td>
// //                   <td>{booking.busId.agencyName} ({booking.busId.busNumber}) {booking.busId.isAC ? '(AC)' : '(Non-AC)'}</td>
// //                   <td>{booking.busId.fromAddress} to {booking.busId.toAddress}</td>
// //                   <td>{new Date(booking.travelDate).toLocaleDateString()}</td>
// //                   <td>{booking.seatsBooked.map(s => s.seatNumber).join(', ')}</td>
// //                   <td>₹{booking.totalFare}</td>
// //                   <td>{booking.status}</td>
// //                   <td>
// //                     {booking.status === 'Confirmed' && (
// //                       <button onClick={() => handleCancelBooking(booking._id)} disabled={loading}>
// //                         Cancel
// //                       </button>
// //                     )}
// //                     {(booking.status === 'Completed' || booking.status === 'Missed') && booking.status}
// //                   </td>
// //                 </tr>
// //               ))}
// //             </tbody>
// //           </table>
// //         )}
// //       </section>
// //     </div>
// //   );
// // }

// // export default Userhome;
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { jwtDecode } from 'jwt-decode';
// import '../styles/Userhome.css';

// function Userhome() {
//   const [user, setUser] = useState(null);
//   const [searchParams, setSearchParams] = useState({
//     fromAddress: '',
//     toAddress: '',
//     travelDate: '',
//   });
//   const [buses, setBuses] = useState([]);
//   const [bookings, setBookings] = useState([]);
//   const [bookingDetails, setBookingDetails] = useState({
//     busId: '',
//     travelDate: '',
//     seatsBooked: [],
//     userDetails: {
//       name: '',
//       phone: '',
//       email: '',
//       gender: '',
//       age: '',
//       parentPhone: '',
//       passengers: [],
//     },
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       try {
//         const decoded = jwtDecode(token);
//         setUser(decoded);
//         fetchBookings();
//       } catch (err) {
//         setError('Invalid token. Please log in again.');
//         localStorage.removeItem('token');
//       }
//     }
//   }, []);

//   const fetchBookings = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/bookings`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setBookings(response.data);
//     } catch (err) {
//       setError(err.response?.data?.message || 'Error fetching bookings');
//     }
//   };

//   const handleSearchChange = (e) => {
//     setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
//   };

//   const handleSearchSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/search-buses`, {
//         params: searchParams,
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setBuses(response.data);
//     } catch (err) {
//       setError(err.response?.data?.message || 'Error searching buses');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBookingChange = (e) => {
//     const { name, value } = e.target;
//     if (name.startsWith('userDetails.')) {
//       const field = name.split('.')[1];
//       setBookingDetails({
//         ...bookingDetails,
//         userDetails: { ...bookingDetails.userDetails, [field]: value },
//       });
//     } else {
//       setBookingDetails({ ...bookingDetails, [name]: value });
//     }
//   };

//   const handlePassengerChange = (index, field, value) => {
//     const updatedPassengers = [...bookingDetails.userDetails.passengers];
//     updatedPassengers[index] = { ...updatedPassengers[index], [field]: value };
//     setBookingDetails({
//       ...bookingDetails,
//       userDetails: { ...bookingDetails.userDetails, passengers: updatedPassengers },
//     });
//   };

//   const addPassenger = () => {
//     if (bookingDetails.userDetails.passengers.length >= 3) {
//       setError('Maximum 3 additional passengers allowed');
//       return;
//     }
//     setBookingDetails({
//       ...bookingDetails,
//       userDetails: {
//         ...bookingDetails.userDetails,
//         passengers: [...bookingDetails.userDetails.passengers, { name: '', age: '', gender: '' }],
//       },
//     });
//   };

//   const removePassenger = (index) => {
//     const updatedPassengers = bookingDetails.userDetails.passengers.filter((_, i) => i !== index);
//     setBookingDetails({
//       ...bookingDetails,
//       userDetails: { ...bookingDetails.userDetails, passengers: updatedPassengers },
//     });
//   };

//   const handleSeatSelection = (seatNumber) => {
//     const seats = bookingDetails.seatsBooked.includes(seatNumber)
//       ? bookingDetails.seatsBooked.filter((seat) => seat !== seatNumber)
//       : [...bookingDetails.seatsBooked, seatNumber];
//     setBookingDetails({ ...bookingDetails, seatsBooked: seats });
//   };

//   const handleBookingSubmit = async (busId) => {
//     setLoading(true);
//     setError('');

//     const totalPassengers = 1 + bookingDetails.userDetails.passengers.length;
//     if (bookingDetails.seatsBooked.length !== totalPassengers) {
//       setError(`Please select ${totalPassengers} seats for all passengers`);
//       setLoading(false);
//       return;
//     }

//     if (bookingDetails.userDetails.passengers.length < 1) {
//       setError('At least 1 additional passenger is required');
//       setLoading(false);
//       return;
//     }

//     try {
//       const token = localStorage.getItem('token');
//       const payload = {
//         busId,
//         travelDate: searchParams.travelDate,
//         seatsBooked: bookingDetails.seatsBooked.map((seatNumber) => ({ seatNumber })),
//         userDetails: bookingDetails.userDetails,
//       };
//       await axios.post(`${import.meta.env.VITE_API_URL}/api/user/book-seats`, payload, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       alert('Booking successful! Check your email and WhatsApp for confirmation.');
//       fetchBookings();
//       setBookingDetails({
//         busId: '',
//         travelDate: '',
//         seatsBooked: [],
//         userDetails: {
//           name: '',
//           phone: '',
//           email: '',
//           gender: '',
//           age: '',
//           parentPhone: '',
//           passengers: [],
//         },
//       });
//     } catch (err) {
//       setError(err.response?.data?.message || 'Error booking seats');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCancelBooking = async (bookingId) => {
//     setLoading(true);
//     setError('');
//     try {
//       const token = localStorage.getItem('token');
//       await axios.put(
//         `${import.meta.env.VITE_API_URL}/api/user/cancel-booking/${bookingId}`,
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       alert('Booking cancelled successfully');
//       fetchBookings();
//     } catch (err) {
//       setError(err.response?.data?.message || 'Error cancelling booking');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="user-home">
//       <h1>Hello, {user?.username || 'User'}</h1>
//       {error && <p className="error">{error}</p>}

//       {/* Search Buses Form */}
//       <section>
//         <h2>Search Buses</h2>
//         <form onSubmit={handleSearchSubmit}>
//           <div>
//             <label>From:</label>
//             <input
//               type="text"
//               name="fromAddress"
//               value={searchParams.fromAddress}
//               onChange={handleSearchChange}
//               required
//             />
//           </div>
//           <div>
//             <label>To:</label>
//             <input
//               type="text"
//               name="toAddress"
//               value={searchParams.toAddress}
//               onChange={handleSearchChange}
//               required
//             />
//           </div>
//           <div>
//             <label>Travel Date:</label>
//             <input
//               type="date"
//               name="travelDate"
//               value={searchParams.travelDate}
//               onChange={handleSearchChange}
//               required
//             />
//           </div>
//           <button type="submit" disabled={loading}>
//             {loading ? 'Searching...' : 'Search Buses'}
//           </button>
//         </form>
//       </section>

//       {/* List of Available Buses */}
//       <section>
//         <h2>Available Buses</h2>
//         {buses.length === 0 ? (
//           <p>No buses found.</p>
//         ) : (
//           buses.map((bus) => (
//             <div key={bus._id} className="bus-card">
//               <h3>
//                 {bus.agencyName} - {bus.busNumber} ({bus.isAC ? 'AC' : 'Non-AC'})
//               </h3>
//               <p>
//                 Route: {bus.fromAddress} to {bus.toAddress} | Departure: {bus.departureTime} | Arrival: {bus.arrivalTime} | Fare: ₹{bus.fare} per seat | Available Seats: {bus.availableSeats}
//               </p>
//               {bus.availableSeats > 0 && (
//                 <div>
//                   <h4>Book Seats</h4>
//                   <div>
//                     <label>Name:</label>
//                     <input
//                       type="text"
//                       name="userDetails.name"
//                       value={bookingDetails.userDetails.name}
//                       onChange={handleBookingChange}
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label>Phone:</label>
//                     <input
//                       type="tel"
//                       name="userDetails.phone"
//                       value={bookingDetails.userDetails.phone}
//                       onChange={handleBookingChange}
//                       pattern="[0-9]{10}"
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label>Email:</label>
//                     <input
//                       type="email"
//                       name="userDetails.email"
//                       value={bookingDetails.userDetails.email}
//                       onChange={handleBookingChange}
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label>Gender:</label>
//                     <select
//                       name="userDetails.gender"
//                       value={bookingDetails.userDetails.gender}
//                       onChange={handleBookingChange}
//                       required
//                     >
//                       <option value="">Select</option>
//                       <option value="Male">Male</option>
//                       <option value="Female">Female</option>
//                       <option value="Other">Other</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label>Age:</label>
//                     <input
//                       type="number"
//                       name="userDetails.age"
//                       value={bookingDetails.userDetails.age}
//                       onChange={handleBookingChange}
//                       min="1"
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label>Parent Phone:</label>
//                     <input
//                       type="tel"
//                       name="userDetails.parentPhone"
//                       value={bookingDetails.userDetails.parentPhone}
//                       onChange={handleBookingChange}
//                       pattern="[0-9]{10}"
//                       required
//                     />
//                   </div>

//                   {/* Additional Passengers */}
//                   <div>
//                     <h5>Additional Passengers (1 to 3)</h5>
//                     {bookingDetails.userDetails.passengers.map((passenger, index) => (
//                       <div key={index} className="passenger-details">
//                         <input
//                           type="text"
//                           placeholder="Name"
//                           value={passenger.name}
//                           onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
//                           required
//                         />
//                         <input
//                           type="number"
//                           placeholder="Age"
//                           value={passenger.age}
//                           onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
//                           min="1"
//                           required
//                         />
//                         <select
//                           value={passenger.gender}
//                           onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
//                           required
//                         >
//                           <option value="">Gender</option>
//                           <option value="Male">Male</option>
//                           <option value="Female">Female</option>
//                           <option value="Other">Other</option>
//                         </select>
//                         <button type="button" onClick={() => removePassenger(index)}>
//                           Remove
//                         </button>
//                       </div>
//                     ))}
//                     <button type="button" onClick={addPassenger}>
//                       Add Passenger
//                     </button>
//                   </div>

//                   {/* Seat Selection */}
//                   <div>
//                     <h5>Select Seats (Total: {1 + bookingDetails.userDetails.passengers.length})</h5>
//                     <div className="seat-selection">
//                       {Array.from({ length: 50 }, (_, i) => i + 1).map((seat) => {
//                         const isBooked = bus.seats.find((s) => s.seatNumber === seat)?.isBooked;
//                         const isSelected = bookingDetails.seatsBooked.includes(seat);
//                         return (
//                           <button
//                             key={seat}
//                             type="button"
//                             disabled={isBooked}
//                             className={isSelected ? 'selected' : ''}
//                             onClick={() => handleSeatSelection(seat)}
//                           >
//                             {seat}
//                           </button>
//                         );
//                       })}
//                     </div>
//                   </div>

//                   <button
//                     type="button"
//                     onClick={() => handleBookingSubmit(bus._id)}
//                     disabled={loading}
//                   >
//                     {loading ? 'Booking...' : 'Book Now'}
//                   </button>
//                 </div>
//               )}
//             </div>
//           ))
//         )}
//       </section>

//       {/* Booking History */}
//       <section>
//         <h2>Your Bookings</h2>
//         {bookings.length === 0 ? (
//           <p>No bookings yet.</p>
//         ) : (
//           <table>
//             <thead>
//               <tr>
//                 <th>Bus</th>
//                 <th>Route</th>
//                 <th>Seats</th>
//                 <th>Travel Date</th>
//                 <th>Total Fare</th>
//                 <th>Status</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {bookings.map((booking) => (
//                 <tr key={booking._id}>
//                   <td>
//                     {booking.busId.agencyName} ({booking.busId.busNumber}) {booking.busId.isAC ? '(AC)' : '(Non-AC)'}
//                   </td>
//                   <td>
//                     {booking.busId.fromAddress} to {booking.busId.toAddress}
//                   </td>
//                   <td>{booking.seatsBooked.map((s) => s.seatNumber).join(', ')}</td>
//                   <td>{new Date(booking.travelDate).toLocaleDateString()}</td>
//                   <td>₹{booking.totalFare}</td>
//                   <td>{booking.status}</td>
//                   <td>
//                     {booking.status === 'Confirmed' && (
//                       <button
//                         onClick={() => handleCancelBooking(booking._id)}
//                         disabled={loading}
//                       >
//                         {loading ? 'Cancelling...' : 'Cancel Booking'}
//                       </button>
//                     )}
//                     {(booking.status === 'Completed' || booking.status === 'Missed' || booking.status === 'Cancelled') && booking.status}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </section>
//     </div>
//   );
// }

// export default Userhome;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import '../styles/Userhome.css';

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
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

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
      // Reset booking details for all buses
      const initialBookingDetails = {};
      response.data.forEach((bus) => {
        initialBookingDetails[bus._id] = {
          busId: bus._id,
          travelDate: searchParams.travelDate,
          seatsBooked: [],
          userDetails: { passengers: [] },
        };
      });
      setBookingDetails(initialBookingDetails);
    } catch (err) {
      setError(err.response?.data?.message || 'Error searching buses');
    } finally {
      setLoading(false);
    }
  };

  const addPassenger = (busId) => {
    const busBooking = bookingDetails[busId] || {
      busId,
      travelDate: searchParams.travelDate,
      seatsBooked: [],
      userDetails: { passengers: [] },
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
        seatsBooked: busBooking.seatsBooked.slice(0, updatedPassengers.length), // Adjust seats if passengers are reduced
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

  const handleSeatSelection = (busId, seatNumber) => {
    const bus = buses.find((b) => b._id === busId);
    const busBooking = bookingDetails[busId];
    const bookedSeatNumbers = bus.seats
      .filter((seat) => seat.isBooked)
      .map((seat) => seat.seatNumber);

    if (bookedSeatNumbers.includes(seatNumber)) {
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
        setLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error checking seat availability');
      setLoading(false);
    }
  };

  const handlePayment = async (busId, paymentSuccess) => {
    setLoading(true);
    setShowPaymentPopup(false);
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
        await axios.post(`${import.meta.env.VITE_API_URL}/api/user/book-seats`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPaymentStatus('success');
        alert('Booking successful! Check your email and WhatsApp for confirmation.');
        fetchBookings();
        setBookingDetails((prev) => ({
          ...prev,
          [busId]: {
            busId,
            travelDate: searchParams.travelDate,
            seatsBooked: [],
            userDetails: { passengers: [] },
          },
        }));
      } catch (err) {
        setError(err.response?.data?.message || 'Error booking seats');
        setPaymentStatus('failure');
      }
    } else {
      setPaymentStatus('failure');
    }
    setLoading(false);
  };

  const handleCancelBooking = async (bookingId) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.put(
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

  return (
    <div className="user-home">
      <h1>Hello, {user?.username || 'User'}</h1>
      {error && <p className="error">{error}</p>}

      {/* Search Buses Form */}
      <section>
        <h2>Search Buses</h2>
        <form onSubmit={handleSearchSubmit}>
          <div>
            <label>From:</label>
            <input
              type="text"
              name="fromAddress"
              value={searchParams.fromAddress}
              onChange={handleSearchChange}
              required
            />
          </div>
          <div>
            <label>To:</label>
            <input
              type="text"
              name="toAddress"
              value={searchParams.toAddress}
              onChange={handleSearchChange}
              required
            />
          </div>
          <div>
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
          <button type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search Buses'}
          </button>
        </form>
      </section>

      {/* List of Available Buses */}
      <section>
        <h2>Available Buses</h2>
        {buses.length === 0 ? (
          <p>No buses found.</p>
        ) : (
          buses.map((bus) => (
            <div key={bus._id} className="bus-card">
              <h3>
                {bus.agencyName} - {bus.busNumber} ({bus.isAC ? 'AC' : 'Non-AC'})
              </h3>
              <p>
                Route: {bus.fromAddress} to {bus.toAddress} | Departure: {bus.departureTime} | Arrival: {bus.arrivalTime} | Fare: ₹{bus.fare} per seat | Available Seats: {bus.availableSeats}
              </p>
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
                        <button type="button" onClick={() => removePassenger(bus._id, index)}>
                          Remove
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={() => addPassenger(bus._id)}>
                      Add Passenger
                    </button>
                  </div>

                  {/* Seat Selection */}
                  <div>
                    <h5>Select Seats (Total: {(bookingDetails[bus._id]?.seatsBooked || []).length})</h5>
                    <div className="seat-selection">
                      {Array.from({ length: 50 }, (_, i) => i + 1).map((seat) => {
                        const bookedSeatNumbers = bus.seats
                          .filter((s) => s.isBooked)
                          .map((s) => s.seatNumber);
                        const isBooked = bookedSeatNumbers.includes(seat);
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
                  >
                    {loading ? 'Checking...' : 'Book Now'}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </section>

      {/* Booking History */}
      <section>
        <h2>Your Bookings</h2>
        {bookings.length === 0 ? (
          <p>No bookings yet.</p>
        ) : (
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
        )}
      </section>

      {/* Payment Popup */}
      {showPaymentPopup && (
        <div className="payment-popup">
          <div className="payment-content">
            <h3>Process Payment</h3>
            <p>Amount: ₹{buses.find((bus) => bus._id === showPaymentPopup)?.fare * (bookingDetails[showPaymentPopup]?.seatsBooked.length || 0)}</p>
            <button onClick={() => handlePayment(showPaymentPopup, true)}>Pay Now</button>
            <button onClick={() => handlePayment(showPaymentPopup, false)}>Cancel</button>
          </div>
        </div>
      )}

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
    </div>
  );
}

export default Userhome;