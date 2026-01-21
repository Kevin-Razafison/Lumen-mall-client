import { useState } from 'react';
import styles from './CategoryNav.module.css';

const CategoryNav = () => {
  const categories = ['Electronics', 'Smart Home', 'Wearables', 'Audio'];
  const [activeCategory, setActiveCategory] = useState('Electronics');

  return (
    <nav className={styles.navWrapper}>
      <div className={styles.container}>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`${styles.navItem} ${activeCategory === cat ? styles.active : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
      <hr className={styles.divider} />
    </nav>
  );
};

export default CategoryNav;