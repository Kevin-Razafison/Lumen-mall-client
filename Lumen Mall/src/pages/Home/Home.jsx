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
    // 1. Handle "All" category - bypass filters and show everything
    if (categoryTerm.toLowerCase() === 'all') {
      return products;
    }

    // 2. Handle Search or specific Category filtering
    if (searchTerm || (categoryTerm && categoryTerm.toLowerCase() !== 'all')) {
      return products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm);
        const matchesCategory = categoryTerm 
          ? product.category?.toLowerCase() === categoryTerm.toLowerCase() 
          : true;
        return matchesSearch && matchesCategory;
      });
    }

    // 3. Default Landing View: Show only New Arrivals (Last 14 days)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    return products.filter(product => {
      const productDate = new Date(product.createdAt);
      return productDate >= fourteenDaysAgo;
    });
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