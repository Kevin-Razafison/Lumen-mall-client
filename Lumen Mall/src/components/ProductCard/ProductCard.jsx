import styles from './ProductCard.module.css';

const ProductCard = ({ image, name, description, price }) => {
  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <img src={image} alt={name} className={styles.productImage} />
      </div>
      <div className={styles.details}>
        <h3 className={styles.title}>{name}</h3>
        <p className={styles.description}>{description}</p>
        <div className={styles.footer}>
          <span className={styles.price}>${price}</span>
          <button className={styles.addBtn}>Add to Cart</button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;