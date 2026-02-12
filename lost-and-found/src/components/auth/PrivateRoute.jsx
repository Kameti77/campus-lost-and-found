import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Component to protect routes - redirects to login if not authenticated
// Wrap any route that requires login with this component
const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  // Show loading spinner while checking if user is logged in
  // This prevents flash of login page before auth loads
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user is logged in, redirect to login page
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If user hasn't verified email, redirect to verification page
  if (!currentUser.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  // User is authenticated and verified - show the protected content
  return children;
};

export default PrivateRoute;