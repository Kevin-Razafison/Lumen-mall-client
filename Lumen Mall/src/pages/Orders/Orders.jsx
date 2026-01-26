import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext'; // Import your auth hook
import styles from './Orders.module.css';

const Orders = () => {
  const { user } = useAuth(); 
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
    const actualToken = user?.token;

    console.log("Orders Hook Check - User Email:", user?.email, "Token exists:", !!actualToken);

    if (user?.email && actualToken) {
      console.log("Auth ready, fetching orders for:", user.email);
      
      fetch(`http://localhost:8080/api/orders/user/${user.email}`, {
        headers: {
          'Authorization': `Bearer ${actualToken}`, 
          'Content-Type': 'application/json'
        }
      })
      .then(res => {
        if (!res.ok) throw new Error("Server responded with error");
        return res.json();
      })
      .then(data => {
        setOrders(data.sort((a, b) => b.id - a.id));
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
    } 
    else if (user === null || (user && !user.email)) {
      setLoading(false);
    }
  }, [user]);

  if (loading) return <div className={styles.loader}>Loading your orders...</div>;

  return (
    <div className={styles.ordersContainer}>
      <h1 className={styles.title}>Your Order History</h1>
      {orders.length === 0 ? (
        <div className={styles.noOrders}>
          <p>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className={styles.orderList}>
          {orders.map(order => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <span className={styles.orderId}>Order #{order.id}</span>
                <span className={styles.orderDate}>
                  {new Date(order.orderDate || order.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className={styles.orderBody}>
                {order.items && order.items.map((item, index) => (
                  <div key={index} className={styles.itemRow}>
                    <div className={styles.itemDetails}>
                      <span>Product ID: <strong>{item.productId}</strong></span>
                      <span> Quantity: {item.quantity}</span>
                    </div>
                    <span className={styles.itemPrice}>${item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className={styles.orderFooter}>
                    <span className={`${styles.statusBadge} ${styles.statusPaid}`}>
                      {order.status || 'Paid'}
                    </span>
              <div className={styles.totalBox}>
                  <span>Total Paid:</span>
                  <strong>${order.totalAmount.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;