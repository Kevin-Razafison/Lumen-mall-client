import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { products } from '../../data/product.js'; 
import styles from './ProductDetail.module.css';

const ProductDetail = () => {
  const { productId } = useParams();
  const { addToCart } = useCart();

  const [added, setAdded] = useState(false);

    const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    
    setTimeout(() => setAdded(false), 2000);
    };
 
  const product = products.find((p) => p.id === productId);

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

        <button 
        className={`${styles.addBtn} ${added ? styles.added : ''}`}
        onClick={handleAdd}
        >
        {added ? "✓ Added to Cart" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;