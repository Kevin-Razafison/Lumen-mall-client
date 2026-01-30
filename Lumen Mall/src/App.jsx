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
import DashboardOverview from './pages/Admin/components/DashboardOverview';
import InventorySection from './pages/Admin/components/inventory/InventorySection';
import AddProductForm from './pages/Admin/components/AddProductForm';
import OrdersSection from './pages/Admin/components/OrdersSection';
import UsersSection from './pages/Admin/components/UsersSection';
import ReviewsSection from './pages/Admin/components/ReviewsSection';
import VerifyEmail from './pages/Login/VerifyEmail';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const AppContent = () => {
  const routeLocation = useRouteLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const isAuthPage = [
    '/login', 
    '/register',
    '/verify',       
    '/order-success' 
  ].includes(routeLocation.pathname) || routeLocation.pathname.startsWith('/admin');

  return (
    <>
      {!isAuthPage && <Header openLocationModal={() => setIsModalOpen(true)} />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<VerifyEmail />} />
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
          path="/admin/*" 
          element={
          <ProtectedRoute adminOnly={true}>
            <AdminDashboard />
          </ProtectedRoute>} 
        >
          <Route index element={<DashboardOverview />} />
          <Route path="inventory" element={<InventorySection />} />
          <Route path="add-product" element={<AddProductForm />} />
          <Route path="orders" element={<OrdersSection />} />
          <Route path="users" element={<UsersSection />} />
          <Route path="reviews" element={<ReviewsSection />} />
        </Route>

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

// Simplified App component: Router is now in main.jsx
function App() {
  return (
    <AppContent />
  );
}

export default App;