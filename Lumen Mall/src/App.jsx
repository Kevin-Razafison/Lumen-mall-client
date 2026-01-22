import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/header/Header'
import Hero from './components/Hero/Hero'
import CategoryNav from './components/Hero/CategoryNav'
import droneImg from '../public/drone-product-image.png'
import ProductCard from './components/ProductCard/ProductCard'
import Footer from './components/Footer/Footer'
import Login from './pages/Login/Login'
import Cart from './pages/Cart/Cart'
import Home from './pages/Home/Home'


const AppContent = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isCartPage = location.pathname === '/cart';
  return (
    <>
      {!isLoginPage && <Header />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Home />} /> 
        <Route path="/cart" element={<Cart />} />
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