import React from 'react';
import './AboutUsSection.css';

const benefits = [
  'Know exactly what is in stock',
  'Find products instantly',
  'Identify low inventory before it is a problem',
  'Maintain organized supplier records',
  'Track purchases and incoming stock',
  'View useful inventory analytics'
];

function AboutUsSection() {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="about-section" id="benefits">
      <div className="about-container">
        <article className="about-card" data-cursor-card>
          <div className="about-copy" data-scroll-slide="left">
            <span className="landing-eyebrow">Benefits</span>
            <h2>Less spreadsheet. More control.</h2>
            <p>
              Keep inventory organized, spot issues early, and make faster stock decisions
              with a single connected workflow.
            </p>
            <ul className="benefit-list">
              {benefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </div>

          <div className="about-visual">
            <div className="inventory-ui-preview">
              <div className="inventory-ui-preview__toolbar">
                <span />
                <span />
                <span />
              </div>
              <div className="inventory-ui-preview__table">
                <div className="inventory-ui-preview__row">
                  <span />
                  <span />
                  <span />
                  <span className="ok" />
                </div>
                <div className="inventory-ui-preview__row">
                  <span />
                  <span />
                  <span />
                  <span className="low" />
                </div>
                <div className="inventory-ui-preview__row">
                  <span />
                  <span />
                  <span />
                  <span className="low" />
                </div>
              </div>
            </div>

            <div className="category-donut">
              <div>
                <h4>Top Categories by Value</h4>
                <div className="category-donut__legend">
                  <span>Electronics</span>
                  <span>Furniture</span>
                  <span>Office Supplies</span>
                  <span>Accessories</span>
                </div>
              </div>
              <div className="category-donut__chart" />
            </div>
          </div>
        </article>

        <aside className="about-company-panel" data-cursor-card>
          <span className="landing-eyebrow">About</span>
          <h3 data-scroll-slide="right">TrackStack helps growing teams stay ahead of stock issues.</h3>
          <p>
            Built for modern inventory workflows, TrackStack combines stock visibility,
            supplier coordination, and analytics in one clear dashboard experience.
          </p>
          <div className="about-company-links">
            <button type="button" onClick={() => scrollToSection('about')}>About</button>
            <button type="button" onClick={() => scrollToSection('features')}>Features</button>
            <button type="button" onClick={() => scrollToSection('how-it-works')}>How It Works</button>
            <button type="button" onClick={() => scrollToSection('benefits')}>Benefits</button>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default AboutUsSection;
