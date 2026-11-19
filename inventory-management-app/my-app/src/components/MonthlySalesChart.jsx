import React from 'react';
import './MonthlySalesChart.css';

export default function MonthlySalesChart({ months }) {
  if (!months.some((month) => month.salesCount > 0)) {
    return <p className="no-data">No sales recorded in the last six months.</p>;
  }

  const maxRevenue = Math.max(0, ...months.map((month) => month.revenue));

  return (
    <div className="monthly-sales-chart" role="group" aria-label="Monthly sales revenue">
      {months.map((month) => {
        const height = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0;
        const revenueLabel = `${month.label}: $${month.revenue.toFixed(2)}`;

        return (
          <div className="monthly-sales-chart__column" key={month.key ?? month.label}>
            <div className="monthly-sales-chart__plot" role="img" aria-label={revenueLabel} title={revenueLabel}>
              <div className="monthly-sales-chart__bar" style={{ height: `${height}%` }} />
            </div>
            <span className="monthly-sales-chart__caption" aria-hidden="true">{month.label}</span>
          </div>
        );
      })}
    </div>
  );
}
