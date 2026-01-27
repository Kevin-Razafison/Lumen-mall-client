import { useSearchParams } from 'react-router-dom';
import styles from './CategoryNav.module.css';

const CategoryNav = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const activeCategory = searchParams.get('category') || 'All';

  const categories = ['All', 'Electronics', 'Smart Home', 'Wearables', 'Audio'];
  
  const handleCategoryClick = (category) => {
    if (category === 'All') {
      searchParams.delete('category'); // Clear the category filter
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
            {cat}
          </li>
        ))}
      </ul>
    </nav>
  );
};
export default CategoryNav