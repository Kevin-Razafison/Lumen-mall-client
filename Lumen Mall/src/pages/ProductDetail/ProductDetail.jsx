import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import styles from './ProductDetail.module.css';

const ProductDetail = () => {
  const { productId } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  
  // NEW: State for reviews
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    setLoading(true);
    // Fetch Product Details
    fetch(`http://localhost:8080/api/products/${productId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });

    // NEW: Fetch Reviews for this product
    fetch(`http://localhost:8080/api/reviews/product/${productId}`)
      .then(res => res.json())
      .then(data => setReviews(data))
      .catch(err => console.error("Reviews fetch error:", err));
  }, [productId]);

  if (loading) return <div className={styles.loading}>Loading product details...</div>;
  if (!product) return <div className={styles.notFound}>Product not found!</div>;

  // Rating Calculation
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : 0;

  const isOutOfStock = product.stock !== undefined && product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const maxQty = product.stock > 0 ? Math.min(product.stock, 10) : 1;
  const qtyOptions = Array.from({ length: maxQty }, (_, i) => i + 1);

  const displayImage = (product.imageUrl && product.imageUrl !== 'url') 
    ? product.imageUrl 
    : '/drone-product-image.png';
    
  const isOnSale = product.salePrice && product.salePrice < product.price;
  const savingsPercent = isOnSale ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;

  const handleAdd = () => {
    const cartItem = {
      ...product,
      price: isOnSale ? product.salePrice : product.price,
      image: displayImage
    };
    addToCart(cartItem, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.imageSection}>
          <img src={displayImage} alt={product.name} />
          <div className={styles.detailBadges}>
            {isOnSale && <span className={styles.saleBadge}>Limited Time Deal</span>}
          </div>
        </div>

        <div className={styles.infoSection}>
          <h1 className={styles.title}>{product.name}</h1>
          
          {/* NEW: Rating Summary */}
          <div className={styles.ratingSummary}>
            <span className={styles.stars}>{"★".repeat(Math.round(avgRating)) + "☆".repeat(5 - Math.round(avgRating))}</span>
            <span className={styles.ratingCount}>{avgRating} ({reviews.length} ratings)</span>
          </div>

          <p className={styles.category}>{product.category}</p>
          
          <div className={styles.stockStatus}>
            {isOutOfStock ? (
              <span className={styles.outOfStockText}>Currently Unavailable</span>
            ) : (
              <span className={styles.inStockText}>
                In Stock {isLowStock && `- Only ${product.stock} left!`}
              </span>
            )}
          </div>

          <hr className={styles.divider} />
          
          <div className={styles.priceContainer}>
            {isOnSale ? (
              <div className={styles.salePriceBox}>
                <div className={styles.savingsRow}>
                  <span className={styles.savePercent}>-{savingsPercent}%</span>
                  <span className={styles.priceTag}>
                    <span className={styles.currency}>$</span>
                    <span className={styles.amount}>{product.salePrice.toFixed(2)}</span>
                  </span>
                </div>
                <p className={styles.listPrice}>
                  List Price: <span>${product.price.toFixed(2)}</span>
                </p>
              </div>
            ) : (
              <div className={styles.priceTag}>
                <span className={styles.currency}>$</span>
                <span className={styles.amount}>{product.price.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className={styles.description}>
            <h3>About this item</h3>
            <p>{product.description}</p>
          </div>

          <div className={styles.purchaseActions}>
            {!isOutOfStock && (
              <div className={styles.qtyBox}>
                <label htmlFor="qtySelect">Quantity:</label>
                <select id="qtySelect" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} className={styles.qtySelect}>
                  {qtyOptions.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            )}
            <button 
              className={`${styles.addBtn} ${added ? styles.added : ''} ${isOutOfStock ? styles.disabledBtn : ''}`}
              onClick={handleAdd}
              disabled={added || isOutOfStock}
            >
              {isOutOfStock ? "Out of Stock" : added ? "✓ Added to Cart" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>

      {/* NEW: Comment Section */}
      <div className={styles.reviewsSection}>
        <hr className={styles.divider} />
        <h2>Customer Reviews</h2>
        {reviews.length === 0 ? (
          <p className={styles.noReviews}>No reviews yet. Be the first to review this product!</p>
        ) : (
          <div className={styles.reviewsList}>
            {reviews.map((rev) => (
              <div key={rev.id} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <div className={styles.userAvatar}>{rev.userEmail[0].toUpperCase()}</div>
                  <div className={styles.userInfo}>
                    <span className={styles.userName}>{rev.userEmail.split('@')[0]}</span>
                    <span className={styles.verifiedPurchase}>Verified Purchase</span>
                  </div>
                </div>
                <div className={styles.ratingRow}>
                  <span className={styles.reviewStars}>{"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}</span>
                  <span className={styles.reviewDate}>{new Date(rev.createdAt).toLocaleDateString()}</span>
                </div>
                <p className={styles.commentText}>{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;