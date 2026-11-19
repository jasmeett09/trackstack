import React from 'react';
import './Footer.css';

function Footer() {
  const handleScroll = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="footer-logo">
            <span>⬢</span>
            <strong>TrackStack</strong>
          </div>
          <p>Smart inventory management system for growing teams.</p>
        </div>

        <div className="footer-links">
          <div>
            <h4>Product</h4>
            <button type="button" onClick={() => handleScroll('product-showcase')}>Dashboard</button>
            <button type="button" onClick={() => handleScroll('features')}>Inventory</button>
            <button type="button" onClick={() => handleScroll('about')}>Reports</button>
            <button type="button" onClick={() => handleScroll('features')}>Categories</button>
          </div>
          <div>
            <h4>Company</h4>
            <button type="button" onClick={() => handleScroll('about')}>About</button>
            <button type="button" onClick={() => handleScroll('features')}>Features</button>
            <button type="button" onClick={() => handleScroll('how-it-works')}>How It Works</button>
            <button type="button" onClick={() => handleScroll('benefits')}>Benefits</button>
          </div>
          <div>
            <h4>Resources</h4>
            <span>Documentation</span>
            <span>Help Center</span>
            <span>Contact</span>
          </div>
          <div>
            <h4>Connect</h4>
            <div className="footer-social">
              <a href="https://github.com/jasmeett09" target="_blank" rel="noreferrer" aria-label="GitHub">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 6.58 2 12.22c0 4.5 2.87 8.32 6.84 9.67.5.1.68-.22.68-.49 0-.24-.01-1.03-.01-1.87-2.78.62-3.37-1.21-3.37-1.21-.46-1.2-1.11-1.52-1.11-1.52-.91-.64.07-.63.07-.63 1 .08 1.53 1.06 1.53 1.06.9 1.58 2.36 1.13 2.93.87.09-.67.35-1.13.63-1.39-2.22-.26-4.56-1.14-4.56-5.09 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.73 0 0 .84-.27 2.75 1.05A9.3 9.3 0 0 1 12 6.84c.85 0 1.71.12 2.5.35 1.91-1.32 2.75-1.05 2.75-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.63 1.03 2.75 0 3.96-2.34 4.82-4.57 5.08.36.32.68.95.68 1.92 0 1.39-.01 2.5-.01 2.84 0 .27.18.59.69.49A10.22 10.22 0 0 0 22 12.22C22 6.58 17.52 2 12 2Z" />
                </svg>
              </a>
              <a href="https://www.linkedin.com/in/jasmeet-kaur-50b74931b/" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6.94 8.5A1.56 1.56 0 1 1 6.94 5.38a1.56 1.56 0 0 1 0 3.12ZM5.56 9.72h2.76V18H5.56V9.72Zm4.5 0h2.65v1.13h.04c.37-.7 1.27-1.44 2.61-1.44 2.79 0 3.3 1.88 3.3 4.31V18H15.9v-3.82c0-.91-.02-2.09-1.24-2.09-1.25 0-1.45.99-1.45 2.02V18h-2.75V9.72Z" />
                </svg>
              </a>
              <a href="mailto:jasmeettk2006@gmail.com" aria-label="Email">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3 6.75A1.75 1.75 0 0 1 4.75 5h14.5A1.75 1.75 0 0 1 21 6.75v10.5A1.75 1.75 0 0 1 19.25 19H4.75A1.75 1.75 0 0 1 3 17.25V6.75Zm1.9.1 6.53 5.02a1 1 0 0 0 1.22 0l6.45-5V6.75a.25.25 0 0 0-.25-.25H4.75a.25.25 0 0 0-.25.25v.1Zm14.2 1.92-5.53 4.28a2.5 2.5 0 0 1-3.14 0L4.9 8.83v8.42c0 .14.11.25.25.25h14.1c.14 0 .25-.11.25-.25V8.77Z" />
                </svg>
              </a>
            </div>
            <a className="footer-email" href="mailto:jasmeettk2006@gmail.com">jasmeettk2006@gmail.com</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 TrackStack. All rights reserved.</span>
      </div>
    </footer>
  );
}

export default Footer;
