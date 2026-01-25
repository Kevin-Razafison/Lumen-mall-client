import React, { useEffect, useState } from 'react';
import styles from './Orders.module.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8080/api/orders')
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching orders:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className={styles.loader}>Loading your orders...</div>;

  return (
    <div className={styles.ordersContainer}>
      <h1>Your Order History</h1>
      {orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        <div className={styles.orderList}>
          {orders.map(order => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <span>Order #{order.id}</span>
                <span>{new Date(order.orderDate).toLocaleDateString()}</span>
              </div>
              <div className={styles.orderBody}>
                {order.items.map((item, index) => (
                  <div key={index} className={styles.itemRow}>
                    Product ID: {item.productId} — Qty: {item.quantity} — ${item.price}
                  </div>
                ))}
              </div>
              <div className={styles.orderFooter}>
                <strong>Total: ${order.totalAmount.toFixed(2)}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;