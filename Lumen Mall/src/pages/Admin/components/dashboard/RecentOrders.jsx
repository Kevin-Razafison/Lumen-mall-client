import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom'; // Add these
import styles from './RecentOrders.module.css';

const RecentOrders = () => {
  // 1. Grab orders from the AdminDashboard context
  const { orders = [] } = useOutletContext();
  const navigate = useNavigate();

  // 2. Safely spread and sort (works because orders defaults to [])
  const recentOrders = [...orders].sort((a, b) => b.id - a.id).slice(0, 5);

  return (
    <div className={styles.recentOrdersSection}>
      <div className={styles.sectionHeader}>
        <h2>Recent Activity</h2>
        {/* 3. Use navigate instead of setActiveTab */}
        <button onClick={() => navigate('/admin/orders')} className={styles.viewAllBtn}>
          View All Orders
        </button>
      </div>
      <table className={styles.miniTable}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {recentOrders.length > 0 ? (
            recentOrders.map(order => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.customerEmail}</td>
                <td>
                  <span className={`${styles.statusBadge} ${styles[order.status?.toLowerCase()]}`}>
                    {order.status}
                  </span>
                </td>
                <td>${order.totalAmount?.toFixed(2)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center', padding: '10px' }}>No recent orders.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RecentOrders;