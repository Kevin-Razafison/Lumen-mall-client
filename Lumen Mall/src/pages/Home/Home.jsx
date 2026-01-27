import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Hero from '../../components/Hero/Hero'; 
import CategoryNav from '../../components/Hero/CategoryNav';
import ProductCard from '../../components/ProductCard/ProductCard';
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
    const matchesCategory = categoryTerm ? product.category.toLowerCase() === categoryTerm.toLowerCase() : true;
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
        
        {loading ? (
          <div className={styles.loading}>Connecting to Lumen Servers...</div>
        ) : (
          <div className="product-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  id={product.id}
                  name={product.name}
                  description={product.description}
                  price={product.price}
                  stock={product.stock}
                  image={product.imageUrl || '/drone-product-image.png'}                      
                  category={product.category}
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
          </div>
        )}
      </section>
    </main>
  );
};

export default Home;