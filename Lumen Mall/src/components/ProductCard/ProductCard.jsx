import styles from './ProductCard.module.css';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';

// Changed 'image' to 'imageUrl' to match your Spring Boot Entity/Postgres column
const ProductCard = ({ id, name, price, imageUrl, description }) => {
  const { addToCart } = useCart();

  // Handle cases where imageUrl might be a placeholder string like 'url' or null
  const displayImage = (imageUrl && imageUrl !== 'url') 
    ? imageUrl 
    : '/drone-product-image.png';

  return (
    <div className={styles.card}>
      <Link to={`/product/${id}`} className={styles.imageWrapper}>
        <img src={displayImage} alt={name} className={styles.productImage} />
      </Link>
      <div className={styles.details}>
        <h3 className={styles.title}>{name}</h3>
        <p className={styles.description}>{description}</p>
        <div className={styles.footer}>
          {/* price is now a Number from Postgres, so we ensure it shows 2 decimals */}
          <span className={styles.price}>
            ${typeof price === 'number' ? price.toFixed(2) : price}
          </span>
          <button 
            className={styles.addBtn} 
            onClick={() => addToCart({ id, name, price, image: displayImage, description })}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;