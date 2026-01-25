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

  const handleSubmit = async (e) => { // Added async
      e.preventDefault();
      
      // Prepare the order data to send to Java
      const orderData = {
        customerName: formData.fullName,
        customerEmail: formData.email,
        totalAmount: totalPrice,
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      };

      try {
        // In the future, we will hit this endpoint:
        // await fetch('http://localhost:8080/api/orders', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(orderData)
        // });

        alert(`Order placed successfully for ${formData.fullName}!`);
        clearCart();
        navigate('/');
      } catch (error) {
        console.error("Order failed:", error);
        alert("Something went wrong with your order.");
      }
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