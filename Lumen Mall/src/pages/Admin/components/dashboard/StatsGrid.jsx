import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom'; // Add these
import styles from './StatsGrid.module.css';

const StatsGrid = () => {
  // 1. Grab data from the Outlet context (provided by AdminDashboard)
  // We add = [] to ensure that if the data isn't there yet, it's at least an empty list
  const { inventory = [], orders = [], reviews = [] } = useOutletContext();
  const navigate = useNavigate();

  // 2. Safely calculate stats
  const lowStockCount = inventory.filter(p => p.stock > 0 && p.stock <= 5).length;
  const pendingReplies = reviews.filter(rev => !rev.adminReply).length;
  const totalHelpfulVotes = reviews.reduce((acc, rev) => acc + (rev.helpfulCount || 0), 0);

  return (
    <div className={styles.statsGrid}>
      {/* 1. Total Products */}
      <div
        className={styles.statCard}
        onClick={() => navigate('/admin/inventory')} // Use navigate instead of setActiveTab
      >
        <h3>Total Products</h3>
        <p className={styles.statNumber}>{inventory.length}</p>
      </div>

      {/* 2. Total Revenue */}
      <div className={styles.statCard}>
        <h3>Total Revenue</h3>
        <p className={styles.statNumber}>
          ${orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0).toFixed(2)}
        </p>
      </div>

      {/* 3. Community Engagement (Helpful Votes) */}
      <div className={styles.statCard} style={{ borderLeftColor: '#f0c14b' }}>
        <h3>Helpful Votes</h3>
        <p className={styles.statNumber}>{totalHelpfulVotes} 👍</p>
      </div>

      {/* 4. Action Needed: Unanswered Reviews */}
      <div
        className={`${styles.statCard} ${pendingReplies > 0 ? styles.warningCard : ''}`}
        onClick={() => navigate('/admin/reviews')}
      >
        <h3>Pending Replies</h3>
        <p className={styles.statNumber}>{pendingReplies}</p>
        {pendingReplies > 0 && <span className={styles.actionPrompt}>Reply Now →</span>}
      </div>

      {/* 5. Inventory Alert: Low Stock */}
      <div
        className={`${styles.statCard} ${lowStockCount > 0 ? styles.warningCard : ''}`}
        onClick={() => navigate('/admin/inventory')}
      >
        <h3>Low Stock</h3>
        <p className={styles.statNumber}>{lowStockCount}</p>
        {lowStockCount > 0 && <span className={styles.actionPrompt}>Restock →</span>}
      </div>
    </div>
  );
};

export default StatsGrid;