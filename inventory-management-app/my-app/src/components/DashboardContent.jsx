import React from 'react';
import { Link } from 'react-router-dom';
import MonthlySalesChart from './MonthlySalesChart';
import './DashboardContent.css';
import { LOW_STOCK_THRESHOLD } from '../constants/inventory';

const ACTIVITY_BUILDERS = {
  'item.created': (activity) => `Item added: ${activity.details?.name || 'New item'}`,
  'item.updated': (activity) => `Item updated: ${activity.details?.current?.name || activity.details?.previous?.name || 'Inventory item'}`,
  'item.deleted': (activity) => `Item deleted: ${activity.details?.name || 'Inventory item'}`,
  'purchase.created': (activity) => `Purchase made for item ${activity.details?.itemId || ''}`.trim(),
  'sale.created': (activity) => `Sale recorded for item ${activity.details?.itemId || ''}`.trim(),
  'transaction.recorded': (activity) => {
    const type = activity.details?.transactionType === 'stock-out' ? 'Stock-out recorded' : 'Stock-in recorded';
    return `${type} for item ${activity.details?.itemId || ''}`.trim();
  },
  'organization.invited_user': (activity) => `New user invited: ${activity.details?.email || 'team member'}`,
  'organization.updated_user_role': (activity) => `User role updated${activity.details?.email ? `: ${activity.details.email}` : ''}`,
  'organization.removed_user': (activity) => `User removed from organization${activity.details?.email ? `: ${activity.details.email}` : ''}`,
  'organization.revoked_invitation': (activity) => `Invitation revoked${activity.details?.email ? `: ${activity.details.email}` : ''}`,
  'organization.accepted_invitation': (activity) => `New user joined organization${activity.details?.email ? `: ${activity.details.email}` : ''}`
};

const ALLOWED_ACTIVITY_ACTIONS = new Set(Object.keys(ACTIVITY_BUILDERS));

const formatFallbackTransaction = (activity) =>
  `${activity.transactionType === 'stock-out' ? 'Stock-out recorded' : 'Stock-in recorded'} for ${activity.itemName}`;

const buildActivityLabel = (activity) => {
  if (!activity.action) {
    return formatFallbackTransaction(activity);
  }

  const formatter = ACTIVITY_BUILDERS[activity.action];
  return formatter ? formatter(activity) : null;
};

function DashboardContent({ items, categories, suppliers, transactions, purchases, sales, analytics, user }) {
  const lowStockItems = analytics.lowStockItems.length
    ? analytics.lowStockItems
    : items.filter((item) => item.quantity < LOW_STOCK_THRESHOLD);
  const totalInventoryValue = analytics.stats?.totalInventoryValue ?? items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const recentActivity = analytics.recentActivity.length
    ? analytics.recentActivity
      .filter((activity) => ALLOWED_ACTIVITY_ACTIONS.has(activity.action))
      .map((activity) => ({
        ...activity,
        label: buildActivityLabel(activity)
      }))
      .filter((activity) => activity.label)
      .slice(0, 6)
    : transactions.slice(0, 5).map((activity) => ({
        ...activity,
        label: formatFallbackTransaction(activity)
      }));
  const canViewFinance = ['admin', 'manager'].includes(user?.role);
  const totalRevenue = analytics.stats?.totalRevenue ?? sales.reduce((sum, sale) => sum + sale.quantity * sale.sellingPrice, 0);
  const totalPurchaseCost = analytics.stats?.totalPurchaseCost ?? purchases.reduce(
    (sum, purchase) => sum + purchase.quantity * purchase.purchasePrice,
    0
  );
  const topSellingProducts = analytics.topSellingProducts;
  const monthlySales = analytics.monthlySales;

  return (
    <main className="dashboard-content">
      <h1 className="welcome-title" data-scroll-slide="left" data-scroll-slide-initial>Welcome {user?.name || 'User'}!</h1>
      <p className="section-subtitle" data-scroll-slide="left" data-scroll-slide-initial>Organization: {user?.organizationName || 'N/A'}</p>

      <div className="stats-grid" data-scroll-slide="right" data-scroll-slide-initial>
        <div className="stat-card" data-cursor-card>
          <span className="stat-icon">Items</span>
          <span className="stat-number">{analytics.stats?.totalItems ?? items.length}</span>
          <span className="stat-label">Total Items in Inventory</span>
        </div>
        <div className="stat-card" data-cursor-card>
          <span className="stat-icon">Categories</span>
          <span className="stat-number">{analytics.stats?.totalCategories ?? categories.length}</span>
          <span className="stat-label">Number of Categories</span>
        </div>
        <div className="stat-card" data-cursor-card>
          <span className="stat-icon">Alerts</span>
          <span className="stat-number">{analytics.stats?.lowStockCount ?? lowStockItems.length}</span>
          <span className="stat-label">Low Stock Alerts</span>
        </div>
        <div className="stat-card" data-cursor-card>
          <span className="stat-icon">Value</span>
          <span className="stat-number">${totalInventoryValue.toFixed(2)}</span>
          <span className="stat-label">Total Stock Value</span>
        </div>
        {canViewFinance ? (
          <div className="stat-card" data-cursor-card>
            <span className="stat-icon">Sales</span>
            <span className="stat-number">{sales.length}</span>
            <span className="stat-label">Total Sales Records</span>
          </div>
        ) : null}
        {canViewFinance ? (
          <div className="stat-card" data-cursor-card>
            <span className="stat-icon">Purchases</span>
            <span className="stat-number">{purchases.length}</span>
            <span className="stat-label">Total Purchase Records</span>
          </div>
        ) : null}
      </div>

      <div className="content-grid">
        <div className="section" data-cursor-card>
          <h2 className="section-title" data-scroll-slide="left" data-scroll-slide-initial>Recent Activity</h2>
          <div className="activity-list">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={activity.id || activity.transactionId || index} className="activity-item">
                  <p className="activity-text">{activity.label}</p>
                  <span className="activity-date">
                    {new Date(activity.timestamp || activity.transactionDate).toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="no-data">No recent inventory activity</p>
            )}
          </div>
        </div>

        <div className="section" data-cursor-card>
          <h2 className="section-title" data-scroll-slide="right" data-scroll-slide-initial>Low Stock Alerts</h2>
          <div className="alerts-list">
            {lowStockItems.length > 0 ? (
              lowStockItems.map((item) => (
                <div key={item.itemId} className="alert-item">
                  <span className="alert-icon">Low</span>
                  <div className="alert-content">
                    <p className="alert-name">{item.itemName || item.name}</p>
                    <p className="alert-details">
                      Current stock: {item.quantity} {item.unit} (Threshold: {LOW_STOCK_THRESHOLD})
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">All items in stock</p>
            )}
          </div>
        </div>
      </div>

      <div className="quick-actions" data-cursor-card>
        <h2 className="section-title" data-scroll-slide="left" data-scroll-slide-initial>Quick Summary</h2>
        <div className="actions-buttons">
          <button className="action-btn add-btn">Suppliers: {analytics.stats?.totalSuppliers ?? suppliers.length}</button>
          <button className="action-btn view-btn">Transactions: {transactions.length}</button>
          <button className="action-btn report-btn">Role: {user?.role}</button>
          {canViewFinance ? (
            <button className="action-btn add-btn">Revenue: ${totalRevenue.toFixed(2)}</button>
          ) : null}
          {canViewFinance ? (
            <button className="action-btn view-btn">Spend: ${totalPurchaseCost.toFixed(2)}</button>
          ) : null}
        </div>
      </div>

      {canViewFinance ? (
        <div className="content-grid" style={{ marginTop: '2rem' }}>
          <div className="section" data-cursor-card>
            <h2 className="section-title" data-scroll-slide="left" data-scroll-slide-initial>Monthly Sales Trend</h2>
            <MonthlySalesChart months={monthlySales} />
          </div>

          <div className="section" data-cursor-card>
            <h2 className="section-title" data-scroll-slide="right" data-scroll-slide-initial>Top Selling Products</h2>
            <div className="alerts-list">
              {topSellingProducts.length ? topSellingProducts.map((product) => (
                <div key={product.itemId} className="alert-item">
                  <span className="alert-icon">Top</span>
                  <div className="alert-content">
                    <p className="alert-name">{product.itemName}</p>
                    <p className="alert-details">
                      {product.unitsSold} units sold, revenue ${product.revenue.toFixed(2)}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="no-data">
                  <Link className="sales-empty-link" to="/orders">Record a sale</Link> to see your top-selling products.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

export default DashboardContent;
