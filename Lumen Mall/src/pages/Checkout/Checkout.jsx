import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import styles from './Checkout.module.css';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const { user } = useAuth();
  const { cartItems, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
  });

  // NEW: State for payment method
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      
      const orderData = {
        customerName: formData.fullName,
        customerEmail: formData.email,
        totalAmount: totalPrice,
        paymentMethod: paymentMethod, // NEW: Include payment method in payload
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      };

      try {
        const response = await fetch('http://localhost:8080/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        });

        if (response.ok) {
          alert(`Order placed successfully using ${paymentMethod}!`);
          clearCart();
          navigate('/');
        } else {
          throw new Error('Failed to place order');
        }
      } catch (error) {
        console.error("Order failed:", error);
        alert("Error processing order. Please try again.");
      }
    };

  return (
    <div className={styles.checkoutContainer}>
      <h1 className={styles.mainTitle}>Checkout</h1>
      
      <div className={styles.checkoutGrid}>
        <form className={styles.shippingForm} onSubmit={handleSubmit}>
          <h2 className={styles.sectionTitle}>Shipping Address</h2>
          
          <div className={styles.inputGroup}>
            <label>Full Name</label>
            <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} />
          </div>

          <div className={styles.inputGroup}>
            <label>Email Address</label>
            <input type="email" name="email" required value={formData.email} onChange={handleChange} />
          </div>

          <div className={styles.inputGroup}>
            <label>Street Address</label>
            <input type="text" name="address" required value={formData.address} onChange={handleChange} />
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label>City</label>
              <input type="text" name="city" required value={formData.city} onChange={handleChange} />
            </div>
            <div className={styles.inputGroup}>
              <label>Zip Code</label>
              <input type="text" name="zipCode" required value={formData.zipCode} onChange={handleChange} />
            </div>
          </div>

          <h2 className={styles.sectionTitle} style={{ marginTop: '2rem' }}>Payment Method</h2>
          <div className={styles.paymentOptions}>
            <label className={styles.radioLabel}>
              <input 
                type="radio" 
                value="Credit Card" 
                checked={paymentMethod === 'Credit Card'} 
                onChange={(e) => setPaymentMethod(e.target.value)} 
              />
              Credit Card
            </label>
            <label className={styles.radioLabel}>
              <input 
                type="radio" 
                value="PayPal" 
                checked={paymentMethod === 'PayPal'} 
                onChange={(e) => setPaymentMethod(e.target.value)} 
              />
              PayPal
            </label>
            <label className={styles.radioLabel}>
              <input 
                type="radio" 
                value="Bank Transfer" 
                checked={paymentMethod === 'Bank Transfer'} 
                onChange={(e) => setPaymentMethod(e.target.value)} 
              />
              Bank Transfer
            </label>
          </div>

          <button type="submit" className={styles.placeOrderBtn}>Place Order</button>
        </form>

        <div className={styles.orderSummary}>
          <h2 className={styles.sectionTitle}>Order Summary</h2>
          <div className={styles.itemList}>
            {cartItems.map(item => (
              <div key={item.id} className={styles.summaryItem}>
                <span>{item.name} (x{item.quantity})</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <hr />
          <div className={styles.totalRow}>
            <span>Total</span>
            <span className={styles.totalAmount}>${totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;