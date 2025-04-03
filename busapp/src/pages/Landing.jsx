import React, { useState, useEffect, useRef } from 'react'; 
import { Link } from 'react-router-dom';
import { Bus, Calendar, MapPin, User, LogIn, UserPlus, Ticket, UserCog, ArrowRight, Menu, X } from 'lucide-react';
import logo from '../assets/logo2.jpg';
import '../styles/Landing.css';

const Landing = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const accountRef = useRef(null); // Ref for the account dropdown

  const getUpcomingDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + i);
      dates.push(nextDate.toISOString().split('T')[0]);
    }
    return dates;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log(`Searching: From ${from} to ${to} on ${date}`);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleAccount = (e) => {
    e.stopPropagation(); // Prevent event bubbling to document click handler
    setIsAccountOpen(!isAccountOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setIsAccountOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setShowToast(true);
    const timer = setTimeout(() => setShowToast(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="landing-container">
      {showToast && (
        <div className="toast">
          <p>Welcome to Zest Travel! Start your journey today.</p>
          <button onClick={() => setShowToast(false)} className="toast-close">
            <X size={18} />
          </button>
        </div>
      )}

      <header className="header">
        <div className="logo-container">
          <span className="app-name">
            <span className="zest">Zest</span> <span className="travel">Travel</span>
          </span>
        </div>
        <button className="menu-toggle" onClick={toggleSidebar}>
          {isSidebarOpen ? <X className="menu-icon" /> : <Menu className="menu-icon" />}
        </button>
        <nav className={`nav ${isSidebarOpen ? 'nav-open' : ''}`}>
          {/* Close button inside the sidebar */}
          {isSidebarOpen && (
            <button className="sidebar-close" onClick={toggleSidebar}>
              <X className="close-icon" />
            </button>
          )}
          <Link to="/about" className="nav-link" onClick={() => setIsSidebarOpen(false)}>
            <MapPin className="nav-icon" />
            About Us
          </Link>
          <div
            className="account-dropdown"
            ref={accountRef} // Attach ref to the account dropdown container
            onClick={toggleAccount} // Toggle dropdown on click
          >
            <span className="nav-link">
              <User className="nav-icon" />
              Account
            </span>
            {isAccountOpen && (
              <div className="dropdown-menu">
                <Link to="/user" className="dropdown-item" onClick={() => setIsSidebarOpen(false)}>
                  <LogIn className="dropdown-icon" />
                  Login
                </Link>
                <Link to="/user" className="dropdown-item" onClick={() => setIsSidebarOpen(false)}>
                  <UserPlus className="dropdown-icon" />
                  Signup
                </Link>
                <Link to="/ticket-fares" className="dropdown-item" onClick={() => setIsSidebarOpen(false)}>
                  <Ticket className="dropdown-icon" />
                  Ticket Fares
                </Link>
              </div>
            )}
          </div>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-content">
          <div className="hero-left">
            <img src={logo} alt="Zest Travel Logo" className="hero-logo" />
          </div>
          <div className="hero-right">
            <h1 className="typing-animation">Welcome to Zest Travel</h1>
            <p className="fade-in">Book your bus tickets with ease and travel hassle-free across the country with Zest Travel.</p>
            <form className="search-form fade-in" onSubmit={handleSearch}>
              <div className="search-inputs">
                <div className="input-group">
                  <MapPin className="input-icon" />
                  <input
                    type="text"
                    placeholder="From"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <MapPin className="input-icon" />
                  <input
                    type="text"
                    placeholder="To"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <Calendar className="input-icon" />
                  <input
                    type="date"
                    value={date}
                    min={getUpcomingDates()[0]}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="search-button">
                  <Bus className="button-icon" />
                  Search Buses
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="about">
        <h2>About Zest Travel</h2>
        <p>
          Zest Travel is your go-to platform for booking bus tickets online. We connect you to a wide network of buses, offering competitive fares and real-time updates on schedules. Whether you're traveling for work or leisure, Zest Travel ensures a seamless and enjoyable journey.
        </p>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-features">
            <h3>Features</h3>
            <ul>
              <li><ArrowRight className="footer-icon" /> Wide network of buses across the country</li>
              <li><ArrowRight className="footer-icon" /> Competitive ticket fares with no hidden fees</li>
              <li><ArrowRight className="footer-icon" /> Real-time bus schedules and availability</li>
              <li><ArrowRight className="footer-icon" /> 24/7 customer support</li>
            </ul>
          </div>
          <div className="footer-admin">
            <h3>Admin</h3>
            <Link to="/admin" className="footer-link">
              <UserCog className="footer-icon" />
              Admin Login
            </Link>
            <p>Admins can manage bus routes, fares, and images.</p>
          </div>
        </div>
        <p className="footer-copyright">© 2025 Zest Travel. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;