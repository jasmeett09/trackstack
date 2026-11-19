import React, { useCallback, useEffect, useState } from 'react';
import CursorSurface from '../components/CursorSurface';
import Sidebar from '../components/Sidebar';
import PurchaseContent from '../components/PurchaseContent';
import './Purchase.css';
import { api } from '../lib/api';
import { mapItem, mapPurchase, mapSupplier } from '../lib/adapters';
import useOrganizationRealtimeRefresh from '../hooks/useOrganizationRealtimeRefresh';

function Purchase({ user, onLogout }) {
  const [purchases, setPurchases] = useState([]);
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const [purchasesRes, itemsRes, suppliersRes] = await Promise.all([
        api.get('/api/purchases'),
        api.get('/api/items'),
        api.get('/api/suppliers')
      ]);

      setPurchases(purchasesRes.map(mapPurchase));
      setItems(itemsRes.map(mapItem));
      setSuppliers(suppliersRes.map(mapSupplier));
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useOrganizationRealtimeRefresh(user, fetchData);

  const handleAddPurchase = async (newPurchase) => {
    await api.post('/api/purchases', {
      item: newPurchase.itemId,
      supplier: newPurchase.supplierId,
      quantity: Number(newPurchase.quantity),
      purchasePrice: Number(newPurchase.purchasePrice),
      note: newPurchase.note
    });

    fetchData();
  };

  return (
    <CursorSurface className="purchase" variant="transactions">
      <Sidebar user={user} onLogout={onLogout} currentPage="purchase" />
      <PurchaseContent
        purchases={purchases}
        items={items}
        suppliers={suppliers}
        onAddPurchase={handleAddPurchase}
        canCreate={['admin', 'manager'].includes(user?.role)}
      />
    </CursorSurface>
  );
}

export default Purchase;
