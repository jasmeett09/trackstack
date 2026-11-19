import React, { useCallback, useEffect, useState } from 'react';
import CursorSurface from '../components/CursorSurface';
import Sidebar from '../components/Sidebar';
import OrdersContent from '../components/OrdersContent';
import './Orders.css';
import { api } from '../lib/api';
import { mapItem, mapSale } from '../lib/adapters';
import useOrganizationRealtimeRefresh from '../hooks/useOrganizationRealtimeRefresh';

function Orders({ user, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const [transactionsRes, itemsRes] = await Promise.all([
        api.get('/api/sales'),
        api.get('/api/items')
      ]);

      setOrders(transactionsRes.map(mapSale));
      setItems(itemsRes.map(mapItem));
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useOrganizationRealtimeRefresh(user, fetchData);

  const handleAddOrder = async (newOrder) => {
    await api.post('/api/sales', {
      item: newOrder.itemId,
      customerName: newOrder.customerName,
      quantity: Number(newOrder.quantity),
      sellingPrice: Number(newOrder.sellingPrice),
      note: newOrder.note
    });

    fetchData();
  };

  return (
    <CursorSurface className="orders" variant="transactions">
      <Sidebar user={user} onLogout={onLogout} currentPage="orders" />
      <OrdersContent
        orders={orders}
        items={items}
        onAddOrder={handleAddOrder}
        canCreate={['admin', 'manager'].includes(user?.role)}
      />
    </CursorSurface>
  );
}

export default Orders;
