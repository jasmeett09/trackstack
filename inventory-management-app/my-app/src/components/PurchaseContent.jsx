import React, { useState } from 'react';
import './PurchaseContent.css';

function PurchaseContent({ purchases, items, suppliers, onAddPurchase, canCreate }) {
  const [formData, setFormData] = useState({
    itemId: '',
    quantity: '',
    supplierId: '',
    purchasePrice: '',
    note: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAddPurchase(formData);
    setFormData({
      itemId: '',
      quantity: '',
      supplierId: '',
      purchasePrice: '',
      note: ''
    });
  };

  const getItemName = (id) => {
    return items.find((item) => item.itemId === id)?.itemName || 'N/A';
  };

  return (
    <main className="purchase-content">
      <h1 className="page-title">Purchase</h1>

      <div className="purchase-container">
        <div className="purchases-section" data-cursor-card>
          <h2 className="section-subtitle">Purchase List</h2>
          <div className="purchases-table-wrapper">
            <table className="purchases-table">
              <thead>
                <tr>
                  <th>Purchase ID</th>
                  <th>Date</th>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Supplier</th>
                  <th>User</th>
                </tr>
              </thead>
              <tbody>
                {purchases.length > 0 ? (
                  purchases.map((purchase) => (
                    <tr key={purchase.purchaseId}>
                      <td>{purchase.purchaseId.slice(-6)}</td>
                      <td>{new Date(purchase.purchaseDate).toLocaleDateString()}</td>
                      <td>{getItemName(purchase.itemId)}</td>
                      <td>{purchase.quantity}</td>
                      <td>{purchase.supplierName || '-'}</td>
                      <td>{purchase.performedBy}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" className="no-data">No purchases</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="form-section" data-cursor-card>
          <h2 className="section-subtitle" data-scroll-slide="right">Create Stock-In Purchase</h2>
          {!canCreate ? <div className="error-message">Only admin and manager roles can create purchases.</div> : null}
          <form onSubmit={handleSubmit} className="add-purchase-form">
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
              <label>Supplier</label>
              <select
                value={formData.supplierId}
                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                required
                disabled={!canCreate}
              >
                <option value="">Select supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.supplierId} value={supplier.supplierId}>{supplier.supplierName}</option>
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
              <label>Purchase Price</label>
              <input
                type="number"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                min="0"
                step="0.01"
                inputMode="decimal"
                required
                disabled={!canCreate}
              />
            </div>

            <div className="form-group">
              <label>Purchase Note</label>
              <input
                type="text"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="e.g., Restocking"
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

export default PurchaseContent;
