import React from 'react';
import { useOutletContext } from 'react-router-dom'; // Add this
import styles from './MonthlyRevenueChart.module.css';

const MonthlyRevenueChart = () => {
  // 1. Grab orders from the AdminDashboard context
  // We default to an empty array [] so .forEach and .map never fail
  const { orders = [] } = useOutletContext();

  const getMonthlySalesData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const salesMap = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      salesMap[months[d.getMonth()]] = 0;
    }

    // This now works because orders is at least []
    orders.forEach(order => {
      if (order.status === 'PAID' || order.status === 'COMPLETED' || order.status === 'SHIPPED') {
        const date = new Date(order.createdAt || Date.now());
        const monthName = months[date.getMonth()];
        if (salesMap.hasOwnProperty(monthName)) {
          salesMap[monthName] += (order.totalAmount || 0);
        }
      }
    });

    return Object.entries(salesMap).map(([name, total]) => ({ name, total }));
  };

  const exportOrdersToCSV = () => {
    if (orders.length === 0) return alert("No orders to export!");

    const headers = ["Order ID,Customer Email,Total Amount,Status,Payment Method,Date"];
    const rows = orders.map(order => [
      order.id,
      order.customerEmail,
      order.totalAmount,
      order.status,
      order.paymentMethod,
      new Date(order.createdAt).toLocaleDateString()
    ].join(","));

    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `LumenMall_Sales_Report_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const monthlySales = getMonthlySalesData();
  const maxSales = Math.max(...monthlySales.map(s => s.total), 100);

  return (
    <div className={styles.reportSection}>
      <div className={styles.reportHeader}>
        <h2>Monthly Revenue (Last 6 Months)</h2>
        <button onClick={exportOrdersToCSV} className={styles.exportBtn}>
          📥 Export CSV
        </button>
      </div>
      <div className={styles.chartContainer}>
        {monthlySales.map(data => (
          <div key={data.name} className={styles.chartBarWrapper}>
            <div className={styles.barLabel}>${data.total.toFixed(0)}</div>
            <div
              className={styles.chartBar}
              style={{ height: `${(data.total / maxSales) * 150}px` }}
            ></div>
            <div className={styles.monthName}>{data.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthlyRevenueChart;