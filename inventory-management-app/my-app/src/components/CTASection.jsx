import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CTASection.css';

function CTASection({ isAuthenticated }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
      return;
    }

    navigate('/login');
  };

  return (
    <section className="cta-section">
      <div className="cta-section__card">
        <div className="cta-section__icon">◫</div>
        <div className="cta-section__content" data-scroll-slide="left">
          <h2>Ready to take control of your inventory?</h2>
          <p>
            Organize products, monitor stock and manage your inventory from one simple
            dashboard.
          </p>
        </div>
        <button type="button" className="cta-section__button" data-cursor-button onClick={handleClick}>
          Get Started Free
        </button>
      </div>
    </section>
  );
}

export default CTASection;
