import styles from './ProductCard.module.css';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';

// We use 'image' here because Home.jsx passes 'image={product.imageUrl}'
const ProductCard = ({ id, name, price, image, description }) => {
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

      {/* Original Class: details */}
      <div className={styles.details}>
        {/* Original Class: title */}
        <h3 className={styles.title}>{name}</h3>
        
        {/* Original Class: description */}
        <p className={styles.description}>{description}</p>
        
        {/* Original Class: footer */}
        <div className={styles.footer}>
          {/* Original Class: price */}
          <span className={styles.price}>
            ${typeof price === 'number' ? price.toFixed(2) : price}
          </span>
          
          {/* Original Class: addBtn */}
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