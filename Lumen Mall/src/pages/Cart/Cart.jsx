import { useCart } from '../../context/CartContext';
import cartIcon from '../../../public/icons/icons-shopping-cart.png'
import { Link } from 'react-router-dom'
import styles from './Cart.module.css';

const Cart = () => {
  const { cartItems, totalPrice, removeFromCart } = useCart();

  // 1. The Empty State Check
  if (cartItems.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <img src={cartIcon} className={styles.emptyIcon} alt="Empty Cart" />
        <h2>Your Lumen Mall Cart is empty</h2>
        <p>Check your saved items or continue shopping for the latest tech.</p>
        <Link to="/" className={styles.shopBtn}>
          Return to Shopping
        </Link>
      </div>
    );
  }

  // 2. The Active Cart View
  return (
    <div className={styles.cartPage}>
      <div className={styles.container}>
        <div className={styles.itemsSection}>
          <h1 className={styles.title}>Shopping Cart</h1>
          <hr className={styles.divider} />
          
          {/* Use parentheses () here for an implicit return of the JSX */}
          {cartItems.map((item, index) => (
            <div key={index} className={styles.cartItem}>
              <img src={item.image} alt={item.name} className={styles.itemImg} />
              <div className={styles.itemDetails}>
                <div className={styles.itemHeader}>
                  <h3 className={styles.itemName}>{item.name}</h3>
                  <p className={styles.itemDescription}>{item.description}</p>
                  <p className={styles.price}>${item.price}</p>
                </div>
                <div className={styles.itemActions}>
                  <button 
                    className={styles.deleteBtn} 
                    onClick={() => removeFromCart(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.checkoutSection}>
          <div className={styles.subtotalBox}>
            <p className={styles.subtotalText}>
              Subtotal ({cartItems.length} items): <strong>${totalPrice.toFixed(2)}</strong>
            </p>
            <button className={styles.checkoutBtn}>Proceed to Checkout</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;