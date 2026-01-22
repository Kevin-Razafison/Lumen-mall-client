import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { products } from '../../data/product.js'; 
import styles from './ProductDetail.module.css';

const ProductDetail = () => {
  const { productId } = useParams();
  const { addToCart } = useCart();

  // 1. Add quantity state
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // 2. Find product first so handleAdd can access it
  const product = products.find((p) => p.id === productId);

  const handleAdd = () => {
    // 3. Pass both product and quantity to your updated context
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (!product) {
    return <div className={styles.notFound}>Product not found!</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.imageSection}>
        <img src={product.image} alt={product.name} />
      </div>

      <div className={styles.infoSection}>
        <h1 className={styles.title}>{product.name}</h1>
        <p className={styles.category}>{product.category}</p>
        <hr className={styles.divider} />
        
        <div className={styles.priceTag}>
          <span className={styles.currency}>$</span>
          <span className={styles.amount}>{product.price}</span>
        </div>

        <div className={styles.description}>
          <h3>About this item</h3>
          <p>{product.description}</p>
          <ul>
            <li>4K HDR Video Recording</li>
            <li>30-minute Flight Time</li>
            <li>GPS Auto-Return Home</li>
          </ul>
        </div>

        {/* 4. Quantity Selector UI */}
        <div className={styles.purchaseActions}>
          <div className={styles.qtyBox}>
            <label htmlFor="qtySelect">Quantity:</label>
            <select 
              id="qtySelect"
              value={quantity} 
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className={styles.qtySelect}
            >
              {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          <button 
            className={`${styles.addBtn} ${added ? styles.added : ''}`}
            onClick={handleAdd}
            disabled={added}
          >
            {added ? "✓ Added to Cart" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;