import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroSection.css';

function HeroSection({ isAuthenticated }) {
  const navigate = useNavigate();

  const handlePrimaryAction = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
      return;
    }

    navigate('/login');
  };

  const handleDemoClick = () => {
    const element = document.getElementById('product-showcase');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero-section" id="home">
      <div className="hero-container">
        <div className="hero-content" data-scroll-slide="left" data-scroll-slide-initial>
          <span className="hero-badge">Smart Inventory Management</span>
          <h1 className="hero-title">
            Inventory control,
            <span> without the chaos.</span>
          </h1>
          <p className="hero-description">
            Track stock levels, manage products and suppliers, monitor purchases, and catch
            low-stock items before they become a problem.
          </p>
          <div className="hero-buttons">
            <button type="button" className="btn btn-primary" data-cursor-button onClick={handlePrimaryAction}>
              Start Managing Inventory
            </button>
            <button type="button" className="btn btn-secondary" data-cursor-button onClick={handleDemoClick}>
              View Demo
            </button>
          </div>
          <div className="hero-benefits">
            <span>Simple setup</span>
            <span>Real-time insights</span>
            <span>Built for growing teams</span>
          </div>
        </div>

        <div className="hero-dashboard-wrap" data-scroll-slide="right" data-scroll-slide-initial>
          <div className="hero-floating-card floating-top">
            <span>Total Items</span>
            <strong>1,240</strong>
          </div>

          <div className="hero-floating-card floating-right">
            <span>Inventory Value</span>
            <strong>₹4.8L</strong>
          </div>

          <div className="hero-floating-card floating-bottom">
            <span>Low Stock</span>
            <strong>12</strong>
          </div>

          <div className="dashboard-mockup" id="product-showcase">
            <aside className="mockup-sidebar">
              <div className="sidebar-user">
                <div className="user-avatar">T</div>
                <div>
                  <span className="user-name">TrackStack</span>
                  <span className="user-email">inventory hub</span>
                </div>
              </div>

              <div className="hero-dashboard-label">Dashboard</div>

              <nav className="sidebar-nav">
                <span className="nav-item active">Dashboard</span>
                <span className="nav-item">Inventory</span>
                <span className="nav-item">Suppliers</span>
                <span className="nav-item">Purchases</span>
                <span className="nav-item">Reports</span>
                <span className="nav-item">Categories</span>
              </nav>
            </aside>

            <div className="mockup-main">
              <div className="main-header">
                <div>
                  <h3>Dashboard</h3>
                  <p>Overview of your inventory</p>
                </div>
                <div className="main-header-icons">
                  <span>G</span>
                  <span>◌</span>
                  <span>●</span>
                </div>
              </div>

              <div className="main-stats">
                <div className="stat-item">
                  <span className="stat-title">Total Items</span>
                  <strong className="stat-value">1,240</strong>
                </div>
                <div className="stat-item">
                  <span className="stat-title">Inventory Value</span>
                  <strong className="stat-value">₹4.8L</strong>
                </div>
                <div className="stat-item alert">
                  <span className="stat-title">Low Stock</span>
                  <strong className="stat-value">12</strong>
                </div>
                <div className="stat-item">
                  <span className="stat-title">Categories</span>
                  <strong className="stat-value">18</strong>
                </div>
              </div>

              <div className="main-content">
                <div className="inventory-chart">
                  <div className="chart-title-row">
                    <span>Inventory Value</span>
                  </div>
                  <div className="inventory-chart__graph">
                    <div className="inventory-chart__bars">
                      <span style={{ height: '34%' }} />
                      <span style={{ height: '48%' }} />
                      <span style={{ height: '62%' }} />
                      <span style={{ height: '41%' }} />
                      <span style={{ height: '57%' }} />
                      <span style={{ height: '74%' }} />
                      <span style={{ height: '46%' }} />
                    </div>
                  </div>
                </div>

                <div className="low-stock-box">
                  <h4>Low Stock Alerts</h4>
                  <div className="alert-item">
                    <strong>Wireless Mouse</strong>
                    <span>2 units left</span>
                  </div>
                  <div className="alert-item">
                    <strong>USB-C Cable</strong>
                    <span>1 unit left</span>
                  </div>
                  <div className="alert-item">
                    <strong>A4 Paper Ream</strong>
                    <span>2 units left</span>
                  </div>
                </div>

                <div className="recent-activity">
                  <h4>Recent Activity</h4>
                  <div className="activity-item">
                    <strong>Purchase</strong>
                    <span>Office Chair added</span>
                  </div>
                  <div className="activity-item">
                    <strong>Stock Update</strong>
                    <span>Wireless Keyboard updated</span>
                  </div>
                  <div className="activity-item">
                    <strong>Purchase</strong>
                    <span>A4 Paper Ream restocked</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
