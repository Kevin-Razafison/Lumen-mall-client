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
import Register from './pages/Login/Register';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/Admin/AdminDashboard';

const AppContent = () => {
  const routeLocation = useRouteLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // This checks if the current path is either Login or Register
  const isAuthPage = ['/login', '/register'].includes(routeLocation.pathname) || routeLocation.pathname.startsWith('/admin');

  return (
    <>
      {/* Only show Header if NOT on an auth page */}
      {!isAuthPage && <Header openLocationModal={() => setIsModalOpen(true)} />}

    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/cart" element={<Cart />} />
      <Route path='/product/:productId' element={<ProductDetail />} />
      
      {/* PROTECTED ROUTES */}
      <Route 
        path="/orders" 
        element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/checkout" 
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/admin" 
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />

      <Route path="*" element={<Home />} /> 
    </Routes>

      {/* Only show Footer if NOT on an auth page */}
      {!isAuthPage && <Footer />}

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