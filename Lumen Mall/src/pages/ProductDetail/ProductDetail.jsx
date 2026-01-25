import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react'; // Added useEffect
import { useCart } from '../../context/CartContext';
import styles from './ProductDetail.module.css';

const ProductDetail = () => {
  const { productId } = useParams();
  const { addToCart } = useCart();

  // 1. States for Data, Loading, and UI
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // 2. Fetch the specific product from your Java Backend
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

  const handleAdd = () => {
    // Ensure we pass the mapped image and numeric price to the cart
    const cartItem = {
      ...product,
      image: product.imageUrl || '/drone-product-image.png'
    };
    addToCart(cartItem, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return <div className={styles.loading}>Loading product details...</div>;
  }

  if (!product) {
    return <div className={styles.notFound}>Product not found!</div>;
  }

  // Fallback for image logic
  const displayImage = (product.imageUrl && product.imageUrl !== 'url') 
    ? product.imageUrl 
    : '/drone-product-image.png';

  return (
    <div className={styles.container}>
      <div className={styles.imageSection}>
        <img src={displayImage} alt={product.name} />
      </div>

      <div className={styles.infoSection}>
        <h1 className={styles.title}>{product.name}</h1>
        <p className={styles.category}>{product.category}</p>
        <hr className={styles.divider} />
        
        <div className={styles.priceTag}>
          <span className={styles.currency}>$</span>
          {/* Handle numeric price from Postgres */}
          <span className={styles.amount}>
            {typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
          </span>
        </div>

      <div className={styles.description}>
        <h3>About this item</h3>
        <p>{product.description}</p>
        
        <ul className={styles.featureList}>
          {product.features && product.features.length > 0 ? (
            product.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))
          ) : (
            <li>Lumen Certified Quality</li>
          )}
        </ul>
      </div>

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