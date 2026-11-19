import React, { useCallback, useEffect, useState } from 'react';
import CursorSurface from '../components/CursorSurface';
import Sidebar from '../components/Sidebar';
import InventoryContent from '../components/InventoryContent';
import './Inventory.css';
import { api } from '../lib/api';
import { mapCategory, mapItem, mapSupplier } from '../lib/adapters';
import useOrganizationRealtimeRefresh from '../hooks/useOrganizationRealtimeRefresh';

const buildItemFormData = (item) => {
  const formData = new FormData();
  formData.append('name', item.itemName);
  formData.append('category', item.categoryId);
  formData.append('quantity', String(Number(item.quantity)));
  formData.append('unit', item.unit);
  formData.append('supplier', item.supplierId);
  formData.append('price', String(Number(item.price)));
  formData.append('description', item.description || '');

  if (item.imageFile) {
    formData.append('image', item.imageFile);
  }

  return formData;
};

function Inventory({ user, onLogout }) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const [itemsRes, categoriesRes, suppliersRes] = await Promise.all([
        api.get('/api/items'),
        api.get('/api/categories'),
        api.get('/api/suppliers')
      ]);

      setItems(itemsRes.map(mapItem));
      setCategories(categoriesRes.map(mapCategory));
      setSuppliers(suppliersRes.map(mapSupplier));
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useOrganizationRealtimeRefresh(user, fetchData);

  const canManageItems = ['admin', 'manager', 'staff'].includes(user?.role);
  const canDeleteItems = user?.role === 'admin';
  const canManageCategories = ['admin', 'manager'].includes(user?.role);
  const canManageSuppliers = user?.role === 'admin';

  const handleAddItem = async (newItem) => {
    const response = await api.postForm('/api/items', buildItemFormData(newItem));

    setItems((currentItems) => [...currentItems, mapItem(response.item)]);
  };

  const handleUpdateItem = async (id, updatedItem) => {
    const response = await api.putForm(`/api/items/${id}`, buildItemFormData(updatedItem));

    setItems((currentItems) =>
      currentItems.map((item) => (item.id === id ? mapItem(response.item) : item))
    );
  };

  const handleDeleteItem = async (id) => {
    await api.delete(`/api/items/${id}`);
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  };

  const handleAddCategory = async (name) => {
    await api.post('/api/categories', { name, description: '' });
    await fetchData();
  };

  const handleAddSupplier = async (name) => {
    await api.post('/api/suppliers', {
      name,
      contactPerson: '',
      phone: '',
      address: ''
    });
    await fetchData();
  };

  return (
    <CursorSurface className="inventory" variant="inventory">
      <Sidebar user={user} onLogout={onLogout} currentPage="inventory" />
      <InventoryContent
        user={user}
        items={items}
        categories={categories}
        suppliers={suppliers}
        onAddItem={handleAddItem}
        onUpdateItem={handleUpdateItem}
        onDeleteItem={handleDeleteItem}
        onAddCategory={handleAddCategory}
        onAddSupplier={handleAddSupplier}
        canManageItems={canManageItems}
        canDeleteItems={canDeleteItems}
        canManageCategories={canManageCategories}
        canManageSuppliers={canManageSuppliers}
      />
    </CursorSurface>
  );
}

export default Inventory;
