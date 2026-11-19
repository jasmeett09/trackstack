import React from 'react';
import './FeaturesSection.css';

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <path d="M16 16L21 21" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 4a4 4 0 0 0-4 4v2.2c0 .8-.24 1.58-.7 2.23L5.9 14.6A1.4 1.4 0 0 0 7.06 17h9.88a1.4 1.4 0 0 0 1.16-2.4l-1.4-2.17A3.96 3.96 0 0 1 16 10.2V8a4 4 0 0 0-4-4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M10 19a2 2 0 0 0 4 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="9" cy="10" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="17" cy="8.5" r="2.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M4.5 18c.7-2.45 2.66-3.75 4.5-3.75S12.8 15.55 13.5 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14.7 16.8c.42-1.58 1.63-2.8 3.3-3.1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function AnalyticsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5h8l2 3v11H6V8l2-3Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M12 8.5V6.5M12 17.5v-2M15.5 12h2M6.5 12h2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 6h2l1.4 8.1a1 1 0 0 0 .98.84h8.9a1 1 0 0 0 .97-.75L20 8H7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="19" r="1.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="17" cy="19" r="1.5" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function ReportIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 3h6l4 4v14H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M14 3v5h5M10 12h4M10 16h5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const features = [
  {
    key: 'inventory',
    area: 'inventory',
    title: 'Inventory Tracking',
    description: 'Search, filter, add and update items with ease.',
    icon: <SearchIcon />,
    accent: 'indigo'
  },
  {
    key: 'alerts',
    area: 'alerts',
    title: 'Low Stock Alerts',
    description: 'Automatically identify products that need attention.',
    icon: <BellIcon />,
    accent: 'orange'
  },
  {
    key: 'suppliers',
    area: 'suppliers',
    title: 'Supplier Management',
    description: 'Organize and manage supplier information in one place.',
    icon: <UsersIcon />,
    accent: 'indigo'
  },
  {
    key: 'analytics',
    area: 'analytics',
    title: 'Analytics Dashboard',
    description: 'Visualize stock value, categories and inventory trends.',
    icon: <AnalyticsIcon />,
    accent: 'indigo'
  },
  {
    key: 'purchases',
    area: 'purchases',
    title: 'Purchase Management',
    description: 'Record and track all your purchases efficiently.',
    icon: <CartIcon />,
    accent: 'green'
  },
  {
    key: 'reports',
    area: 'reports',
    title: 'Reports',
    description: 'Understand inventory activity and performance.',
    icon: <ReportIcon />,
    accent: 'indigo'
  }
];

function FeaturesSection() {
  return (
    <section className="features-section" id="features">
      <div className="features-section__header" data-scroll-slide="left">
        <span className="features-section__eyebrow">Features</span>
        <h2 className="features-section__title">
          Everything <span>you need to stay</span> in control
        </h2>
      </div>

      <div className="features-grid">
        {features.map((feature, index) => (
          <article
            key={feature.key}
            className={`feature-card feature-card--${feature.area}`} data-cursor-card
          >
            <div className="feature-card__header">
              <div className={`feature-card__icon feature-card__icon--${feature.accent}`}>
                {feature.icon}
              </div>
              <div className="feature-card__copy" data-scroll-slide={index % 2 === 0 ? 'left' : 'right'}>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </div>

            {feature.key === 'inventory' && (
              <div className="feature-table-preview" aria-hidden="true">
                <div className="feature-table-preview__toolbar">
                  <span>Search items...</span>
                  <span>
                    All Categories
                    <b>▼</b>
                  </span>
                  <span>+ Add Item</span>
                </div>

                <div className="feature-table-preview__rows">
                  <div className="feature-table-preview__row feature-table-preview__row--head">
                    <span>Item Name</span>
                    <span>Category</span>
                    <span>Stock</span>
                    <span>Status</span>
                  </div>
                  <div className="feature-table-preview__row">
                    <span>Wireless Mouse</span>
                    <span>Electronics</span>
                    <span>5</span>
                    <span className="low">Low Stock</span>
                  </div>
                  <div className="feature-table-preview__row">
                    <span>Mechanical Keyboard</span>
                    <span>Electronics</span>
                    <span>15</span>
                    <span className="ok">In Stock</span>
                  </div>
                  <div className="feature-table-preview__row">
                    <span>A4 Paper Ream</span>
                    <span>Office Supplies</span>
                    <span>2</span>
                    <span className="low">Low Stock</span>
                  </div>
                  <div className="feature-table-preview__row">
                    <span>USB-C Cable</span>
                    <span>Electronics</span>
                    <span>3</span>
                    <span className="low">Low Stock</span>
                  </div>
                </div>
              </div>
            )}

            {feature.key === 'analytics' && (
              <div className="feature-chart-preview" aria-hidden="true">
                <div className="feature-chart-preview__bars">
                  <div className="feature-chart-preview__axis">
                    <span>100</span>
                    <span>75</span>
                    <span>50</span>
                    <span>25</span>
                    <span>0</span>
                  </div>
                  <div className="feature-chart-preview__bar-group">
                    <span style={{ height: '40%' }} />
                    <span style={{ height: '50%' }} />
                    <span style={{ height: '70%' }} />
                    <span style={{ height: '46%' }} />
                    <span style={{ height: '56%' }} />
                    <span style={{ height: '76%' }} />
                    <span style={{ height: '48%' }} />
                  </div>
                </div>
                <div className="feature-chart-preview__donut" />
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

export default FeaturesSection;
