import styles from './ProductCard.module.css';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';

const ProductCard = ({ id, name, price, image, description, features }) => {
  const { addToCart } = useCart();

  // If 'image' (the prop) exists, use it; otherwise, show the drone placeholder
  const displayImage = image ? image : '/drone-product-image.png';

  return (
    <div className={styles.card}>
      {/* Original Class: imageWrapper */}
      <Link to={`/product/${id}`} className={styles.imageWrapper}>
        <img 
          src={displayImage} 
          alt={name} 
          className={styles.productImage} 
          // Safety: swaps to drone if the Base64 string is invalid or broken
          onError={(e) => { e.target.src = '/drone-product-image.png'; }}
        />
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
            onClick={() => addToCart({ id, name, price, image: displayImage, description, features })}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;