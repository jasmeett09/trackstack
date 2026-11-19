import React from 'react';
import './ShowcaseSection.css';

const notes = [
  {
    title: 'Stock Overview',
    body: 'Get a snapshot of your total items and categories.'
  },
  {
    title: 'Inventory Value',
    body: 'Monitor inventory value over time with trends.'
  },
  {
    title: 'Low Stock Alerts',
    body: 'Quickly identify items that need restocking.'
  },
  {
    title: 'Recent Activity',
    body: 'Stay updated on the latest inventory actions.'
  }
];

function ShowcaseSection() {
  return (
    <section className="showcase-section" id="about">
      <div className="showcase-section__layout">
        <div className="showcase-section__content" data-scroll-slide="left">
          <span className="landing-eyebrow">Product Preview</span>
          <h2>See your entire inventory at a glance.</h2>
          <p>
            TrackStack gives you a real-time overview of your inventory, so you can make
            smarter decisions, faster.
          </p>
        </div>

        <div className="showcase-board">
          <div className="showcase-board__frame">
            <aside className="showcase-board__sidebar">
              <div className="showcase-board__brand">
                <span>⬢</span>
                <strong>TrackStack</strong>
              </div>
              <div className="showcase-board__nav">
                <span className="active">Dashboard</span>
                <span>Inventory</span>
                <span>Suppliers</span>
                <span>Reports</span>
              </div>
            </aside>

            <div className="showcase-board__main">
              <div className="showcase-board__cards">
                <article>
                  <span>Total Items</span>
                  <strong>1,240</strong>
                </article>
                <article>
                  <span>Inventory Value</span>
                  <strong>₹4.8L</strong>
                </article>
                <article>
                  <span>Low Stock Items</span>
                  <strong>12</strong>
                </article>
                <article>
                  <span>Categories</span>
                  <strong>18</strong>
                </article>
              </div>

              <div className="showcase-board__grid">
                <div className="showcase-chart">
                  <div className="chart-title-row">
                    <span>Inventory Value</span>
                  </div>
                  <div className="showcase-chart__line">
                    <div className="showcase-chart__bars">
                      <span style={{ height: '34%' }} />
                      <span style={{ height: '48%' }} />
                      <span style={{ height: '62%' }} />
                      <span style={{ height: '44%' }} />
                      <span style={{ height: '58%' }} />
                      <span style={{ height: '76%' }} />
                      <span style={{ height: '50%' }} />
                    </div>
                  </div>
                </div>

                <div className="showcase-board__alerts">
                  <h3>Low Stock Alerts</h3>
                  <div>
                    <strong>Wireless Mouse</strong>
                    <span>2 units left</span>
                  </div>
                  <div>
                    <strong>USB-C Cable</strong>
                    <span>1 unit left</span>
                  </div>
                  <div>
                    <strong>A4 Paper Ream</strong>
                    <span>2 units left</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {notes.map((note, index) => (
            <div className={`showcase-note showcase-note--${index + 1}`} key={note.title}>
              <strong>{note.title}</strong>
              <span>{note.body}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ShowcaseSection;
