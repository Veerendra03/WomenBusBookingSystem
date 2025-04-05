import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Animated,
  RefreshControl,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../styles/AdminhomeStyles';

const API_URL = Constants.expoConfig?.extra?.apiUrl;

const Adminhome = () => {
  const navigation = useNavigation();
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
  const [selectedBus, setSelectedBus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // Add initial loading state
  const [error, setError] = useState('');
  const [imageUris, setImageUris] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Animation states
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const cardScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const initialize = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const storedUsername = await AsyncStorage.getItem('username');
        if (token) {
          const decoded = jwtDecode(token);
          const currentTime = Math.floor(Date.now() / 1000);
          if (decoded.exp < currentTime) {
            throw new Error('Token expired');
          }
          setAdmin({ ...decoded, username: storedUsername || decoded.username || 'Admin' });
          await Promise.all([fetchAdminProfile(), fetchBuses(), fetchBookings()]);
        } else {
          navigation.navigate('Admin');
        }
      } catch (err) {
        const errorMessage = err.message === 'Token expired' ? 'Token expired. Please log in again.' : 'Invalid token. Please log in again.';
        setError(errorMessage);
        showToastNotification(errorMessage);
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('username');
        navigation.navigate('Admin');
      } finally {
        setInitialLoading(false);
      }
    };
    initialize();
  }, [navigation]);

  const fetchAdminProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/admin/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAgencyDetails({
        agencyName: response.data.agencyName || '',
        adminName: response.data.adminName || '',
        adminPhone: response.data.adminPhone || '',
      });
    } catch (err) {
      if (!err.response) {
        throw new Error('Network error. Please check your internet connection.');
      }
      const errorMessage = err.response?.status === 401 ? 'Session expired. Please log in again.' : err.response?.data?.message || 'Error fetching profile';
      setError(errorMessage);
      showToastNotification(errorMessage);
      if (err.response?.status === 401) {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('username');
        navigation.navigate('Admin');
      }
    }
  };

  const fetchBuses = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/admin/buses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBuses(response.data);
    } catch (err) {
      if (!err.response) {
        throw new Error('Network error. Please check your internet connection.');
      }
      const errorMessage = err.response?.status === 401 ? 'Session expired. Please log in again.' : err.response?.data?.message || 'Error fetching buses';
      setError(errorMessage);
      showToastNotification(errorMessage);
      if (err.response?.status === 401) {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('username');
        navigation.navigate('Admin');
      }
    }
  };

  const fetchBookings = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/admin/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(response.data);
    } catch (err) {
      if (!err.response) {
        throw new Error('Network error. Please check your internet connection.');
      }
      const errorMessage = err.response?.status === 401 ? 'Session expired. Please log in again.' : err.response?.data?.message || 'Error fetching bookings';
      setError(errorMessage);
      showToastNotification(errorMessage);
      if (err.response?.status === 401) {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('username');
        navigation.navigate('Admin');
      }
    }
  };

  const handleAgencyChange = (name, value) => {
    setAgencyDetails({ ...agencyDetails, [name]: value });
  };

  const handleBusChange = (name, value) => {
    setBusDetails({ ...busDetails, [name]: value });
  };

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      showToastNotification('Permission to access gallery is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const newUris = result.assets.map((asset) => asset.uri);
      setImageUris([...imageUris, ...newUris].slice(0, 5));
    }
  };

  const removeImage = (index) => {
    setImageUris(imageUris.filter((_, i) => i !== index));
  };

  const validateTimeFormat = (time) => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    return timeRegex.test(time);
  };

  const handleAgencySubmit = async () => {
    setLoading(true);
    setError('');
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(agencyDetails.adminPhone)) {
      setError('Phone number must be a 10-digit number');
      showToastNotification('Phone number must be a 10-digit number');
      setLoading(false);
      return;
    }
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(
        `${API_URL}/api/admin/update-profile`,
        agencyDetails,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToastNotification('Profile updated successfully');
    } catch (err) {
      if (!err.response) {
        setError('Network error. Please check your internet connection.');
        showToastNotification('Network error. Please check your internet connection.');
        setLoading(false);
        return;
      }
      const errorMessage = err.response?.status === 401 ? 'Session expired. Please log in again.' : err.response?.data?.message || 'Error updating profile';
      setError(errorMessage);
      showToastNotification(errorMessage);
      if (err.response?.status === 401) {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('username');
        navigation.navigate('Admin');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBusSubmit = async () => {
    setLoading(true);
    setError('');

    if (!validateTimeFormat(busDetails.departureTime)) {
      setError('Departure time must be in HH:MM format (e.g., 14:30)');
      showToastNotification('Departure time must be in HH:MM format (e.g., 14:30)');
      setLoading(false);
      return;
    }
    if (!validateTimeFormat(busDetails.arrivalTime)) {
      setError('Arrival time must be in HH:MM format (e.g., 18:30)');
      showToastNotification('Arrival time must be in HH:MM format (e.g., 18:30)');
      setLoading(false);
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const formData = new FormData();
      formData.append('busNumber', busDetails.busNumber);
      formData.append('fromAddress', busDetails.fromAddress);
      formData.append('toAddress', busDetails.toAddress);
      formData.append('departureTime', busDetails.departureTime);
      formData.append('arrivalTime', busDetails.arrivalTime);
      formData.append('fare', busDetails.fare);
      formData.append('isAC', busDetails.isAC.toString());

      for (let i = 0; i < imageUris.length; i++) {
        const uri = imageUris[i];
        const response = await fetch(uri);
        const blob = await response.blob();
        formData.append('busImages', {
          uri,
          type: 'image/jpeg',
          name: `busImage_${i}.jpg`,
        });
      }

      await axios.post(`${API_URL}/api/admin/add-bus`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      showToastNotification('Bus added successfully');
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
      setImageUris([]);
    } catch (err) {
      if (!err.response) {
        setError('Network error. Please check your internet connection.');
        showToastNotification('Network error. Please check your internet connection.');
        setLoading(false);
        return;
      }
      const errorMessage = err.response?.status === 401 ? 'Session expired. Please log in again.' : err.response?.data?.message || 'Error adding bus';
      setError(errorMessage);
      showToastNotification(errorMessage);
      if (err.response?.status === 401) {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('username');
        navigation.navigate('Admin');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    setLoading(true);
    setError('');
    try {
      const token = await AsyncStorage.getItem('token');
      const backendStatus = status === 'Completed' ? 'Done' : 'Not Done';
      const response = await axios.put(
        `${API_URL}/api/admin/update-booking-status/${bookingId}`,
        { status: backendStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToastNotification(response.data.message);
      fetchBookings();
    } catch (err) {
      if (!err.response) {
        setError('Network error. Please check your internet connection.');
        showToastNotification('Network error. Please check your internet connection.');
        setLoading(false);
        return;
      }
      const errorMessage = err.response?.status === 401 ? 'Session expired. Please log in again.' : err.response?.data?.message || 'Error updating booking status';
      setError(errorMessage);
      showToastNotification(errorMessage);
      if (err.response?.status === 401) {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('username');
        navigation.navigate('Admin');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('username');
      showToastNotification('Logged out successfully');
      navigation.navigate('Admin');
    } catch (err) {
      showToastNotification('Error logging out');
    } finally {
      setLoading(false);
    }
  };

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

  const handleBusClick = (bus) => {
    setSelectedBus(selectedBus && selectedBus._id === bus._id ? null : bus);
    Animated.sequence([
      Animated.timing(cardScaleAnim, {
        toValue: 1.05,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(cardScaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const showToastNotification = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAdminProfile();
    fetchBuses();
    fetchBookings();
    setError('');
    setTimeout(() => setRefreshing(false), 1500);
  };

  useEffect(() => {
    if (showToast) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [showToast, slideAnim, fadeAnim]);

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.adminHome}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2b6cb0" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.adminHome}>
      <KeyboardAvoidingView
        style={styles.flexContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#2b6cb0"
            />
          }
        >
          {/* Header */}
          <Animated.View style={[styles.adminHeader, { opacity: fadeAnim }]}>
            <Text style={styles.headerTitle}>Hello, {admin?.username || 'Admin'}</Text>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
              <Text style={styles.logoutBtnText}>Logout</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Error Message */}
          {error ? (
            <Animated.View style={[styles.errorContainer, { opacity: fadeAnim }]}>
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          ) : null}

          {/* Side Image */}
          <Image
            source={require('../assets/images/background.jpg')}
            style={styles.sideImage}
          />

          {/* Agency Details Form */}
          <View style={styles.adminSection}>
            <Text style={styles.sectionTitle}>Update Agency Details</Text>
            <View style={styles.adminForm}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Agency Name:</Text>
                <TextInput
                  style={styles.input}
                  value={agencyDetails.agencyName}
                  onChangeText={(value) => handleAgencyChange('agencyName', value)}
                  placeholder="Enter agency name"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Admin Name:</Text>
                <TextInput
                  style={styles.input}
                  value={agencyDetails.adminName}
                  onChangeText={(value) => handleAgencyChange('adminName', value)}
                  placeholder="Enter admin name"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Admin Phone:</Text>
                <TextInput
                  style={styles.input}
                  value={agencyDetails.adminPhone}
                  onChangeText={(value) => handleAgencyChange('adminPhone', value)}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                  placeholderTextColor="#999"
                />
              </View>
              <TouchableOpacity
                style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                onPress={handleAgencySubmit}
                disabled={loading}
              >
                <Text style={styles.submitBtnText}>
                  {loading ? 'Updating...' : 'Update Profile'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Add Bus Form */}
          <View style={styles.adminSection}>
            <Text style={styles.sectionTitle}>Add a Bus</Text>
            <View style={styles.adminForm}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Bus Number:</Text>
                <TextInput
                  style={styles.input}
                  value={busDetails.busNumber}
                  onChangeText={(value) => handleBusChange('busNumber', value)}
                  placeholder="Enter bus number"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Departure Address:</Text>
                <TextInput
                  style={styles.input}
                  value={busDetails.fromAddress}
                  onChangeText={(value) => handleBusChange('fromAddress', value)}
                  placeholder="Enter departure address"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Destination Address:</Text>
                <TextInput
                  style={styles.input}
                  value={busDetails.toAddress}
                  onChangeText={(value) => handleBusChange('toAddress', value)}
                  placeholder="Enter destination address"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Departure Time (HH:MM):</Text>
                <TextInput
                  style={styles.input}
                  value={busDetails.departureTime}
                  onChangeText={(value) => handleBusChange('departureTime', value)}
                  placeholder="e.g., 14:30"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Arrival Time (HH:MM):</Text>
                <TextInput
                  style={styles.input}
                  value={busDetails.arrivalTime}
                  onChangeText={(value) => handleBusChange('arrivalTime', value)}
                  placeholder="e.g., 18:30"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Fare per Seat (₹):</Text>
                <TextInput
                  style={styles.input}
                  value={busDetails.fare}
                  onChangeText={(value) => handleBusChange('fare', value)}
                  keyboardType="numeric"
                  placeholder="Enter fare"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Is AC Bus?</Text>
                <Switch
                  value={busDetails.isAC}
                  onValueChange={(value) => handleBusChange('isAC', value)}
                  trackColor={{ false: '#767577', true: '#2b6cb0' }}
                  thumbColor={busDetails.isAC ? '#fff' : '#f4f3f4'}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Upload Bus Images (up to 5):</Text>
                <TouchableOpacity style={styles.imagePickerBtn} onPress={handleImagePick}>
                  <Text style={styles.imagePickerText}>Select Images</Text>
                </TouchableOpacity>
                <View style={styles.imagePreviewContainer}>
                  {imageUris.map((uri, index) => (
                    <View key={index} style={styles.imagePreviewWrapper}>
                      <Image source={{ uri }} style={styles.imagePreview} />
                      <TouchableOpacity
                        style={styles.removeImageBtn}
                        onPress={() => removeImage(index)}
                      >
                        <Text style={styles.removeImageText}>X</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
              <TouchableOpacity
                style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                onPress={handleBusSubmit}
                disabled={loading}
              >
                <Text style={styles.submitBtnText}>
                  {loading ? 'Adding...' : 'Add Bus'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* List of Buses */}
          <View style={styles.adminSection}>
            <Text style={styles.sectionTitle}>Your Buses</Text>
            {buses.length === 0 ? (
              <Text style={styles.noDataText}>No buses added yet.</Text>
            ) : (
              <View style={styles.cardContainer}>
                {buses.map((bus) => (
                  <TouchableOpacity
                    key={bus._id}
                    onPress={() => handleBusClick(bus)}
                    style={styles.cardWrapper}
                  >
                    <Animated.View
                      style={[
                        styles.card,
                        styles.busCard,
                        selectedBus && selectedBus._id === bus._id && styles.busCardSelected,
                        { transform: [{ scale: cardScaleAnim }] },
                      ]}
                    >
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardHeaderTitle}>
                          {bus.agencyName} - {bus.busNumber}
                        </Text>
                        <Text style={styles.toggleIcon}>
                          {selectedBus && selectedBus._id === bus._id ? '▼' : '▶'}
                        </Text>
                      </View>
                      <Text style={styles.cardText}>🛤️ Route: {bus.fromAddress} to {bus.toAddress}</Text>
                      <Text style={styles.cardText}>⏰ Departure: {bus.departureTime} | Arrival: {bus.arrivalTime}</Text>
                      <Text style={styles.cardText}>💵 Fare: ₹{bus.fare} | Type: {bus.isAC ? 'AC' : 'Non-AC'}</Text>
                      <Text style={styles.cardText}>💺 Seats: 1-50</Text>

                      {/* Passenger Details */}
                      {selectedBus && selectedBus._id === bus._id && (
                        <Animated.View style={[styles.passengerDetails, { opacity: fadeAnim }]}>
                          <Text style={styles.passengerDetailsTitle}>Passenger Details</Text>
                          {groupedBookings[bus._id]?.bookings?.length > 0 ? (
                            <View style={styles.passengerList}>
                              {groupedBookings[bus._id].bookings.map((booking) => (
                                <View key={booking._id} style={styles.passengerCard}>
                                  <Text style={styles.passengerText}>
                                    <Text style={styles.passengerLabel}>User:</Text> {booking.userId?.username || 'Unknown User'}
                                  </Text>
                                  <Text style={styles.passengerText}>
                                    <Text style={styles.passengerLabel}>Passengers:</Text>
                                  </Text>
                                  {booking.userDetails.passengers.map((passenger, index) => (
                                    <Text key={index} style={styles.passengerItem}>
                                      - {passenger.name} (Age: {passenger.age}, Gender: {passenger.gender})
                                    </Text>
                                  ))}
                                  <Text style={styles.passengerText}>
                                    <Text style={styles.passengerLabel}>Seats:</Text> {booking.seatsBooked.map((s) => s.seatNumber).join(', ')}
                                  </Text>
                                  <Text style={styles.passengerText}>
                                    <Text style={styles.passengerLabel}>Travel Date:</Text> {new Date(booking.travelDate).toLocaleDateString()}
                                  </Text>
                                  <Text style={styles.passengerText}>
                                    <Text style={styles.passengerLabel}>Total Fare:</Text> ₹{booking.totalFare}
                                  </Text>
                                  <Text style={styles.passengerText}>
                                    <Text style={styles.passengerLabel}>Status:</Text> {booking.status}
                                  </Text>
                                  {booking.status === 'Confirmed' && (
                                    <View style={styles.actionButtons}>
                                      <TouchableOpacity
                                        style={[styles.actionBtn, styles.completeBtn]}
                                        onPress={() => handleUpdateBookingStatus(booking._id, 'Completed')}
                                        disabled={loading}
                                      >
                                        <Text style={styles.actionBtnText}>
                                          {loading ? 'Processing...' : 'Completed'}
                                        </Text>
                                      </TouchableOpacity>
                                      <TouchableOpacity
                                        style={[styles.actionBtn, styles.missedBtn]}
                                        onPress={() => handleUpdateBookingStatus(booking._id, 'Missed')}
                                        disabled={loading}
                                      >
                                        <Text style={styles.actionBtnText}>
                                          {loading ? 'Processing...' : 'Missed'}
                                        </Text>
                                      </TouchableOpacity>
                                    </View>
                                  )}
                                </View>
                              ))}
                            </View>
                          ) : (
                            <Text style={styles.noDataText}>No passengers booked for this bus yet.</Text>
                          )}
                        </Animated.View>
                      )}
                    </Animated.View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Grouped Bookings by Bus */}
          <View style={styles.adminSection}>
            <Text style={styles.sectionTitle}>All Bookings for Your Agency</Text>
            {Object.keys(groupedBookings).length === 0 ? (
              <Text style={styles.noDataText}>No bookings yet.</Text>
            ) : (
              Object.values(groupedBookings).map(({ bus, bookings }) => (
                <View key={bus._id} style={styles.busBookings}>
                  <Text style={styles.busBookingsTitle}>
                    {bus.agencyName} ({bus.busNumber}) {bus.isAC ? '(AC)' : '(Non-AC)'}
                  </Text>
                  <View style={styles.cardContainer}>
                    {bookings.map((booking) => (
                      <Animated.View
                        key={booking._id}
                        style={[styles.card, styles.bookingCard, { opacity: fadeAnim }]}
                      >
                        <Text style={styles.cardText}>
                          <Text style={styles.cardLabel}>👤 User:</Text> {booking.userId?.username || 'Unknown User'}
                        </Text>
                        <Text style={styles.cardText}>
                          <Text style={styles.cardLabel}>👥 Passengers:</Text>
                        </Text>
                        {booking.userDetails.passengers.map((passenger, index) => (
                          <Text key={index} style={styles.passengerItem}>
                            - {passenger.name} (Age: {passenger.age}, Gender: {passenger.gender})
                          </Text>
                        ))}
                        <Text style={styles.cardText}>
                          <Text style={styles.cardLabel}>💺 Seats:</Text> {booking.seatsBooked.map((s) => s.seatNumber).join(', ')}
                        </Text>
                        <Text style={styles.cardText}>
                          <Text style={styles.cardLabel}>📅 Travel Date:</Text> {new Date(booking.travelDate).toLocaleDateString()}
                        </Text>
                        <Text style={styles.cardText}>
                          <Text style={styles.cardLabel}>💵 Total Fare:</Text> ₹{booking.totalFare}
                        </Text>
                        <Text style={styles.cardText}>
                          <Text style={styles.cardLabel}>📊 Status:</Text> {booking.status}
                        </Text>
                        {booking.status === 'Confirmed' && (
                          <View style={styles.actionButtons}>
                            <TouchableOpacity
                              style={[styles.actionBtn, styles.completeBtn]}
                              onPress={() => handleUpdateBookingStatus(booking._id, 'Completed')}
                              disabled={loading}
                            >
                              <Text style={styles.actionBtnText}>
                                {loading ? 'Processing...' : 'Completed'}
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.actionBtn, styles.missedBtn]}
                              onPress={() => handleUpdateBookingStatus(booking._id, 'Missed')}
                              disabled={loading}
                            >
                              <Text style={styles.actionBtnText}>
                                {loading ? 'Processing...' : 'Missed'}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </Animated.View>
                    ))}
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Toast Notification */}
        {showToast && (
          <Animated.View
            style={[
              styles.authToast,
              {
                transform: [{ translateX: slideAnim }],
                opacity: fadeAnim,
              },
            ]}
          >
            <Text style={styles.authToastText}>{toastMessage}</Text>
          </Animated.View>
        )}

        {/* Loader */}
        {loading && (
          <View style={styles.authLoader}>
            <ActivityIndicator size="large" color="#2b6cb0" />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Adminhome;