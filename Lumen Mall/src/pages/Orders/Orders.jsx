import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext'; 
import styles from './Orders.module.css';

const Orders = () => {
  const { user } = useAuth(); 
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const getStatusStep = (status) => {
    // Trim and UpperCase to prevent string mismatch
    const backendStatus = status?.toUpperCase().trim();
    
    if (backendStatus === 'CANCELLED') return -1;

    // We use 'COMPLETED' here to match your Admin Dashboard screenshot
    const steps = ['PENDING', 'PAID', 'SHIPPED', 'COMPLETED']; 
    const index = steps.indexOf(backendStatus);
    
    return index !== -1 ? index : 1; 
  };

  useEffect(() => {
    const actualToken = user?.token;

    if (user?.email && actualToken) {
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
          {orders.map(order => {
            const isOrderCompleted = order.status?.toUpperCase().trim() === 'COMPLETED';
            
            return (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <span className={styles.orderId}>Order #{order.id}</span>
                  <span className={styles.orderDate}>
                    {new Date(order.orderDate || order.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className={styles.trackingTimeline}>
                  {['Placed', 'Paid', 'Shipped', 'Delivered'].map((step, index) => {
                    const isActive = index <= getStatusStep(order.status);
                    return (
                      <div 
                        key={step} 
                        className={`
                          ${styles.step} 
                          ${isActive ? styles.active : ''} 
                          ${isActive && isOrderCompleted ? styles.completedStep : ''}
                        `}
                      >
                        <div className={styles.dot}></div>
                        <span className={styles.stepLabel}>{step}</span>
                      </div>
                    );
                  })}
                </div>

                <div className={styles.orderBody}>
                  {order.items && order.items.map((item, index) => (
                    <div key={index} className={styles.itemRow}>
                      <div className={styles.itemMain}>
                        {item.imageUrl && (
                          <img src={item.imageUrl} className={styles.miniItemImg} alt={item.productName} />
                        )}
                        <div className={styles.itemDetails}>
                          <span className={styles.productName}>
                            {/* Priority: Check productName, then name, then fallback */}
                            {item.productName || item.name || "Product Name Not Found"}
                          </span>
                          
                          <div className={styles.itemMeta}>
                            <span className={styles.productId}>ID: {item.productId}</span>
                            <span className={styles.qty}>Qty: {item.quantity}</span>
                          </div>

                          {item.features && (
                            <p className={styles.itemFeatures}>{item.features.slice(0, 2).join(' • ')}</p>
                          )}
                        </div>
                      </div>
                      <span className={styles.itemPrice}>${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className={styles.orderFooter}>
                  <span className={`${styles.statusBadge} ${
                      isOrderCompleted ? styles.statusDelivered : 
                      order.status?.toUpperCase() === 'CANCELLED' ? styles.statusCancelled : 
                      styles.statusPaid
                  }`}>
                    {isOrderCompleted ? 'Delivered' : (order.status || 'Paid')}
                  </span>
                  
                  <div className={styles.totalBox}>
                    <span>Total Paid:</span>
                    <strong>${order.totalAmount.toFixed(2)}</strong>
                  </div>
                </div> 
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;