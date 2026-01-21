import { useCart } from '../../context/CartContext';
import styles from './Cart.module.css';
import droneImg from '../../../public/drone-product-image.png'; // Using your existing image

const Cart = () => {
  const { cartCount } = useCart();

  return (
    <div className={styles.cartPage}>
      <div className={styles.container}>
        <div className={styles.itemsSection}>
          <h1 className={styles.title}>Shopping Cart</h1>
          <hr className={styles.divider} />
          
          {cartCount === 0 ? (
            <p className={styles.emptyMsg}>Your Lumen Mall cart is empty.</p>
          ) : (
            <div className={styles.cartItem}>
              <img src={droneImg} alt="Drone" className={styles.itemImg} />
              <div className={styles.itemDetails}>
                <div className={styles.itemHeader}>
                  <h3>Next-Gen Drone</h3>
                  <p className={styles.price}>$20.90</p>
                </div>
                <p className={styles.stockStatus}>In Stock</p>
                <div className={styles.itemActions}>
                  <select className={styles.qtySelect}>
                    {[1,2,3,4,5].map(num => <option key={num}>{num}</option>)}
                  </select>
                  <button className={styles.deleteBtn}>Delete</button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.checkoutSection}>
          <div className={styles.subtotalBox}>
            <p className={styles.subtotalText}>
              Subtotal ({cartCount} items): <strong>${(cartCount * 20.9).toFixed(2)}</strong>
            </p>
            <button className={styles.checkoutBtn} disabled={cartCount === 0}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;