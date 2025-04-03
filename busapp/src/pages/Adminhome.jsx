// // import React, { useState, useEffect } from 'react';
// // import axios from 'axios';
// // import { jwtDecode } from 'jwt-decode';
// // import '../styles/Adminhome.css';

// // function Adminhome() {
// //   const [admin, setAdmin] = useState(null);
// //   const [agencyDetails, setAgencyDetails] = useState({
// //     agencyName: '',
// //     adminName: '',
// //     adminPhone: '',
// //   });
// //   const [busDetails, setBusDetails] = useState({
// //     busNumber: '',
// //     fromAddress: '',
// //     toAddress: '',
// //     departureTime: '',
// //     arrivalTime: '',
// //     fare: '',
// //     isAC: false,
// //   });
// //   const [buses, setBuses] = useState([]);
// //   const [bookings, setBookings] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState('');
// //   const [imageFiles, setImageFiles] = useState([]);

// //   useEffect(() => {
// //     const token = localStorage.getItem('token');
// //     const storedUsername = localStorage.getItem('username');
// //     if (token) {
// //       const decoded = jwtDecode(token);
// //       setAdmin({ ...decoded, username: storedUsername || decoded.username || 'Admin' });
// //       fetchAdminProfile();
// //       fetchBuses();
// //       fetchBookings();
// //     }
// //   }, []);

// //   const fetchAdminProfile = async () => {
// //     try {
// //       const token = localStorage.getItem('token');
// //       const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/profile`, {
// //         headers: { Authorization: `Bearer ${token}` },
// //       });
// //       setAgencyDetails({
// //         agencyName: response.data.agencyName || '',
// //         adminName: response.data.adminName || '',
// //         adminPhone: response.data.adminPhone || '',
// //       });
// //     } catch (err) {
// //       setError('Error fetching profile');
// //     }
// //   };

// //   const fetchBuses = async () => {
// //     try {
// //       const token = localStorage.getItem('token');
// //       const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/bookings`, {
// //         headers: { Authorization: `Bearer ${token}` },
// //       });
// //       setBuses(response.data);
// //     } catch (err) {
// //       setError('Error fetching buses');
// //     }
// //   };

// //   const fetchBookings = async () => {
// //     try {
// //       const token = localStorage.getItem('token');
// //       const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/bookings`, {
// //         headers: { Authorization: `Bearer ${token}` },
// //       });
// //       setBookings(response.data);
// //     } catch (err) {
// //       setError('Error fetching bookings');
// //     }
// //   };

// //   const handleAgencyChange = (e) => {
// //     setAgencyDetails({ ...agencyDetails, [e.target.name]: e.target.value });
// //   };

// //   const handleBusChange = (e) => {
// //     const { name, value, type, checked } = e.target;
// //     setBusDetails({
// //       ...busDetails,
// //       [name]: type === 'checkbox' ? checked : value,
// //     });
// //   };

// //   const handleImageChange = (e) => {
// //     setImageFiles(Array.from(e.target.files));
// //   };

// //   const handleAgencySubmit = async (e) => {
// //     e.preventDefault();
// //     setLoading(true);
// //     try {
// //       const token = localStorage.getItem('token');
// //       await axios.put(
// //         `${import.meta.env.VITE_API_URL}/api/admin/update-profile`,
// //         agencyDetails,
// //         { headers: { Authorization: `Bearer ${token}` } }
// //       );
// //       alert('Profile updated successfully');
// //     } catch (err) {
// //       setError('Error updating profile');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleBusSubmit = async (e) => {
// //     e.preventDefault();
// //     setLoading(true);
// //     try {
// //       const token = localStorage.getItem('token');
// //       const formData = new FormData();
// //       formData.append('busNumber', busDetails.busNumber);
// //       formData.append('fromAddress', busDetails.fromAddress);
// //       formData.append('toAddress', busDetails.toAddress);
// //       formData.append('departureTime', busDetails.departureTime);
// //       formData.append('arrivalTime', busDetails.arrivalTime);
// //       formData.append('fare', busDetails.fare);
// //       formData.append('isAC', busDetails.isAC);
// //       imageFiles.forEach((file) => {
// //         formData.append('busImages', file);
// //       });

// //       await axios.post(
// //         `${import.meta.env.VITE_API_URL}/api/admin/add-bus`,
// //         formData,
// //         {
// //           headers: {
// //             Authorization: `Bearer ${token}`,
// //             'Content-Type': 'multipart/form-data',
// //           },
// //         }
// //       );
// //       alert('Bus added successfully');
// //       fetchBuses();
// //       setBusDetails({
// //         busNumber: '',
// //         fromAddress: '',
// //         toAddress: '',
// //         departureTime: '',
// //         arrivalTime: '',
// //         fare: '',
// //         isAC: false,
// //       });
// //       setImageFiles([]);
// //     } catch (err) {
// //       setError(err.response?.data?.message || 'Error adding bus');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleUpdateBookingStatus = async (bookingId, status) => {
// //     setLoading(true);
// //     try {
// //       const token = localStorage.getItem('token');
// //       const response = await axios.put(
// //         `${import.meta.env.VITE_API_URL}/api/admin/update-booking-status/${bookingId}`,
// //         { status },
// //         { headers: { Authorization: `Bearer ${token}` } }
// //       );
// //       alert(response.data.message);
// //       fetchBookings();
// //     } catch (err) {
// //       setError(err.response?.data?.message || 'Error updating booking status');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="admin-home">
// //       <h1>Hello, {admin?.username || 'Admin'}</h1>
// //       {error && <p className="error">{error}</p>}

// //       {/* Agency Details Form */}
// //       <section>
// //         <h2>Update Agency Details</h2>
// //         <form onSubmit={handleAgencySubmit}>
// //           <div>
// //             <label>Agency Name:</label>
// //             <input
// //               type="text"
// //               name="agencyName"
// //               value={agencyDetails.agencyName}
// //               onChange={handleAgencyChange}
// //               required
// //             />
// //           </div>
// //           <div>
// //             <label>Admin Name:</label>
// //             <input
// //               type="text"
// //               name="adminName"
// //               value={agencyDetails.adminName}
// //               onChange={handleAgencyChange}
// //               required
// //             />
// //           </div>
// //           <div>
// //             <label>Admin Phone:</label>
// //             <input
// //               type="tel"
// //               name="adminPhone"
// //               value={agencyDetails.adminPhone}
// //               onChange={handleAgencyChange}
// //               pattern="[0-9]{10}"
// //               required
// //             />
// //           </div>
// //           <button type="submit" disabled={loading}>
// //             {loading ? 'Updating...' : 'Update Profile'}
// //           </button>
// //         </form>
// //       </section>

// //       {/* Add Bus Form */}
// //       <section>
// //         <h2>Add a Bus</h2>
// //         <form onSubmit={handleBusSubmit}>
// //           <div>
// //             <label>Bus Number:</label>
// //             <input
// //               type="text"
// //               name="busNumber"
// //               value={busDetails.busNumber}
// //               onChange={handleBusChange}
// //               required
// //             />
// //           </div>
// //           <div>
// //             <label>Departure Address:</label>
// //             <input
// //               type="text"
// //               name="fromAddress"
// //               value={busDetails.fromAddress}
// //               onChange={handleBusChange}
// //               required
// //             />
// //           </div>
// //           <div>
// //             <label>Destination Address:</label>
// //             <input
// //               type="text"
// //               name="toAddress"
// //               value={busDetails.toAddress}
// //               onChange={handleBusChange}
// //               required
// //             />
// //           </div>
// //           <div>
// //             <label>Departure Time (HH:MM):</label>
// //             <input
// //               type="text"
// //               name="departureTime"
// //               value={busDetails.departureTime}
// //               onChange={handleBusChange}
// //               placeholder="e.g., 14:30"
// //               required
// //             />
// //           </div>
// //           <div>
// //             <label>Arrival Time (HH:MM):</label>
// //             <input
// //               type="text"
// //               name="arrivalTime"
// //               value={busDetails.arrivalTime}
// //               onChange={handleBusChange}
// //               placeholder="e.g., 18:30"
// //               required
// //             />
// //           </div>
// //           <div>
// //             <label>Fare per Seat (₹):</label>
// //             <input
// //               type="number"
// //               name="fare"
// //               value={busDetails.fare}
// //               onChange={handleBusChange}
// //               required
// //             />
// //           </div>
// //           <div>
// //             <label>
// //               <input
// //                 type="checkbox"
// //                 name="isAC"
// //                 checked={busDetails.isAC}
// //                 onChange={handleBusChange}
// //               />
// //               Is AC Bus?
// //             </label>
// //           </div>
// //           <div>
// //             <label>Upload Bus Images:</label>
// //             <input
// //               type="file"
// //               name="busImages"
// //               multiple
// //               onChange={handleImageChange}
// //               accept="image/*"
// //             />
// //           </div>
// //           <button type="submit" disabled={loading}>
// //             {loading ? 'Adding...' : 'Add Bus'}
// //           </button>
// //         </form>
// //       </section>

// //       {/* List of Buses */}
// //       <section>
// //         <h2>Your Buses</h2>
// //         {buses.length === 0 ? (
// //           <p>No buses added yet.</p>
// //         ) : (
// //           <ul>
// //             {buses.map(bus => (
// //               <li key={bus._id}>
// //                 {bus.agencyName} - {bus.busNumber} (Departure: {bus.fromAddress} to Destination: {bus.toAddress}) | Departure Time: {bus.departureTime} | Arrival Time: {bus.arrivalTime} | Fare: ₹{bus.fare} | Type: {bus.isAC ? 'AC' : 'Non-AC'} | Seat Numbers: 1-50
// //               </li>
// //             ))}
// //           </ul>
// //         )}
// //       </section>

// //       {/* List of Bookings */}
// //       <section>
// //         <h2>Bookings for Your Agency</h2>
// //         {bookings.length === 0 ? (
// //           <p>No bookings yet.</p>
// //         ) : (
// //           <table>
// //             <thead>
// //               <tr>
// //                 <th>User</th>
// //                 <th>Bus</th>
// //                 <th>Seat Numbers</th>
// //                 <th>Travel Date</th>
// //                 <th>Total Fare</th>
// //                 <th>Status</th>
// //                 <th>Actions</th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {bookings.map(booking => (
// //                 <tr key={booking._id}>
// //                   <td>{booking.userId?.username || 'Unknown User'}</td>
// //                   <td>{booking.busId.agencyName} ({booking.busId.busNumber}) {booking.busId.isAC ? '(AC)' : '(Non-AC)'}</td>
// //                   <td>{booking.seatsBooked.map(s => s.seatNumber).join(', ')}</td>
// //                   <td>{new Date(booking.travelDate).toLocaleDateString()}</td>
// //                   <td>₹{booking.totalFare}</td>
// //                   <td>{booking.status}</td>
// //                   <td>
// //                     {booking.status === 'Confirmed' && (
// //                       <>
// //                         <button
// //                           onClick={() => handleUpdateBookingStatus(booking._id, 'Done')}
// //                           disabled={loading}
// //                           style={{ marginRight: '10px' }}
// //                         >
// //                           {loading ? 'Processing...' : 'Done'}
// //                         </button>
// //                         <button
// //                           onClick={() => handleUpdateBookingStatus(booking._id, 'Not Done')}
// //                           disabled={loading}
// //                         >
// //                           {loading ? 'Processing...' : 'Not Done'}
// //                         </button>
// //                       </>
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

// // export default Adminhome;
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { jwtDecode } from 'jwt-decode';
// import '../styles/Adminhome.css';

// function Adminhome() {
//   const [admin, setAdmin] = useState(null);
//   const [agencyDetails, setAgencyDetails] = useState({
//     agencyName: '',
//     adminName: '',
//     adminPhone: '',
//   });
//   const [busDetails, setBusDetails] = useState({
//     busNumber: '',
//     fromAddress: '',
//     toAddress: '',
//     departureTime: '',
//     arrivalTime: '',
//     fare: '',
//     isAC: false,
//   });
//   const [buses, setBuses] = useState([]);
//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [imageFiles, setImageFiles] = useState([]);

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     const storedUsername = localStorage.getItem('username');
//     if (token) {
//       try {
//         const decoded = jwtDecode(token);
//         setAdmin({ ...decoded, username: storedUsername || decoded.username || 'Admin' });
//         fetchAdminProfile();
//         fetchBuses();
//         fetchBookings();
//       } catch (err) {
//         setError('Invalid token. Please log in again.');
//         localStorage.removeItem('token');
//         localStorage.removeItem('username');
//       }
//     }
//   }, []);

//   const fetchAdminProfile = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/profile`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setAgencyDetails({
//         agencyName: response.data.agencyName || '',
//         adminName: response.data.adminName || '',
//         adminPhone: response.data.adminPhone || '',
//       });
//     } catch (err) {
//       setError(err.response?.data?.message || 'Error fetching profile');
//     }
//   };

//   const fetchBuses = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/buses`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setBuses(response.data);
//     } catch (err) {
//       setError(err.response?.data?.message || 'Error fetching buses');
//     }
//   };

//   const fetchBookings = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/bookings`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setBookings(response.data);
//     } catch (err) {
//       setError(err.response?.data?.message || 'Error fetching bookings');
//     }
//   };

//   const handleAgencyChange = (e) => {
//     setAgencyDetails({ ...agencyDetails, [e.target.name]: e.target.value });
//   };

//   const handleBusChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setBusDetails({
//       ...busDetails,
//       [name]: type === 'checkbox' ? checked : value,
//     });
//   };

//   const handleImageChange = (e) => {
//     setImageFiles(Array.from(e.target.files));
//   };

//   const validateTimeFormat = (time) => {
//     const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
//     return timeRegex.test(time);
//   };

//   const handleAgencySubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
//     try {
//       const token = localStorage.getItem('token');
//       await axios.put(
//         `${import.meta.env.VITE_API_URL}/api/admin/update-profile`,
//         agencyDetails,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       alert('Profile updated successfully');
//     } catch (err) {
//       setError(err.response?.data?.message || 'Error updating profile');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBusSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     // Validate time format
//     if (!validateTimeFormat(busDetails.departureTime)) {
//       setError('Departure time must be in HH:MM format (e.g., 14:30)');
//       setLoading(false);
//       return;
//     }
//     if (!validateTimeFormat(busDetails.arrivalTime)) {
//       setError('Arrival time must be in HH:MM format (e.g., 18:30)');
//       setLoading(false);
//       return;
//     }

//     try {
//       const token = localStorage.getItem('token');
//       const formData = new FormData();
//       formData.append('busNumber', busDetails.busNumber);
//       formData.append('fromAddress', busDetails.fromAddress);
//       formData.append('toAddress', busDetails.toAddress);
//       formData.append('departureTime', busDetails.departureTime);
//       formData.append('arrivalTime', busDetails.arrivalTime);
//       formData.append('fare', busDetails.fare);
//       formData.append('isAC', busDetails.isAC);
//       imageFiles.forEach((file) => {
//         formData.append('busImages', file);
//       });

//       await axios.post(
//         `${import.meta.env.VITE_API_URL}/api/admin/add-bus`,
//         formData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'multipart/form-data',
//           },
//         }
//       );
//       alert('Bus added successfully');
//       fetchBuses();
//       setBusDetails({
//         busNumber: '',
//         fromAddress: '',
//         toAddress: '',
//         departureTime: '',
//         arrivalTime: '',
//         fare: '',
//         isAC: false,
//       });
//       setImageFiles([]);
//     } catch (err) {
//       setError(err.response?.data?.message || 'Error adding bus');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleUpdateBookingStatus = async (bookingId, status) => {
//     setLoading(true);
//     setError('');
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.put(
//         `${import.meta.env.VITE_API_URL}/api/admin/update-booking-status/${bookingId}`,
//         { status },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       alert(response.data.message);
//       fetchBookings();
//     } catch (err) {
//       setError(err.response?.data?.message || 'Error updating booking status');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="admin-home">
//       <h1>Hello, {admin?.username || 'Admin'}</h1>
//       {error && <p className="error">{error}</p>}

//       {/* Agency Details Form */}
//       <section>
//         <h2>Update Agency Details</h2>
//         <form onSubmit={handleAgencySubmit}>
//           <div>
//             <label>Agency Name:</label>
//             <input
//               type="text"
//               name="agencyName"
//               value={agencyDetails.agencyName}
//               onChange={handleAgencyChange}
//               required
//             />
//           </div>
//           <div>
//             <label>Admin Name:</label>
//             <input
//               type="text"
//               name="adminName"
//               value={agencyDetails.adminName}
//               onChange={handleAgencyChange}
//               required
//             />
//           </div>
//           <div>
//             <label>Admin Phone:</label>
//             <input
//               type="tel"
//               name="adminPhone"
//               value={agencyDetails.adminPhone}
//               onChange={handleAgencyChange}
//               pattern="[0-9]{10}"
//               required
//             />
//           </div>
//           <button type="submit" disabled={loading}>
//             {loading ? 'Updating...' : 'Update Profile'}
//           </button>
//         </form>
//       </section>

//       {/* Add Bus Form */}
//       <section>
//         <h2>Add a Bus</h2>
//         <form onSubmit={handleBusSubmit}>
//           <div>
//             <label>Bus Number:</label>
//             <input
//               type="text"
//               name="busNumber"
//               value={busDetails.busNumber}
//               onChange={handleBusChange}
//               required
//             />
//           </div>
//           <div>
//             <label>Departure Address:</label>
//             <input
//               type="text"
//               name="fromAddress"
//               value={busDetails.fromAddress}
//               onChange={handleBusChange}
//               required
//             />
//           </div>
//           <div>
//             <label>Destination Address:</label>
//             <input
//               type="text"
//               name="toAddress"
//               value={busDetails.toAddress}
//               onChange={handleBusChange}
//               required
//             />
//           </div>
//           <div>
//             <label>Departure Time (HH:MM):</label>
//             <input
//               type="text"
//               name="departureTime"
//               value={busDetails.departureTime}
//               onChange={handleBusChange}
//               placeholder="e.g., 14:30"
//               required
//             />
//           </div>
//           <div>
//             <label>Arrival Time (HH:MM):</label>
//             <input
//               type="text"
//               name="arrivalTime"
//               value={busDetails.arrivalTime}
//               onChange={handleBusChange}
//               placeholder="e.g., 18:30"
//               required
//             />
//           </div>
//           <div>
//             <label>Fare per Seat (₹):</label>
//             <input
//               type="number"
//               name="fare"
//               value={busDetails.fare}
//               onChange={handleBusChange}
//               min="1"
//               required
//             />
//           </div>
//           <div>
//             <label>
//               <input
//                 type="checkbox"
//                 name="isAC"
//                 checked={busDetails.isAC}
//                 onChange={handleBusChange}
//               />
//               Is AC Bus?
//             </label>
//           </div>
//           <div>
//             <label>Upload Bus Images (up to 5):</label>
//             <input
//               type="file"
//               name="busImages"
//               multiple
//               onChange={handleImageChange}
//               accept="image/*"
//             />
//           </div>
//           <button type="submit" disabled={loading}>
//             {loading ? 'Adding...' : 'Add Bus'}
//           </button>
//         </form>
//       </section>

//       {/* List of Buses */}
//       <section>
//         <h2>Your Buses</h2>
//         {buses.length === 0 ? (
//           <p>No buses added yet.</p>
//         ) : (
//           <ul>
//             {buses.map((bus) => (
//               <li key={bus._id}>
//                 {bus.agencyName} - {bus.busNumber} (Departure: {bus.fromAddress} to Destination: {bus.toAddress}) | Departure Time: {bus.departureTime} | Arrival Time: {bus.arrivalTime} | Fare: ₹{bus.fare} | Type: {bus.isAC ? 'AC' : 'Non-AC'} | Seat Numbers: 1-50
//               </li>
//             ))}
//           </ul>
//         )}
//       </section>

//       {/* List of Bookings */}
//       <section>
//         <h2>Bookings for Your Agency</h2>
//         {bookings.length === 0 ? (
//           <p>No bookings yet.</p>
//         ) : (
//           <table>
//             <thead>
//               <tr>
//                 <th>User</th>
//                 <th>Bus</th>
//                 <th>Seat Numbers</th>
//                 <th>Travel Date</th>
//                 <th>Total Fare</th>
//                 <th>Status</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {bookings.map((booking) => (
//                 <tr key={booking._id}>
//                   <td>{booking.userId?.username || 'Unknown User'}</td>
//                   <td>
//                     {booking.busId.agencyName} ({booking.busId.busNumber}) {booking.busId.isAC ? '(AC)' : '(Non-AC)'}
//                   </td>
//                   <td>{booking.seatsBooked.map((s) => s.seatNumber).join(', ')}</td>
//                   <td>{new Date(booking.travelDate).toLocaleDateString()}</td>
//                   <td>₹{booking.totalFare}</td>
//                   <td>{booking.status}</td>
//                   <td>
//                     {booking.status === 'Confirmed' && (
//                       <>
//                         <button
//                           onClick={() => handleUpdateBookingStatus(booking._id, 'Done')}
//                           disabled={loading}
//                           style={{ marginRight: '10px' }}
//                         >
//                           {loading ? 'Processing...' : 'Done'}
//                         </button>
//                         <button
//                           onClick={() => handleUpdateBookingStatus(booking._id, 'Not Done')}
//                           disabled={loading}
//                         >
//                           {loading ? 'Processing...' : 'Not Done'}
//                         </button>
//                       </>
//                     )}
//                     {(booking.status === 'Completed' || booking.status === 'Missed') && booking.status}
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

// export default Adminhome;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
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
      setError(err.response?.data?.message || 'Error fetching profile');
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
      setError(err.response?.data?.message || 'Error fetching buses');
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
      setError(err.response?.data?.message || 'Error fetching bookings');
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
      alert('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleBusSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate time format
    if (!validateTimeFormat(busDetails.departureTime)) {
      setError('Departure time must be in HH:MM format (e.g., 14:30)');
      setLoading(false);
      return;
    }
    if (!validateTimeFormat(busDetails.arrivalTime)) {
      setError('Arrival time must be in HH:MM format (e.g., 18:30)');
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
      alert('Bus added successfully');
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
      setError(err.response?.data?.message || 'Error adding bus');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/update-booking-status/${bookingId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(response.data.message);
      fetchBookings();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error updating booking status';
      setError(errorMessage);
      console.error('Update booking status error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-home">
      <h1>Hello, {admin?.username || 'Admin'}</h1>
      {error && <p className="error">{error}</p>}

      {/* Agency Details Form */}
      <section>
        <h2>Update Agency Details</h2>
        <form onSubmit={handleAgencySubmit}>
          <div>
            <label>Agency Name:</label>
            <input
              type="text"
              name="agencyName"
              value={agencyDetails.agencyName}
              onChange={handleAgencyChange}
              required
            />
          </div>
          <div>
            <label>Admin Name:</label>
            <input
              type="text"
              name="adminName"
              value={agencyDetails.adminName}
              onChange={handleAgencyChange}
              required
            />
          </div>
          <div>
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
          <button type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </section>

      {/* Add Bus Form */}
      <section>
        <h2>Add a Bus</h2>
        <form onSubmit={handleBusSubmit}>
          <div>
            <label>Bus Number:</label>
            <input
              type="text"
              name="busNumber"
              value={busDetails.busNumber}
              onChange={handleBusChange}
              required
            />
          </div>
          <div>
            <label>Departure Address:</label>
            <input
              type="text"
              name="fromAddress"
              value={busDetails.fromAddress}
              onChange={handleBusChange}
              required
            />
          </div>
          <div>
            <label>Destination Address:</label>
            <input
              type="text"
              name="toAddress"
              value={busDetails.toAddress}
              onChange={handleBusChange}
              required
            />
          </div>
          <div>
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
          <div>
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
          <div>
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
          <div>
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
          <div>
            <label>Upload Bus Images (up to 5):</label>
            <input
              type="file"
              name="busImages"
              multiple
              onChange={handleImageChange}
              accept="image/*"
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Bus'}
          </button>
        </form>
      </section>

      {/* List of Buses */}
      <section>
        <h2>Your Buses</h2>
        {buses.length === 0 ? (
          <p>No buses added yet.</p>
        ) : (
          <ul>
            {buses.map((bus) => (
              <li key={bus._id}>
                {bus.agencyName} - {bus.busNumber} (Departure: {bus.fromAddress} to Destination: {bus.toAddress}) | Departure Time: {bus.departureTime} | Arrival Time: {bus.arrivalTime} | Fare: ₹{bus.fare} | Type: {bus.isAC ? 'AC' : 'Non-AC'} | Seat Numbers: 1-50
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* List of Bookings */}
      <section>
        <h2>Bookings for Your Agency</h2>
        {bookings.length === 0 ? (
          <p>No bookings yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Bus</th>
                <th>Seat Numbers</th>
                <th>Travel Date</th>
                <th>Total Fare</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id}>
                  <td>{booking.userId?.username || 'Unknown User'}</td>
                  <td>
                    {booking.busId.agencyName} ({booking.busId.busNumber}) {booking.busId.isAC ? '(AC)' : '(Non-AC)'}
                  </td>
                  <td>{booking.seatsBooked.map((s) => s.seatNumber).join(', ')}</td>
                  <td>{new Date(booking.travelDate).toLocaleDateString()}</td>
                  <td>₹{booking.totalFare}</td>
                  <td>{booking.status}</td>
                  <td>
                    {booking.status === 'Confirmed' && (
                      <>
                        <button
                          onClick={() => handleUpdateBookingStatus(booking._id, 'Done')}
                          disabled={loading}
                          style={{ marginRight: '10px' }}
                        >
                          {loading ? 'Processing...' : 'Done'}
                        </button>
                        <button
                          onClick={() => handleUpdateBookingStatus(booking._id, 'Not Done')}
                          disabled={loading}
                        >
                          {loading ? 'Processing...' : 'Not Done'}
                        </button>
                      </>
                    )}
                    {(booking.status === 'Completed' || booking.status === 'Missed') && booking.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default Adminhome;