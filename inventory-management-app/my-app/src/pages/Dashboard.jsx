import React, { useCallback, useEffect, useState } from 'react';
import CursorSurface from '../components/CursorSurface';
import Sidebar from '../components/Sidebar';
import DashboardContent from '../components/DashboardContent';
import './Dashboard.css';
import { api } from '../lib/api';
import { mapAnalytics, mapCategory, mapItem, mapPurchase, mapSale, mapSupplier, mapTransaction } from '../lib/adapters';
import useOrganizationRealtimeRefresh from '../hooks/useOrganizationRealtimeRefresh';

function Dashboard({ user, onLogout }) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [analytics, setAnalytics] = useState({
    stats: null,
    lowStockItems: [],
    topSellingProducts: [],
    monthlySales: [],
    recentActivity: []
  });

  const fetchData = useCallback(async () => {
    try {
      const requests = [
        api.get('/api/items'),
        api.get('/api/categories'),
        api.get('/api/suppliers'),
        api.get('/api/transactions'),
        api.get('/api/analytics/dashboard')
      ];

      if (['admin', 'manager'].includes(user?.role)) {
        requests.push(api.get('/api/purchases'));
        requests.push(api.get('/api/sales'));
      }

      const [
        itemsRes,
        categoriesRes,
        suppliersRes,
        transactionsRes,
        analyticsRes,
        purchasesRes = [],
        salesRes = []
      ] = await Promise.all(requests);

      setItems(itemsRes.map(mapItem));
      setCategories(categoriesRes.map(mapCategory));
      setSuppliers(suppliersRes.map(mapSupplier));
      setTransactions(transactionsRes.map(mapTransaction));
      setAnalytics(mapAnalytics(analyticsRes));
      setPurchases(purchasesRes.map(mapPurchase));
      setSales(salesRes.map(mapSale));
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  }, [user?.role]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useOrganizationRealtimeRefresh(user, fetchData);

  return (
    <CursorSurface className="dashboard">
      <Sidebar user={user} onLogout={onLogout} currentPage="dashboard" />
      <DashboardContent
        items={items}
        categories={categories}
        suppliers={suppliers}
        transactions={transactions}
        purchases={purchases}
        sales={sales}
        analytics={analytics}
        user={user}
      />
    </CursorSurface>
  );
}

export default Dashboard;
