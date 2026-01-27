import { BrowserRouter as Router, Routes, Route, useLocation as useRouteLocation } from 'react-router-dom';
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js'; 
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
import OrderSuccess from './pages/Checkout/OrderSuccess';
import Profile from './pages/Profile/Profile';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const AppContent = () => {
  const routeLocation = useRouteLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const isAuthPage = [
    '/login', 
    '/register', 
    '/order-success' 
  ].includes(routeLocation.pathname) || routeLocation.pathname.startsWith('/admin');

  return (
    <>
      {!isAuthPage && <Header openLocationModal={() => setIsModalOpen(true)} />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<Cart />} />
        <Route path='/product/:productId' element={<ProductDetail />} />
        <Route path="/profile" element={<Profile />} />
        
        <Route 
          path="/orders" 
          element={<ProtectedRoute><Orders /></ProtectedRoute>} 
        />

        <Route 
          path="/checkout" 
          element={
            <ProtectedRoute>
              {/* Changed "Element" to "Elements" */}
              <Elements stripe={stripePromise}>
                <Checkout />
              </Elements>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/order-success" 
          element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} 
        />

        <Route 
          path="/admin" 
          element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} 
        />

        <Route path="*" element={<Home />} /> 
      </Routes>

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