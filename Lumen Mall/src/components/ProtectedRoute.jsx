import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Add "user &&" here just to be bulletproof
  if (adminOnly && (!user || user.role !== 'ROLE_ADMIN')) {
    console.log("Access Denied. User role is:", user?.role);
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;