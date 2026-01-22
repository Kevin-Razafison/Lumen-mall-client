import { useLocation } from 'react-router-dom';
import Hero from '../../components/Hero/Hero'; 
import CategoryNav from '../../components/Hero/CategoryNav';
import ProductCard from '../../components/ProductCard/ProductCard';
import {products} from '../../data/product.js'

const Home = () => {
  const location = useLocation();
  
  const queryParams = new URLSearchParams(location.search);
  const searchTerm = queryParams.get('search')?.toLowerCase() || '';

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm) || 
    product.description.toLowerCase().includes(searchTerm)
  );

  return (
    <main>
      <Hero />
      <CategoryNav />
      
      <section className="product-section">
        <h2 className="section-title">
          {searchTerm ? `Results for "${searchTerm}"` : "New Arrivals"}
        </h2>
        
        <div className="product-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <ProductCard key={product.id} {...product} />
            ))
          ) : (
            <div style={{ padding: '20px', color: 'white' }}>
              <p>No drones matching your search found.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Home;