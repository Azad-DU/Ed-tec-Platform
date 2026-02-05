import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DarkModeToggle from './DarkModeToggle';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-icon">📚</span>
          <span className="logo-text">EdTech BD</span>
        </Link>

        {/* Right side wrapper for mobile alignment */}
        <div className="nav-mobile-right">
          {isAuthenticated && (
            <span className={`user-role-badge role-${user?.role || 'student'} desktop-badge-split`}>
              {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student'}
            </span>
          )}

          {/* Dark Mode Toggle */}
          <DarkModeToggle />

          <button className="hamburger" onClick={toggleMenu} aria-label="Toggle menu">
            <span className={`bar ${isOpen ? 'active' : ''}`}></span>
            <span className={`bar ${isOpen ? 'active' : ''}`}></span>
            <span className={`bar ${isOpen ? 'active' : ''}`}></span>
          </button>
        </div>

        <div className={`nav-menu ${isOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setIsOpen(false)}>Home</Link>
          <Link to="/courses" className="nav-link" onClick={() => setIsOpen(false)}>Courses</Link>

          {isAuthenticated ? (
            <>
              {user?.role !== 'admin' && (
                <Link to="/dashboard" className="nav-link" onClick={() => setIsOpen(false)}>Dashboard</Link>
              )}
              {(user?.role === 'instructor' || user?.role === 'admin') && (
                <Link to="/admin" className="nav-link" onClick={() => setIsOpen(false)}>Admin</Link>
              )}
              <div className="nav-user-actions">
                {/* On desktop, we might want the badge here too if layout differs, but for now we keep it in header */}
                <button onClick={() => { logout(); setIsOpen(false); }} className="btn-logout">Logout</button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" onClick={() => setIsOpen(false)}>Login</Link>
              <Link to="/register" className="btn-register" onClick={() => setIsOpen(false)}>Register</Link>
            </>
          )}


        </div>
      </div>
    </nav>
  );
};

export default Navbar;
