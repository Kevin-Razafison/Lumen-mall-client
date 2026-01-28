import { useSearchParams } from 'react-router-dom';
import styles from './CategoryNav.module.css';

const CategoryNav = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const activeCategory = searchParams.get('category') || 'New';

  const categories = ['New', 'All', 'Electronics', 'Smart Home', 'Wearables', 'Audio'];
  
  const handleCategoryClick = (category) => {
    if (category === 'New') {
      searchParams.delete('category'); // Landing on Home/New Arrivals
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  return (
    <nav className={styles.nav}>
      <ul className={styles.list}>
        {categories.map((cat) => (
          <li 
            key={cat} 
            className={`${styles.item} ${activeCategory === cat ? styles.active : ''}`}
            onClick={() => handleCategoryClick(cat)}
          >
            {cat === 'New' ? 'New Arrivals' : cat === 'All' ? 'All Articles' : cat}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default CategoryNav;