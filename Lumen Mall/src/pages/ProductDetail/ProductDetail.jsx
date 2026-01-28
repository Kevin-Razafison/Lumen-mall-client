import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import styles from './ProductDetail.module.css';
import { API_BASE_URL } from '../../config';

const ProductDetail = () => {
  const { productId } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  
  // Review & Comment State
  const [reviews, setReviews] = useState([]);
  const [publicComment, setPublicComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Verified Review State
  const [eligibleOrderId, setEligibleOrderId] = useState(null);
  const [selectedRating, setSelectedRating] = useState(5);

  const fetchReviews = () => {
    fetch(`${API_BASE_URL}/api/reviews/product/${productId}`)
      .then(res => res.json())
      .then(data => setReviews(data))
      .catch(err => console.error("Reviews fetch error:", err));
  };

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/products/${productId}`)
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

    fetchReviews();

    // Check if user is eligible for a verified review
    if (user) {
      fetch(`${API_BASE_URL}/api/reviews/can-review/${productId}`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
      .then(res => res.json())
      .then(orderId => setEligibleOrderId(orderId))
      .catch(err => console.error("Eligibility check error:", err));
    }
  }, [productId, user]);

  const handleDeleteComment = (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    fetch(`${API_BASE_URL}/api/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${user?.token}` }
    })
    .then(res => {
      if (res.ok) fetchReviews();
      else alert("Action failed.");
    })
    .catch(err => console.error("Delete error:", err));
  };

  if (loading) return <div className={styles.loading}>Loading product details...</div>;
  if (!product) return <div className={styles.notFound}>Product not found!</div>;

  const verifiedReviews = reviews.filter(r => r.rating > 0);
  const avgRating = verifiedReviews.length > 0 
    ? (verifiedReviews.reduce((acc, r) => acc + r.rating, 0) / verifiedReviews.length).toFixed(1) 
    : 0;

  const handlePostPublicComment = () => {
    if (!user) {
      alert("Please log in to join the conversation!");
      return;
    }
    if (!publicComment.trim()) return;

    setIsSubmitting(true);
    
    // If eligible, send the selected rating and orderId. 
    // Otherwise, send rating 0 and orderId null (Community Post).
    const commentData = {
      productId: productId,
      userEmail: user.email,
      rating: eligibleOrderId ? selectedRating : 0,
      comment: publicComment,
      orderId: eligibleOrderId 
    };

    fetch(`${API_BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user?.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(commentData)
    })
    .then(res => {
      if (res.ok) {
        setPublicComment("");
        fetchReviews();
      } else {
        alert("Could not post review.");
      }
    })
    .finally(() => setIsSubmitting(false));
  };

  // Logic for UI Helpers
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const maxQty = product.stock > 0 ? Math.min(product.stock, 10) : 1;
  const qtyOptions = Array.from({ length: maxQty }, (_, i) => i + 1);
  const displayImage = (product.imageUrl && product.imageUrl !== 'url') ? product.imageUrl : '/drone-product-image.png';
  const isOnSale = product.salePrice && product.salePrice < product.price;
  const savingsPercent = isOnSale ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;

  const handleAdd = () => {
    addToCart({ ...product, price: isOnSale ? product.salePrice : product.price, image: displayImage }, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleHelpful = (reviewId) => {
    if (!user) return;

    fetch(`${API_BASE_URL}/api/reviews/${reviewId}/helpful`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${user?.token}`,
        'Content-Type': 'application/json' // MUST add this header
      },
      // Wrap the email in an object to match the Map<String, String> on the backend
      body: JSON.stringify({ userEmail: user.email }) 
    })
    .then(res => {
      if (res.ok) {
        fetchReviews(); 
      } else {
        console.log("Already marked as helpful or error occurred");
      }
    })
    .catch(err => console.error("Helpful error:", err));
  };
  return (
    <div className={styles.pageWrapper}>
      {/* ... Product Image and Info Sections (Same as before) ... */}
      <div className={styles.container}>
        <div className={styles.imageSection}>
          <img src={displayImage} alt={product.name} />
          <div className={styles.detailBadges}>{isOnSale && <span className={styles.saleBadge}>Limited Time Deal</span>}</div>
        </div>
        <div className={styles.infoSection}>
          <h1 className={styles.title}>{product.name}</h1>
          <div className={styles.ratingSummary}>
            <span className={styles.stars}>{"★".repeat(Math.round(avgRating)) + "☆".repeat(5 - Math.round(avgRating))}</span>
            <span className={styles.ratingCount}>{avgRating} ({verifiedReviews.length} reviews)</span>
          </div>
          <p className={styles.category}>{product.category}</p>
          <div className={styles.stockStatus}>
            {isOutOfStock ? <span className={styles.outOfStockText}>Currently Unavailable</span> : 
            <span className={styles.inStockText}>In Stock {isLowStock && `- Only ${product.stock} left!`}</span>}
          </div>
          <hr className={styles.divider} />
          <div className={styles.priceContainer}>
             {/* Price display logic... */}
             {isOnSale ? (
              <div className={styles.salePriceBox}>
                <div className={styles.savingsRow}>
                  <span className={styles.savePercent}>-{savingsPercent}%</span>
                  <span className={styles.priceTag}>${product.salePrice.toFixed(2)}</span>
                </div>
              </div>
            ) : <div className={styles.priceTag}>${product.price.toFixed(2)}</div>}
          </div>
          <div className={styles.description}><h3>About this item</h3><p>{product.description}</p></div>
          <div className={styles.purchaseActions}>
            {!isOutOfStock && (
                <select value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} className={styles.qtySelect}>
                  {qtyOptions.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
            )}
            <button className={`${styles.addBtn} ${isOutOfStock ? styles.disabledBtn : ''}`} onClick={handleAdd} disabled={added || isOutOfStock}>
              {isOutOfStock ? "Out of Stock" : added ? "✓ Added" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>

      <div className={styles.reviewsSection}>
        <hr className={styles.divider} />
        <div className={styles.sectionHeader}>
            <h2>Community & Reviews</h2>
            <div className={styles.publicCommentInput}>
                <h3>{eligibleOrderId ? "Rate and Review this Product" : "Ask a question or share a thought"}</h3>
                {user ? (
                    <div className={styles.inputWrapper}>
                        {/* STAR SELECTOR FOR ELIGIBLE BUYERS */}
                        {eligibleOrderId && (
                          <div className={styles.ratingInputContainer}>
                            <p>How would you rate it?</p>
                            <div className={styles.starPicker}>
                              {[1, 2, 3, 4, 5].map((num) => (
                                <span 
                                  key={num} 
                                  className={num <= selectedRating ? styles.activeStar : styles.inactiveStar}
                                  onClick={() => setSelectedRating(num)}
                                >
                                  ★
                                </span>
                              ))}
                              <span className={styles.verifiedPurchaseBadge}>Verified Purchase</span>
                            </div>
                          </div>
                        )}

                        <textarea 
                            placeholder={eligibleOrderId ? "Write your honest review here..." : "What would you like to know about this product?"}
                            value={publicComment}
                            onChange={(e) => setPublicComment(e.target.value)}
                        />
                        <button onClick={handlePostPublicComment} className={styles.postBtn} disabled={isSubmitting}>
                            {isSubmitting ? "Posting..." : eligibleOrderId ? "Post Review" : "Post Comment"}
                        </button>
                    </div>
                ) : (
                    <p className={styles.loginHint}>Please <strong onClick={() => navigate('/login')}>Login</strong> to join the discussion.</p>
                )}
            </div>
        </div>

        {/* REVIEWS LISTING */}
        {reviews.length === 0 ? (
          <p className={styles.noReviews}>No activity yet. Be the first to engage!</p>
        ) : (
          <div className={styles.reviewsList}>
            {[...reviews].reverse().map((rev) => (
              <div key={rev.id} className={`${styles.reviewCard} ${rev.rating === 0 ? styles.publicEntry : ''}`}>
                <div className={styles.reviewHeader}>
                  <div className={styles.userAvatar}>{rev.userEmail[0].toUpperCase()}</div>
                  <div className={styles.userInfo}>
                    <span className={styles.userName}>{rev.userEmail.split('@')[0]}</span>
                    {rev.rating > 0 && <span className={styles.verifiedPurchase}>Verified Purchase</span>}
                    {rev.rating === 0 && <span className={styles.communityMember}>Community Post</span>}
                  </div>
                  {(user?.email === rev.userEmail || user?.role === 'ADMIN') && (
                    <button className={styles.deleteBtn} onClick={() => handleDeleteComment(rev.id)}>&times;</button>
                  )}
                </div>
                <div className={styles.ratingRow}>
                  {rev.rating > 0 ? <span className={styles.reviewStars}>{"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}</span> : 
                  <span className={styles.questionIcon}>💬 Discussion</span>}
                  <span className={styles.reviewDate}>{new Date(rev.createdAt).toLocaleDateString()}</span>
                </div>
                <p className={styles.commentText}>{rev.comment}</p>

                  {/* NEW: Admin Reply Section */}
                  {rev.adminReply && (
                    <div className={styles.adminReplyContainer}>
                      <div className={styles.adminReplyHeader}>
                        <span className={styles.adminBadge}>Official Response from Lumen Mall</span>
                        <span className={styles.replyIcon}>↩</span>
                      </div>
                      <p className={styles.adminReplyText}>{rev.adminReply}</p>
                    </div>
                  )}
                  {/* HELPFUL INTERACTION SECTION */}
                <div className={styles.reviewActions}>
                    <button 
                        className={styles.helpfulBtn} 
                        onClick={() => handleHelpful(rev.id)}
                        disabled={!user} // Only logged in users can vote
                    >
                        <span className={styles.thumbIcon}>👍</span> 
                        Helpful ({rev.helpfulCount || 0})
                    </button>
                    
                    {!user && <span className={styles.loginToVote}>Login to vote</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;