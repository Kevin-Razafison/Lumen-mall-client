import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If the route is admin-only and the user is NOT an admin, kick them to home
  if (adminOnly && user.role !== 'ROLE_ADMIN') {
    console.log("Access Denied. User role is:", user.role)
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;