import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import styles from './ProductDetail.module.css';

const ProductDetail = () => {
  const { productId } = useParams();
  const { addToCart } = useCart();

  // 1. Initial States
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // 2. Fetch Logic
  useEffect(() => {
    setLoading(true);
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
  }, [productId]);

  // 3. Guard Clauses (Prevents the "product is null" crash)
  if (loading) {
    return <div className={styles.loading}>Loading product details...</div>;
  }

  if (!product) {
    return <div className={styles.notFound}>Product not found!</div>;
  }

  const isOutOfStock = product.stock !== undefined && product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  // Limits quantity to available stock, or max 10 if stock is high
  const maxQty = product.stock > 0 ? Math.min(product.stock, 10) : 1;
  const qtyOptions = Array.from({ length: maxQty }, (_, i) => i + 1);

  const displayImage = (product.imageUrl && product.imageUrl !== 'url') 
    ? product.imageUrl 
    : '/drone-product-image.png';
  const isOnSale = product.salePrice && product.salePrice < product.price;

  const savingsPercent = isOnSale 
    ? Math.round(((product.price - product.salePrice) / product.price) * 100) 
    : 0;

  const isNewArrival = () => {
    if (!product.createdAt) return false;
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    return new Date(product.createdAt) >= fourteenDaysAgo;
  };

  const isNew = isNewArrival();

  const handleAdd = () => {
    const cartItem = {
      ...product,
      // CRITICAL: Ensure the cart gets the sale price if it exists
      price: isOnSale ? product.salePrice : product.price,
      image: displayImage
    };
    addToCart(cartItem, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
      <div className={styles.container}>
        <div className={styles.imageSection}>
          <img src={displayImage} alt={product.name} />
          {/* NEW: Detail Badges */}
          <div className={styles.detailBadges}>
            {isOnSale && <span className={styles.saleBadge}>Limited Time Deal</span>}
          </div>
        </div>

        <div className={styles.infoSection}>
          <h1 className={styles.title}>{product.name}</h1>
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
          
          {/* UPDATED: Price Logic */}
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
                <span className={styles.amount}>
                  {typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                </span>
              </div>
            )}
          </div>

          <div className={styles.description}>
            <h3>About this item</h3>
            <p>{product.description}</p>
            <ul className={styles.featureList}>
              {product.features?.length > 0 ? (
                product.features.map((f, i) => <li key={i}>{f}</li>)
              ) : (
                <li>Lumen Certified Quality</li>
              )}
            </ul>
          </div>

          <div className={styles.purchaseActions}>
            {!isOutOfStock && (
              <div className={styles.qtyBox}>
                <label htmlFor="qtySelect">Quantity:</label>
                <select 
                  id="qtySelect"
                  value={quantity} 
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className={styles.qtySelect}
                >
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
  );
};

export default ProductDetail;