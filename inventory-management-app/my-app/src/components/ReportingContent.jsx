import React from 'react';
import MonthlySalesChart from './MonthlySalesChart';
import './ReportingContent.css';

function ReportingContent({
  items,
  orders,
  purchases,
  analytics,
  activityLogs,
  inventoryLogs,
  onExportInventoryPdf,
  onExportSalesCsv,
  onExportPurchasesCsv
}) {
  const totalProducts = analytics.stats?.totalItems ?? items.length;
  const totalInventoryValue = analytics.stats?.totalInventoryValue ?? items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const totalOrders = analytics.stats?.totalSales ?? orders.length;
  const totalRevenue = analytics.stats?.totalRevenue ?? orders.reduce(
    (sum, order) => sum + order.quantity * (order.sellingPrice || 0),
    0
  );
  const totalPurchases = analytics.stats?.totalPurchases ?? purchases.length;
  const totalPurchaseCost = analytics.stats?.totalPurchaseCost ?? purchases.reduce(
    (sum, purchase) => sum + purchase.quantity * (purchase.purchasePrice || 0),
    0
  );
  const grossProfit = analytics.stats?.grossProfit ?? totalRevenue - totalPurchaseCost;
  const monthlySales = analytics.monthlySales || [];
  const topSellingProducts = analytics.topSellingProducts || [];
  const lowStockItems = analytics.lowStockItems || [];
  const recentActivityLogs = activityLogs || [];
  const recentInventoryLogs = inventoryLogs || [];

  return (
    <main className="reporting-content">
      <h1 className="page-title">Reporting & Analytics</h1>

      <section className="report-section export-section" data-cursor-card>
        <div className="export-header">
          <div>
            <h2 className="section-title">Export Reports</h2>
            <p className="export-subtitle">Download organization-specific inventory and transaction reports.</p>
          </div>
          <div className="export-actions">
            <button type="button" className="export-btn primary" data-cursor-button onClick={onExportInventoryPdf}>
              Export Inventory PDF
            </button>
            <button type="button" className="export-btn" data-cursor-button onClick={onExportSalesCsv}>
              Export Sales CSV
            </button>
            <button type="button" className="export-btn" data-cursor-button onClick={onExportPurchasesCsv}>
              Export Purchases CSV
            </button>
          </div>
        </div>
      </section>

      <div className="sections">
        <section className="report-section" data-cursor-card>
          <h2 className="section-title" data-scroll-slide="left">Inventory Overview</h2>
          <div className="stats-grid">
            <div className="stat-box" data-cursor-card>
              <span className="stat-icon">Items</span>
              <div className="stat-info">
                <p className="stat-label">Total Products</p>
                <p className="stat-value">{totalProducts}</p>
              </div>
            </div>
            <div className="stat-box" data-cursor-card>
              <span className="stat-icon">Value</span>
              <div className="stat-info">
                <p className="stat-label">Total Inventory Value</p>
                <p className="stat-value">${totalInventoryValue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="report-section" data-cursor-card>
          <h2 className="section-title" data-scroll-slide="right">Sales Overview</h2>
          <div className="stats-grid">
            <div className="stat-box" data-cursor-card>
              <span className="stat-icon">Out</span>
              <div className="stat-info">
                <p className="stat-label">Total Sales</p>
                <p className="stat-value">{totalOrders}</p>
              </div>
            </div>
            <div className="stat-box" data-cursor-card>
              <span className="stat-icon">Revenue</span>
              <div className="stat-info">
                <p className="stat-label">Total Revenue</p>
                <p className="stat-value">${totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="report-section" data-cursor-card>
          <h2 className="section-title" data-scroll-slide="left">Purchase Overview</h2>
          <div className="stats-grid">
            <div className="stat-box" data-cursor-card>
              <span className="stat-icon">In</span>
              <div className="stat-info">
                <p className="stat-label">Total Purchases</p>
                <p className="stat-value">{totalPurchases}</p>
              </div>
            </div>
            <div className="stat-box" data-cursor-card>
              <span className="stat-icon">Cost</span>
              <div className="stat-info">
                <p className="stat-label">Total Purchase Cost</p>
                <p className="stat-value">${totalPurchaseCost.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="report-section" data-cursor-card>
          <h2 className="section-title" data-scroll-slide="right">Low Stock Overview</h2>
          <div className="stats-grid">
            <div className="stat-box" data-cursor-card>
              <span className="stat-icon">Alerts</span>
              <div className="stat-info">
                <p className="stat-label">Low Stock Items</p>
                <p className="stat-value">{analytics.stats?.lowStockCount ?? lowStockItems.length}</p>
              </div>
            </div>
            <div className="stat-box" data-cursor-card>
              <span className="stat-icon">Watch</span>
              <div className="stat-info">
                <p className="stat-label">Most Urgent Item</p>
                <p className="stat-value">{lowStockItems[0]?.name || 'None'}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="report-section full-width" data-cursor-card>
          <h2 className="section-title" data-scroll-slide="left">Summary Report</h2>
          <div className="summary-table">
            <table>
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Total Items in Inventory</td>
                  <td>{items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                </tr>
                <tr>
                  <td>Average Item Price</td>
                  <td>
                    $
                    {items.length > 0
                      ? (items.reduce((sum, item) => sum + item.price, 0) / items.length).toFixed(2)
                      : '0.00'}
                  </td>
                </tr>
                <tr>
                  <td>Total Sales Recorded</td>
                  <td>{totalOrders}</td>
                </tr>
                <tr>
                  <td>Total Purchases Made</td>
                  <td>{totalPurchases}</td>
                </tr>
                <tr>
                  <td>Profit/Loss (Revenue - Cost)</td>
                  <td className={grossProfit >= 0 ? 'positive' : 'negative'}>
                    ${grossProfit.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="report-section full-width" data-cursor-card>
          <h2 className="section-title" data-scroll-slide="right">Monthly Sales Trend</h2>
          <MonthlySalesChart months={monthlySales} />
        </section>

        <section className="report-section full-width" data-cursor-card>
          <h2 className="section-title" data-scroll-slide="left">Top Selling Products</h2>
          <div className="summary-table">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Units Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topSellingProducts.length ? topSellingProducts.map((product) => (
                  <tr key={product.itemId}>
                    <td>{product.itemName}</td>
                    <td>{product.unitsSold}</td>
                    <td>${product.revenue.toFixed(2)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="3">No sales data yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="report-section full-width" data-cursor-card>
          <h2 className="section-title" data-scroll-slide="right">Organization Activity Trail</h2>
          <div className="summary-table">
            <table>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Details</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {recentActivityLogs.length ? recentActivityLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.action}</td>
                    <td>{log.entity}</td>
                    <td>{Object.keys(log.details).length ? JSON.stringify(log.details) : 'No details'}</td>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4">No activity logs recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="report-section full-width" data-cursor-card>
          <h2 className="section-title" data-scroll-slide="left">Inventory Audit Trail</h2>
          <div className="summary-table">
            <table>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Item</th>
                  <th>Quantity Change</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {recentInventoryLogs.length ? recentInventoryLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.action}</td>
                    <td>{log.metadata?.itemName || log.itemId || 'Unknown item'}</td>
                    <td>{log.oldQuantity} → {log.newQuantity}</td>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4">No inventory audit entries recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

export default ReportingContent;
