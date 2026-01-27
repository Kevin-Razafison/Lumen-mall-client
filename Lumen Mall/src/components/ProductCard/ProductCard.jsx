import styles from './ProductCard.module.css';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';

const ProductCard = ({ id, name, price, image, description, features, stock }) => {
  const { addToCart } = useCart();

  const displayImage = image ? image : '/drone-product-image.png';

  const isOutOfStock = stock !== undefined && stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;

  return (
    <div className={styles.card}>
      <Link to={`/product/${id}`} className={styles.imageWrapper}>
        <img 
          src={displayImage} 
          alt={name} 
          className={styles.productImage} 
          onError={(e) => { e.target.src = '/drone-product-image.png'; }}
        />
        
        {isOutOfStock && <div className={styles.soldOutBadge}>Sold Out</div>}
        {isLowStock && !isOutOfStock && (
          <div className={styles.lowStockBadge}>Only {stock} left!</div>
        )}
      </Link>

      <div className={styles.details}>
        <h3 className={styles.title}>{name}</h3>
        <p className={styles.description}>{description}</p>
        
        <div className={styles.footer}>
          <span className={styles.price}>
            ${typeof price === 'number' ? price.toFixed(2) : price}
          </span>
          
          <button 
            className={styles.addBtn} 
            disabled={isOutOfStock}
            onClick={() => addToCart({ id, name, price, image: displayImage, description, features })}
          >
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ProductCardSkeleton = () => {
  return (
    <div className={`${styles.card} ${styles.skeletonCard}`}>
      <div className={`${styles.imageWrapper} ${styles.skeletonImage}`}></div>
      <div className={styles.details}>
        <div className={styles.skeletonTitle}></div>
        <div className={styles.skeletonDescription}></div>
        <div className={styles.skeletonDescription} style={{ width: '60%' }}></div>
        <div className={styles.footer}>
          <div className={styles.skeletonPrice}></div>
          <div className={styles.skeletonButton}></div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;