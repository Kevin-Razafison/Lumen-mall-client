import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Hero from '../../components/Hero/Hero'; 
import CategoryNav from '../../components/Hero/CategoryNav';
import ProductCard, { ProductCardSkeleton } from '../../components/ProductCard/ProductCard';
import styles from './Home.module.css';
import { API_BASE_URL } from '../../config';

const Home = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  const searchTerm = searchParams.get('search')?.toLowerCase() || '';
  const categoryTerm = searchParams.get('category') || '';

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Backend connection failed:", err);
        setLoading(false);
      });
  }, []);

  const getFilteredProducts = () => {
    let filtered = products;

    // Apply search filter if present
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm)
      );
    }

    // Apply category filter if present (and not "All")
    if (categoryTerm && categoryTerm.toLowerCase() !== 'all') {
      filtered = filtered.filter(product => 
        product.category?.toLowerCase() === categoryTerm.toLowerCase()
      );
    }

    
    if (!searchTerm && !categoryTerm) {
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      filtered = filtered.filter(product => {
        const productDate = new Date(product.createdAt);
        return productDate >= fourteenDaysAgo;
      });
    }

    return filtered;
  };

  const displayProducts = getFilteredProducts();

  return (
      <main>
        <Hero />
        <CategoryNav />
        
        <section className={styles.productSection}>
          <h2 className="section-title">
            {categoryTerm.toLowerCase() === 'all' 
              ? "All Articles" 
              : categoryTerm 
              ? categoryTerm 
              : searchTerm 
              ? `Results for "${searchTerm}"` 
              : "New Arrivals"}
          </h2>
                    
          <div className={styles.productGrid}>
            {loading ? (
              Array(8).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
            ) : (
              <>
                {displayProducts.length > 0 ? (
                  displayProducts.map(product => (
                    <ProductCard 
                      key={product.id} 
                      {...product}
                      image={product.imageUrl || '/drone-product-image.png'}                      
                    />
                  ))
                ) : (
                  <div className={styles.noResults}>
                    {searchTerm ? (
                      <p>No products found matching <span>"{searchTerm}"</span></p>
                    ) : (
                      <p>Coming Soon: More products in {categoryTerm}!</p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
  );
};

export default Home;