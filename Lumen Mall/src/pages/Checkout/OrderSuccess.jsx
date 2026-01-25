import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import styles from './OrderSuccess.module.css';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, email, total } = location.state || {};

  if (!orderId) {
    return (
      <div className={styles.container}>
        <h2>No order found.</h2>
        <Link to="/" className={styles.homeBtn}>Return to Shop</Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.successCard}>
        <div className={styles.iconCircle}>✓</div>
        <h1 className={styles.title}>Order Placed!</h1>
        <p className={styles.subtitle}>Thank you for shopping at Lumen Mall.</p>
        
        <div className={styles.details}>
          <div className={styles.detailRow}>
            <span>Order ID:</span>
            <strong>#{orderId}</strong>
          </div>
          <div className={styles.detailRow}>
            <span>Sent to:</span>
            <strong>{email}</strong>
          </div>
          <div className={styles.detailRow}>
            <span>Total Amount:</span>
            <strong>${total?.toFixed(2)}</strong>
          </div>
        </div>

        <p className={styles.instructions}>
          A confirmation email has been sent. You can track your drone's 
          delivery status in your profile.
        </p>

        <button onClick={() => navigate('/')} className={styles.homeBtn}>
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default OrderSuccess;