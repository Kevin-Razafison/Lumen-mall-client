import React from 'react';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  return (
    <div className={styles.adminContainer}>
      <aside className={styles.sidebar}>
        <h2>Lumen Admin</h2>
        <ul>
          <li>Inventory</li>
          <li>Orders</li>
          <li>Users</li>
        </ul>
      </aside>
      <main className={styles.content}>
        <h1>Dashboard Overview</h1>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>Total Sales: $12,400</div>
          <div className={styles.statCard}>Active Orders: 15</div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;