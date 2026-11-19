import React, { useCallback, useEffect, useState } from 'react';
import CursorSurface from '../components/CursorSurface';
import Sidebar from '../components/Sidebar';
import ReportingContent from '../components/ReportingContent';
import './Reporting.css';
import { api, buildApiUrl } from '../lib/api';
import { mapActivityLog, mapAnalytics, mapInventoryLog, mapItem, mapPurchase, mapSale } from '../lib/adapters';
import useOrganizationRealtimeRefresh from '../hooks/useOrganizationRealtimeRefresh';

function Reporting({ user, onLogout }) {
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [inventoryLogs, setInventoryLogs] = useState([]);
  const [analytics, setAnalytics] = useState({
    stats: null,
    lowStockItems: [],
    topSellingProducts: [],
    monthlySales: [],
    recentActivity: []
  });

  const fetchData = useCallback(async () => {
    try {
      const [itemsRes, purchasesRes, salesRes, analyticsRes, activityRes, inventoryLogsRes] = await Promise.all([
        api.get('/api/items'),
        api.get('/api/purchases'),
        api.get('/api/sales'),
        api.get('/api/analytics/dashboard'),
        api.get('/api/organization/activity'),
        api.get('/api/organization/inventory-logs')
      ]);

      setItems(itemsRes.map(mapItem));
      setOrders(salesRes.map(mapSale));
      setPurchases(purchasesRes.map(mapPurchase));
      setAnalytics(mapAnalytics(analyticsRes));
      setActivityLogs(activityRes.map(mapActivityLog));
      setInventoryLogs(inventoryLogsRes.map(mapInventoryLog));
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useOrganizationRealtimeRefresh(user, fetchData);

  const downloadReport = async (url, fallbackName) => {
    try {
      const response = await fetch(buildApiUrl(url), {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Could not export report.');
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get('content-disposition') || '';
      const fileNameMatch = contentDisposition.match(/filename="([^"]+)"/i);
      const fileName = fileNameMatch?.[1] || fallbackName;
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Report export failed:', error);
      window.alert(error.message || 'Failed to export report.');
    }
  };

  const handleExportInventoryPdf = () => downloadReport('/api/reports/export/inventory-pdf', 'inventory-report.pdf');
  const handleExportSalesCsv = () => downloadReport('/api/reports/export/sales-csv', 'sales-report.csv');
  const handleExportPurchasesCsv = () => downloadReport('/api/reports/export/purchases-csv', 'purchase-report.csv');

  return (
    <CursorSurface className="reporting" variant="reporting">
      <Sidebar user={user} onLogout={onLogout} currentPage="reporting" />
      <ReportingContent
        items={items}
        orders={orders}
        purchases={purchases}
        analytics={analytics}
        activityLogs={activityLogs}
        inventoryLogs={inventoryLogs}
        onExportInventoryPdf={handleExportInventoryPdf}
        onExportSalesCsv={handleExportSalesCsv}
        onExportPurchasesCsv={handleExportPurchasesCsv}
      />
    </CursorSurface>
  );
}

export default Reporting;
