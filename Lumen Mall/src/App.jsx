import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/header/Header'
import Hero from './components/Hero/Hero'
import CategoryNav from './components/Hero/CategoryNav'
import droneImg from '../public/drone-product-image.png'
import ProductCard from './components/ProductCard/ProductCard'
import Footer from './components/Footer/Footer'
import Login from './pages/Login/Login'

const Home = () => (
  <main>
    <Hero />
    <CategoryNav />
    <section className="product-section">
      <h2 className="section-title">New Arrivals</h2>
      <div className="product-grid">
        <ProductCard 
          image={droneImg} 
          name="Drone" 
          description="Mesure a merakondroud..." 
          price="20.90" 
        />
      </div>
    </section>
    <section className="product-section">
      <h2 className="section-title">All Product</h2>
      <div className="product-grid">
        <ProductCard 
          image={droneImg} 
          name="Drone" 
          description="Mesure a merakondroud..." 
          price="20.90" 
        />
      </div>
    </section>
  </main>
);

const AppContent = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <>
      {!isLoginPage && <Header />}
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Home />} /> 
      </Routes>

      {!isLoginPage && <Footer />}
    </>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;