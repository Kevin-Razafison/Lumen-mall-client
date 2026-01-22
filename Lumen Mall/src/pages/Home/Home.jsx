import { useLocation } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import Hero from '../../components/Hero/Hero'; 
import CategoryNav from '../../components/Hero/CategoryNav';
import ProductCard from '../../components/ProductCard/ProductCard';
import {products } from '../../data/product.js'
import styles from './Home.module.css'

const Home = () => {
  const [searchParams] = useSearchParams();
  
  const searchTerm = searchParams.get('search')?.toLowerCase() || '';
  const categoryTerm = searchParams.get('category') || '';

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm);
    const matchesCategory = categoryTerm ? product.category === categoryTerm : true;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <main>
      <Hero />
      <CategoryNav />
      
      <section className="product-section">
        <h2 className="section-title">
          {categoryTerm ? `${categoryTerm}` : searchTerm ? `Results for "${searchTerm}"` : "New Arrivals"}
        </h2>
        
      <div className="product-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <ProductCard key={product.id} {...product} />
          ))
        ) : (
          <div className={styles.noResults}>
            <p>No products found matching "{searchTerm}"</p>
          </div>
        )}
</div>
      </section>
    </main>
  );
};

export default Home;