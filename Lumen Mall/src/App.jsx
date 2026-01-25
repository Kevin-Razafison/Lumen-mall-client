import { BrowserRouter as Router, Routes, Route, useLocation as useRouteLocation } from 'react-router-dom';
import { useState } from 'react';
import Header from './components/header/Header';
import Footer from './components/Footer/Footer';
import Login from './pages/Login/Login';
import Cart from './pages/Cart/Cart';
import Home from './pages/Home/Home';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import Checkout from './pages/Checkout/Checkout';
import LocationModal from './components/Modals/LocationModal';
import Orders from './pages/Orders/Orders';

const AppContent = () => {
  const routeLocation = useRouteLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isLoginPage = routeLocation.pathname === '/login';

  return (
    <>
      {!isLoginPage && <Header openLocationModal={() => setIsModalOpen(true)} />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cart" element={<Cart />} />
        <Route path='/product/:productId' element={<ProductDetail />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="*" element={<Home />} /> 
        <Route path="/orders" element={<Orders />} />
      </Routes>

      {!isLoginPage && <Footer />}

      <LocationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
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