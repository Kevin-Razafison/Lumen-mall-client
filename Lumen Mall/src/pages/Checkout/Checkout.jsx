import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import styles from './Checkout.module.css';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const { cartItems, totalPrice, clearCart } = useCart(); // Add clearCart here
  const navigate = useNavigate();
    const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
      e.preventDefault();
    
    // 1. Show the success message
    alert(`Order placed successfully for ${formData.fullName}!`);
    
    // 2. Clear the global cart state and localStorage
    clearCart();
    
    // 3. Send them back to the Home page
    navigate('/');
  };

  return (
    <div className={styles.checkoutContainer}>
      <h1 className={styles.mainTitle}>Checkout</h1>
      
      <div className={styles.checkoutGrid}>
        {/* Left Column: Shipping Form */}
        <form className={styles.shippingForm} onSubmit={handleSubmit}>
          <h2 className={styles.sectionTitle}>Shipping Address</h2>
          <div className={styles.inputGroup}>
            <label>Full Name</label>
            <input type="text" name="fullName" required onChange={handleChange} placeholder="Name" />
          </div>
          <div className={styles.inputGroup}>
            <label>Email Address</label>
            <input type="email" name="email" required onChange={handleChange} placeholder="name@example.com" />
          </div>
          <div className={styles.inputGroup}>
            <label>Street Address</label>
            <input type="text" name="address" required onChange={handleChange} placeholder="123 Drone Lane" />
          </div>
          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label>City</label>
              <input type="text" name="city" required onChange={handleChange} />
            </div>
            <div className={styles.inputGroup}>
              <label>Zip Code</label>
              <input type="text" name="zipCode" required onChange={handleChange} />
            </div>
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