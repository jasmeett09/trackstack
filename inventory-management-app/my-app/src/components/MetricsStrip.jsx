import React from 'react';
import './MetricsStrip.css';

const metrics = [
  { value: '1,240+', label: 'Products Tracked', icon: '◫' },
  { value: '₹4.8L', label: 'Inventory Value', icon: '₹' },
  { value: '12', label: 'Low Stock Alerts', icon: '◌' },
  { value: '99.9%', label: 'Records Organized', icon: '◇' }
];

function MetricsStrip() {
  return (
    <section className="metrics-strip" aria-label="Platform highlights">
      <div className="metrics-strip__panel" data-cursor-card>
        {metrics.map((metric) => (
          <article className="metrics-strip__item" key={metric.label}>
            <div className="metrics-strip__icon">{metric.icon}</div>
            <div>
              <h3>{metric.value}</h3>
              <p>{metric.label}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default MetricsStrip;
