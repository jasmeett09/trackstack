import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar({ isAuthenticated }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <button type="button" className="navbar-logo" onClick={() => navigate('/')}>
          <span className="logo-mark">⬢</span>
          <span className="logo-text">TrackStack</span>
        </button>

        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          <span />
          <span />
          <span />
        </button>

        <ul className={`navbar-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <li><button type="button" onClick={() => { scrollToSection('features'); setMobileMenuOpen(false); }}>Features</button></li>
          <li><button type="button" onClick={() => { scrollToSection('how-it-works'); setMobileMenuOpen(false); }}>How It Works</button></li>
          <li><button type="button" onClick={() => { scrollToSection('benefits'); setMobileMenuOpen(false); }}>Benefits</button></li>
          <li><button type="button" onClick={() => { scrollToSection('about'); setMobileMenuOpen(false); }}>About</button></li>
        </ul>

        <div className="navbar-auth">
          {isAuthenticated ? (
            <button className="nav-btn nav-btn-primary" data-cursor-button onClick={() => navigate('/dashboard')}>
              Dashboard
            </button>
          ) : (
            <>
              <button
                type="button"
                className="nav-btn nav-btn-secondary" data-cursor-button
                onClick={() => navigate('/login')}
              >
                Log In
              </button>
              <button
                type="button"
                className="nav-btn nav-btn-primary" data-cursor-button
                onClick={() => navigate('/login')}
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
