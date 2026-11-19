import React, { useState } from 'react';
import './OrdersContent.css';

function OrdersContent({ orders, items, onAddOrder, canCreate }) {
  const [formData, setFormData] = useState({
    itemId: '',
    quantity: '',
    sellingPrice: '',
    customerName: '',
    note: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAddOrder(formData);
    setFormData({
      itemId: '',
      quantity: '',
      sellingPrice: '',
      customerName: '',
      note: ''
    });
  };

  const getItemName = (id) => {
    return items.find((item) => item.itemId === id)?.itemName || 'N/A';
  };

  return (
    <main className="orders-content">
      <h1 className="page-title">Orders</h1>

      <div className="orders-container">
        <div className="orders-section" data-cursor-card>
          <h2 className="section-subtitle">Order List</h2>
          <div className="orders-table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Note</th>
                  <th>User</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.saleId}>
                      <td>{order.saleId.slice(-6)}</td>
                      <td>{new Date(order.saleDate).toLocaleDateString()}</td>
                      <td>{getItemName(order.itemId)}</td>
                      <td>{order.quantity}</td>
                      <td>{order.customerName || order.note || '-'}</td>
                      <td>{order.performedBy}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" className="no-data">No orders</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="form-section" data-cursor-card>
          <h2 className="section-subtitle" data-scroll-slide="right">Create Stock-Out Sale</h2>
          {!canCreate ? <div className="error-message">Only admin and manager roles can create sales.</div> : null}
          <form onSubmit={handleSubmit} className="add-order-form">
            <div className="form-group">
              <label>Item</label>
              <select
                value={formData.itemId}
                onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                required
                disabled={!canCreate}
              >
                <option value="">Select item</option>
                {items.map((item) => (
                  <option key={item.itemId} value={item.itemId}>{item.itemName}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                min="1"
                inputMode="numeric"
                required
                disabled={!canCreate}
              />
            </div>

            <div className="form-group">
              <label>Customer Name</label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="e.g., Walk-in customer"
                disabled={!canCreate}
              />
            </div>

            <div className="form-group">
              <label>Selling Price</label>
              <input
                type="number"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                min="0"
                step="0.01"
                inputMode="decimal"
                required
                disabled={!canCreate}
              />
            </div>

            <div className="form-group">
              <label>Order Note</label>
              <input
                type="text"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="Optional note"
                disabled={!canCreate}
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="submit-btn" data-cursor-button disabled={!canCreate}>Submit</button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

export default OrdersContent;
