import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import styles from './Checkout.module.css';
import { useUserLocation } from '../../context/LocationContext';
import { useNavigate } from 'react-router-dom';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { API_BASE_URL } from '../../config';

const Checkout = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { user } = useAuth();
  const { location } = useUserLocation();
  const { cartItems, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('Credit Card');

  const shipping = totalPrice > 100 ? 0 : 9.99; 
  const taxRate = 0.08; // 8% tax
  const taxTotal = totalPrice * taxRate;
  const finalGrandTotal = totalPrice + shipping + taxTotal;

  // --- RESTORED LOGIC ---
  
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.fullName || '',
        email: prev.email || user.email || ''
      }));
    }

    if (location && location !== 'Select your address') {
      const parts = location.split(',');
      const detectedCity = parts[0].trim();
      
      setFormData(prev => ({
        ...prev,
        city: prev.city === '' ? detectedCity : prev.city 
      }));
    }
  }, [user, location]); 

  // THIS WAS MISSING:
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ----------------------

 const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // Get the token right when we need it, inside the try block
    const getAuthToken = () => localStorage.getItem('lumenToken');

    try {
      // 1. Handle Stripe
      if (paymentMethod === 'Credit Card') {
        if (!stripe || !elements) return;

        const intentRes = await fetch(`${API_BASE_URL}/api/payments/create-payment-intent`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}` // Use the helper function
          },
          body: JSON.stringify({ amount: finalGrandTotal, email: formData.email })
        });
        
        const intentData = await intentRes.json();
        if (!intentRes.ok) throw new Error(intentData.message || "Payment initiation failed");

        const cardElement = elements.getElement(CardElement);
        const result = await stripe.confirmCardPayment(intentData.clientSecret, {
          payment_method: { card: cardElement, billing_details: { name: formData.fullName, email: formData.email } },
        });

        if (result.error) throw new Error(result.error.message);
      }

      // ... (PayPal logic remains the same) ...

      // 2. Prepare and Send Order
      const orderData = {
        customerName: formData.fullName,
        customerEmail: formData.email,
        totalAmount: finalGrandTotal,
        paymentMethod: paymentMethod,
        shippingAddress: `${formData.address}, ${formData.city}, ${formData.zipCode}`,
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      };

      const orderResponse = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}` // Use the helper function here too
        },
        body: JSON.stringify(orderData)
      });

      const resultData = await orderResponse.json().catch(() => null);

      if (!orderResponse.ok) {
        throw new Error(resultData?.message || resultData?.error || "Order failed");
      }

      if (resultData) {
        clearCart();
        navigate('/order-success', { 
          state: { orderId: resultData.id, email: formData.email, total: finalGrandTotal } 
        });
      }

    } catch (error) {
      console.error("Checkout failed:", error);
      alert(error.message);
    } finally {
      setIsProcessing(false);
    }
  };
  return (
    <div className={styles.checkoutContainer}>
      <h1 className={styles.mainTitle}>Checkout</h1>
      
      <div className={styles.checkoutGrid}>
        <form className={styles.shippingForm} onSubmit={handleSubmit}>
          <h2 className={styles.sectionTitle}>Shipping Address</h2>
          
          {location && location !== 'Select your address' && (
            <div className={styles.locationAssurance}>
              <span className={styles.pinIcon}>📍</span> 
              Shipping to: <strong>{location}</strong>
            </div>
          )}

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
              <input type="radio" value="Credit Card" checked={paymentMethod === 'Credit Card'} onChange={(e) => setPaymentMethod(e.target.value)} />
              Credit Card
            </label>
            <label className={styles.radioLabel}>
              <input type="radio" value="PayPal" checked={paymentMethod === 'PayPal'} onChange={(e) => setPaymentMethod(e.target.value)} />
              PayPal
            </label>
            <label className={styles.radioLabel}>
              <input type="radio" value="Bank Transfer" checked={paymentMethod === 'Bank Transfer'} onChange={(e) => setPaymentMethod(e.target.value)} />
              Bank Transfer
            </label>
          </div>

          {paymentMethod === 'Credit Card' && (
            <div className={styles.paymentDetailBox}>
              <label className={styles.cardLabel}>Card Information</label>
              <div className={styles.stripeElementWrapper}>
                <CardElement options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#32325d',
                      '::placeholder': { color: '#aab7c4' },
                    },
                    invalid: { color: '#fa755a' },
                  },
                }} />
              </div>
              <p className={styles.secureNote}>🔒 Secure payment via Stripe.</p>
            </div>
          )}

          {paymentMethod === 'PayPal' && (
            <div className={styles.paymentDetailBox}>
              <p className={styles.infoText}>PayPal integration ready.</p>
            </div>
          )}

          {paymentMethod === 'Bank Transfer' && (
            <div className={styles.paymentDetailBox}>
              <p className={styles.infoText}>
                <strong>IBAN:</strong> LU98 7654 3210 0123 4567<br/>
                <strong>SWIFT:</strong> LUMENLUXX
              </p>
            </div>
          )}

          <button 
            type="submit" 
            className={styles.placeOrderBtn} 
            disabled={isProcessing || cartItems.length === 0}
          >
            {isProcessing ? "Processing..." : "Confirm & Pay"}
          </button>
        </form>

        <div className={styles.orderSummary}>
          <h2 className={styles.sectionTitle}>Order Summary</h2>
          <div className={styles.itemList}>
            {cartItems.map(item => (
              <div key={item.id} className={styles.summaryItemContainer}>
                <div className={styles.summaryItem}>
                  <span>{item.name} (x{item.quantity})</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
                {item.features && item.features.length > 0 && (
                  <p className={styles.itemFeaturesMini}>
                    {item.features.slice(0, 3).join(' • ')}
                  </p>
                )}
              </div>
            ))}
          </div>
          
          <hr />
          
          <div className={styles.calcRow}>
            <span>Items:</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <div className={styles.calcRow}>
            <span>Shipping:</span>
            <span>{shipping === 0 ? <span className={styles.free}>FREE</span> : `$${shipping.toFixed(2)}`}</span>
          </div>
          <div className={styles.calcRow}>
            <span>Estimated Tax:</span>
            <span>${taxTotal.toFixed(2)}</span>
          </div>
          
          <hr />
          
          <div className={styles.totalRow}>
            <span>Order Total:</span>
            <span className={styles.totalAmount}>${finalGrandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;