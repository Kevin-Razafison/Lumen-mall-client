import { useCart } from '../../context/CartContext';
import styles from './Cart.module.css';
import droneImg from '../../../public/drone-product-image.png'; // Using your existing image

const Cart = () => {
  const { cartItems, totalPrice, removeFromCart } = useCart();

  return (
    <div className={styles.cartPage}>
      <div className={styles.container}>
        <div className={styles.itemsSection}>
          <h1 className={styles.title}>Shopping Cart</h1>
          <hr className={styles.divider} />
          
          {cartItems.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            cartItems.map((item, index) => (
              <div key={index} className={styles.cartItem}>
                <img src={item.image} alt={item.name} className={styles.itemImg} />
                <div className={styles.itemDetails}>
                  <div className={styles.itemHeader}>
                    <h3>{item.name}</h3>
                    <p className={styles.itemDescription}>{item.description}</p>
                    <p className={styles.price}>${item.price}</p>
                  </div>
                  <button 
                    className={styles.deleteBtn} 
                    onClick={() => removeFromCart(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className={styles.checkoutSection}>
          <div className={styles.subtotalBox}>
            <p>Subtotal: <strong>${totalPrice.toFixed(2)}</strong></p>
            <button className={styles.checkoutBtn}>Proceed to Checkout</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;