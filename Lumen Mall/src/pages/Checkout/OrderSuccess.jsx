import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link, useSearchParams } from 'react-router-dom';
import styles from './OrderSuccess.module.css';

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [orderInfo, setOrderInfo] = useState(location.state || null);
  const paypalToken = searchParams.get('token');

  useEffect(() => {
    // PayPal specific: if token exists in URL, we must capture it
    if (paypalToken && !orderInfo) {
      capturePayPalPayment();
    }
  }, [paypalToken]);

  const capturePayPalPayment = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/payments/paypal/capture?token=${paypalToken}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrderInfo({
          orderId: data.id,
          email: data.customerEmail,
          total: data.totalAmount
        });
      }
    } catch (error) {
      console.error("PayPal capture failed", error);
    } finally {
      setLoading(false);
    }
  };

  // PayPal Specific Loading State: Keeps your design but adds a "Processing" feel
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.successCard}>
          <div className={styles.spinner}></div> {/* Add this to your CSS for a smooth look */}
          <h1 className={styles.title}>Verifying Payment...</h1>
          <p className={styles.subtitle}>Please do not refresh the page while we finalize your order.</p>
        </div>
      </div>
    );
  }

  if (!orderInfo) {
    return (
      <div className={styles.container}>
        <div className={styles.successCard}>
          <h2 className={styles.title}>No order found.</h2>
          <Link to="/" className={styles.homeBtn}>Return to Shop</Link>
        </div>
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
            <strong>#{orderInfo.orderId}</strong>
          </div>
          <div className={styles.detailRow}>
            <span>Sent to:</span>
            <strong>{orderInfo.email}</strong>
          </div>
          <div className={styles.detailRow}>
            <span>Total Amount:</span>
            <strong>${orderInfo.total?.toFixed(2)}</strong>
          </div>
        </div>

        <button onClick={() => navigate('/')} className={styles.homeBtn}>
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default OrderSuccess;