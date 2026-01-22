import { BrowserRouter as Router, Routes, Route, useLocation as useRouteLocation } from 'react-router-dom';
import { useState } from 'react'; // Add this
import Header from './components/header/Header'
import Footer from './components/Footer/Footer'
import Login from './pages/Login/Login'
import Cart from './pages/Cart/Cart'
import Home from './pages/Home/Home'
import ProductDetail from './pages/ProductDetail/ProductDetail';
import Checkout from './pages/Checkout/Checkout';
import LocationModal from './components/Modals/LocationModal'; // Add this

const AppContent = () => {
  // Rename router's useLocation to avoid conflict with your custom one
  const routeLocation = useRouteLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isLoginPage = routeLocation.pathname === '/login';

  return (
    <>
      {/* Pass the function to open the modal to the Header */}
      {!isLoginPage && <Header openLocationModal={() => setIsModalOpen(true)} />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cart" element={<Cart />} />
        <Route path='/product/:productId' element={<ProductDetail />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="*" element={<Home />} /> 
      </Routes>

      {!isLoginPage && <Footer />}

      {/* Place the Modal here */}
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