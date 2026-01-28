import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Hero from '../../components/Hero/Hero'; 
import CategoryNav from '../../components/Hero/CategoryNav';
import ProductCard, { ProductCardSkeleton } from '../../components/ProductCard/ProductCard';
import styles from './Home.module.css';

const Home = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  const searchTerm = searchParams.get('search')?.toLowerCase() || '';
  const categoryTerm = searchParams.get('category') || '';

  useEffect(() => {
    fetch("http://localhost:8080/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Backend connection failed:", err);
        setLoading(false);
      });
  }, []);

  const filteredProducts = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm);
      const matchesCategory = categoryTerm ? product.category?.toLowerCase() === categoryTerm.toLowerCase() : true;
      
      
      if (!searchTerm && !categoryTerm) {
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
        const productDate = new Date(product.createdAt);
        return productDate >= fourteenDaysAgo;
      }

      return matchesSearch && matchesCategory;
  });

  const isViewingAll = categoryTerm === 'all';
  
  const displayProducts = isViewingAll ? products : filteredProducts;

  return (
      <main>
        <Hero />
        <CategoryNav />
        
        <section className="product-section">
          <h2 className="section-title">
            {categoryTerm === 'all' 
              ? "All Articles" 
              : categoryTerm 
              ? categoryTerm 
              : searchTerm 
              ? `Results for "${searchTerm}"` 
              : "New Arrivals "}
          </h2>
                    
          <div className="product-grid">
            {loading ? (
              // Render 8 skeletons while loading
              Array(8).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
            ) : (
              <>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(product => (
                    <ProductCard 
                      key={product.id} 
                      {...product} // Cleaner way to pass all props
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