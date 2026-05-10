import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import './Navbar.css';

export default function Navbar() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const navLinks = [
    { to: '/dashboard', label: 'Home' },
    { to: '/vehicles',  label: 'Vehicles' },
    { to: '/booking',   label: 'My Bookings' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* Logo */}
        <Link to="/dashboard" className="navbar-logo">
          <img src="/logo.png" alt="Mero Gadi" style={{ width:28, height:28, objectFit:'contain' }} />
          <span className="logo-text">Mero <span style={{ color:'#1d4ed8' }}>Gadi</span></span>
        </Link>

        {/* Desktop nav links */}
        {user && (
          <div className="navbar-center desktop-only">
            <ul className="nav-menu">
              {navLinks.map((link) => (
                <li key={link.to} className="nav-item">
                  <Link
                    to={link.to}
                    className={`nav-link-button${location.pathname === link.to ? ' active' : ''}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Right side — avatar or login */}
        <div className="navbar-right desktop-only">
          {user ? (
            <button
              className="nav-avatar-btn"
              onClick={() => navigate('/profile')}
              title="View profile"
            >
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="nav-avatar-img"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <img
                  src="/default-avatar.svg"
                  alt="Profile"
                  className="nav-avatar-img"
                />
              )}
              <span className="nav-avatar-name">
                {user.given_name || user.username}
              </span>
            </button>
          ) : (
            <Link to="/login" className="nav-link-button">Login</Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="mobile-menu">
          {user && navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link-button${location.pathname === link.to ? ' active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <Link
              to="/profile"
              className="nav-link-button"
              onClick={() => setMobileOpen(false)}
            >
              👤 My Profile
            </Link>
          ) : (
            <Link to="/login" className="nav-link-button" onClick={() => setMobileOpen(false)}>
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
