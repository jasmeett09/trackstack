import React, { useState } from 'react';
import './InventoryContent.css';
import { LOW_STOCK_THRESHOLD } from '../constants/inventory';

function InventoryContent({
  user,
  items,
  categories,
  suppliers,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onAddCategory,
  onAddSupplier,
  canManageItems,
  canDeleteItems,
  canManageCategories,
  canManageSuppliers
}) {
  const [formData, setFormData] = useState({
    itemName: '',
    categoryId: '',
    quantity: '',
    price: '',
    unit: '',
    supplierId: '',
    description: '',
    imageUrl: '',
    imageFile: null
  });
  const [categoryName, setCategoryName] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const filteredItems = items.filter((item) =>
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      itemName: '',
      categoryId: '',
      quantity: '',
      price: '',
      unit: '',
      supplierId: '',
      description: '',
      imageUrl: '',
      imageFile: null
    });
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setErrorMessage('');
  };

  const showError = (message) => {
    setErrorMessage(message);
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canManageItems) {
      showError('Your role does not have permission to manage inventory items.');
      return;
    }
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (editingId) {
        await onUpdateItem(editingId, formData);
        showSuccess('Item updated successfully.');
      } else {
        await onAddItem(formData);
        showSuccess('Item added successfully.');
      }

      resetForm();
    } catch (error) {
      showError(error.message || 'Unable to save item.');
    }
  };

  const handleEdit = (item) => {
    if (!canManageItems) {
      showError('Your role does not have permission to edit items.');
      return;
    }
    setFormData(item);
    setEditingId(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!canManageCategories) {
      showError('Only admin and manager roles can add categories.');
      return;
    }
    if (!categoryName.trim()) return;

    try {
      await onAddCategory(categoryName.trim());
      setCategoryName('');
      showSuccess('Category added successfully.');
    } catch (error) {
      showError(error.message || 'Unable to add category.');
    }
  };

  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    if (!canManageSuppliers) {
      showError('Only admin users can add suppliers.');
      return;
    }
    if (!supplierName.trim()) return;

    try {
      await onAddSupplier(supplierName.trim());
      setSupplierName('');
      showSuccess('Supplier added successfully.');
    } catch (error) {
      showError(error.message || 'Unable to add supplier.');
    }
  };

  return (
    <main className="inventory-content">
      <h1 className="page-title">Inventory</h1>
      <p className="section-subtitle">Signed in as {user?.role}</p>

      <div className="inventory-container">
        <div className="items-section" data-cursor-card>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="items-table-wrapper">
            <h2 className="section-subtitle">Items</h2>
            <table className="items-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Item ID</th>
                      <th>Item Name</th>
                      <th>Category</th>
                      <th>Quantity</th>
                      <th>Price / Unit</th>
                      <th>Supplier</th>
                      <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <tr key={item.itemId}>
                      <td>
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.itemName} className="inventory-item-thumb" />
                        ) : (
                          <span className="image-placeholder">No image</span>
                        )}
                      </td>
                      <td>{item.itemId.slice(-6)}</td>
                      <td>{item.itemName}</td>
                      <td>{item.categoryName}</td>
                      <td>
                        <span className={`quantity ${item.quantity < LOW_STOCK_THRESHOLD ? 'low' : ''}`}>{item.quantity}</span>
                      </td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>{item.supplierName}</td>
                      <td className="actions-cell">
                        {canManageItems ? (
                          <button className="edit-btn" onClick={() => handleEdit(item)}>Edit</button>
                        ) : null}
                        {canDeleteItems ? (
                          <button className="delete-btn" onClick={() => onDeleteItem(item.id)}>Delete</button>
                        ) : null}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="8" className="no-data">No items found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="form-section" data-cursor-card>
          {errorMessage ? <div className="error-message">{errorMessage}</div> : null}
          {successMessage ? <div className="success-message">{successMessage}</div> : null}
          <h2 className="section-subtitle" data-scroll-slide="right">{editingId ? 'Edit Item' : 'Add Item'}</h2>
          {!canManageItems ? <div className="error-message">This role has read-only inventory access.</div> : null}
          <form onSubmit={handleSubmit} className="add-item-form">
            <div className="form-group">
              <label>Item Name</label>
              <input
                type="text"
                value={formData.itemName}
                onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                placeholder="e.g., Item A"
                required
                disabled={!canManageItems}
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                required
                disabled={!canManageItems}
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.categoryId} value={category.categoryId}>{category.categoryName}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                min="0"
                inputMode="numeric"
                disabled={!canManageItems}
              />
            </div>

            <div className="form-group">
              <label>Price</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                min="0"
                step="0.01"
                inputMode="decimal"
                disabled={!canManageItems}
              />
            </div>

            <div className="form-group">
              <label>Unit</label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="e.g., pcs, kg, litre"
                required
                disabled={!canManageItems}
              />
            </div>

            <div className="form-group">
              <label>Supplier</label>
              <select
                value={formData.supplierId}
                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                required
                disabled={!canManageItems}
              >
                <option value="">Select supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.supplierId} value={supplier.supplierId}>{supplier.supplierName}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                disabled={!canManageItems}
              />
            </div>

            <div className="form-group">
              <label>Item Image</label>
              <input
                type="file"
                accept="image/*"
                disabled={!canManageItems}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    imageFile: e.target.files?.[0] || null
                  })
                }
              />
              {formData.imageUrl ? (
                <img src={formData.imageUrl} alt={formData.itemName || 'Preview'} className="inventory-form-preview" />
              ) : null}
            </div>

            <div className="form-buttons">
              <button type="submit" className="submit-btn" data-cursor-button disabled={!canManageItems}>{editingId ? 'Update' : 'Submit'}</button>
              {editingId && (
                <button type="button" className="reset-btn" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>

          <form onSubmit={handleCreateCategory} className="add-item-form" style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label>Quick Add Category</label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="e.g., Electronics"
                disabled={!canManageCategories}
              />
            </div>
            <button type="submit" className="submit-btn" data-cursor-button disabled={!canManageCategories}>Add Category</button>
          </form>

          <form onSubmit={handleCreateSupplier} className="add-item-form" style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label>Quick Add Supplier</label>
              <input
                type="text"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="e.g., ABC Supplier"
                disabled={!canManageSuppliers}
              />
            </div>
            <button type="submit" className="submit-btn" data-cursor-button disabled={!canManageSuppliers}>Add Supplier</button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default InventoryContent;
