import React from 'react';
import { useOutletContext } from 'react-router-dom'; // Add this
import styles from './TopProducts.module.css';

const TopProducts = () => {
  // 1. Grab data from the parent AdminDashboard context
  // Defaulting to empty arrays ensures .forEach() won't crash on initial render
  const { orders = [], inventory = [] } = useOutletContext();

  const getTopProducts = () => {
    const productCounts = {};

    orders.forEach(order => {
      if (['PAID', 'SHIPPED', 'COMPLETED'].includes(order.status)) {
        order.items?.forEach(item => {
          const product = inventory.find(p => p.id?.toString() === item.productId?.toString());
          const name = product ? product.name : `Product #${item.productId}`;
          productCounts[name] = (productCounts[name] || 0) + (item.quantity || 1);
        });
      }
    });

    return Object.entries(productCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const topProducts = getTopProducts();

  return (
    <div className={styles.topProductsSection}>
      <h2>Top Selling Products</h2>
      <div className={styles.productList}>
        {topProducts.length > 0 ? (
          topProducts.map((item, index) => (
            <div key={index} className={styles.productRankItem}>
              <span className={styles.rankNumber}>#{index + 1}</span>
              <div className={styles.rankInfo}>
                <span className={styles.rankName}>{item.name}</span>
                <span className={styles.rankCount}>{item.count} units sold</span>
              </div>
            </div>
          ))
        ) : (
          <p className={styles.emptyState}>No sales recorded yet.</p>
        )}
      </div>
    </div>
  );
};

export default TopProducts;