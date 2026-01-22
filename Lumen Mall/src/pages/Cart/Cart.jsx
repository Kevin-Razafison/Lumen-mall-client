import { useCart } from '../../context/CartContext';
import cartIcon from '../../../public/icons/icons-shopping-cart.png'
import { Link } from 'react-router-dom'
import styles from './Cart.module.css';

const Cart = () => {
  // We add 'updateQuantity' and 'cartCount' to the destructuring here
  const { cartItems, totalPrice, removeFromCart, updateQuantity, cartCount } = useCart();

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

  return (
    <div className={styles.cartPage}>
      <div className={styles.container}>
        <div className={styles.itemsSection}>
          <h1 className={styles.title}>Shopping Cart</h1>
          <hr className={styles.divider} />
          
          {cartItems.map((item) => (
            <div key={item.id} className={styles.cartItem}>
              <Link to={`/product/${item.id}`} className={styles.itemLink}>
                <img src={item.image} alt={item.name} className={styles.itemImg} />
              </Link>
              
              <div className={styles.itemDetails}>
                <div className={styles.itemHeader}>
                  <Link to={`/product/${item.id}`} className={styles.itemLink}>
                    <h3 className={styles.itemName}>{item.name}</h3>
                  </Link>
                  <p className={styles.itemDescription}>{item.description}</p>
                  <p className={styles.price}>${item.price}</p>
                </div>
                
                <div className={styles.itemActions}>
                  <div className={styles.qtyContainer}>
                    <label htmlFor={`qty-${item.id}`}>Qantity:</label>
                    <select 
                      id={`qty-${item.id}`}
                      className={styles.qtySelect}
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>
                  
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
              Subtotal ({cartCount} items): <strong>${totalPrice.toFixed(2)}</strong>
            </p>
            <button className={styles.checkoutBtn}>Proceed to Checkout</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;