import React, { useState, useEffect } from 'react'; // Added useState & useEffect
import styles from './ProductCard.module.css';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../config';

const ProductCard = ({ id, name, price, salePrice, image, description, features, stock, createdAt }) => {
  const { addToCart } = useCart();
  
  // NEW: State for ratings
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  // NEW: Fetch ratings for this specific card
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/reviews/product/${id}`)
      .then(res => res.json())
      .then(data => {
        const verified = data.filter(r => r.rating > 0);
        if (verified.length > 0) {
          const avg = (verified.reduce((acc, r) => acc + r.rating, 0) / verified.length).toFixed(1);
          setAvgRating(avg);
          setReviewCount(verified.length);
        }
      })
      .catch(err => console.error("Error fetching card ratings:", err));
  }, [id]);

  const displayImage = image ? image : '/drone-product-image.png';
  const isOutOfStock = stock !== undefined && stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;
  const isOnSale = salePrice && salePrice < price;

  const isNewArrival = () => {
    if (!createdAt) return false;
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    return new Date(createdAt) >= fourteenDaysAgo;
  };

  const isNew = isNewArrival();

  return (
    <div className={styles.card}>
      <Link to={`/product/${id}`} className={styles.imageWrapper}>
        <img 
          src={displayImage} 
          alt={name} 
          className={styles.productImage} 
          onError={(e) => { e.target.src = '/drone-product-image.png'; }}
        />
        
        <div className={styles.badgeContainer}>
          {isOnSale && <div className={styles.saleBadge}>SALE</div>}
          {isNew && !isOnSale && <div className={styles.newBadge}>NEW</div>}
        </div>

        {isOutOfStock && <div className={styles.soldOutBadge}>Sold Out</div>}
        {isLowStock && !isOutOfStock && (
          <div className={styles.lowStockBadge}>Only {stock} left!</div>
        )}
      </Link>

      <div className={styles.details}>
        <h3 className={styles.title}>{name}</h3>
        
        {/* NEW: Star Rating Display */}
        <div className={styles.ratingRow}>
          <span className={styles.stars}>
            {"★".repeat(Math.round(avgRating)) + "☆".repeat(5 - Math.round(avgRating))}
          </span>
          <span className={styles.ratingCount}>({reviewCount})</span>
        </div>

        <p className={styles.description}>{description}</p>
        
        <div className={styles.footer}>
          <div className={styles.priceContainer}>
            {isOnSale ? (
              <>
                <span className={styles.originalPrice}>${Number(price).toFixed(2)}</span>
                <span className={styles.salePrice}>${Number(salePrice).toFixed(2)}</span>
              </>
            ) : (
              <span className={styles.price}>
                ${typeof price === 'number' ? price.toFixed(2) : price}
              </span>
            )}
          </div>
          
          <button 
            className={styles.addBtn} 
            disabled={isOutOfStock}
            onClick={() => addToCart({ 
              id, name, 
              price: isOnSale ? salePrice : price, 
              image: displayImage, description, features 
            })}
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