import React from 'react';
import './HowItWorks.css';

const steps = [
  {
    number: '01',
    title: 'Add your inventory',
    description: 'Add products, categories and suppliers in just a few clicks.'
  },
  {
    number: '02',
    title: 'Track stock changes',
    description: 'Monitor purchases, stock updates and low stock alerts in real time.'
  },
  {
    number: '03',
    title: 'Get actionable insights',
    description: 'Use reports and analytics to make smarter inventory decisions.'
  }
];

function HowItWorks() {
  return (
    <section className="how-it-works" id="how-it-works">
      <div className="section-heading" data-scroll-slide="right">
        <span className="landing-eyebrow">How It Works</span>
        <h2>Simple steps, powerful control</h2>
      </div>

      <div className="steps-grid">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <article className="step-card" data-cursor-card>
              <div className="step-icon">{index === 0 ? '⬡' : index === 1 ? '◫' : '⚡'}</div>
              <span className="step-number">{step.number}</span>
              <h3 data-scroll-slide={index % 2 === 0 ? 'left' : 'right'}>{step.title}</h3>
              <p>{step.description}</p>
            </article>
            {index < steps.length - 1 && <div className="step-connector" aria-hidden="true">→</div>}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}

export default HowItWorks;
