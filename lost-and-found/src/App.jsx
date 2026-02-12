import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SearchProvider } from './context/SearchContext';
import AppLayout from './components/layout/AppLayout';
import PrivateRoute from './components/auth/PrivateRoute';

// Auth pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';

function App() {
  return (
    <BrowserRouter>
      {/* AuthProvider wraps everything - provides auth state globally */}
      <AuthProvider>
        <SearchProvider>
          <Routes>
            {/* PUBLIC ROUTES - Anyone can access */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* PROTECTED ROUTES - Must be logged in and verified */}
            {/* All your existing app routes go inside this PrivateRoute wrapper */}
            <Route 
              path="/*" 
              element={
                <PrivateRoute>
                  <AppLayout />
                </PrivateRoute>
              } 
            />

            {/* Catch all - redirect to login if route doesn't exist */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </SearchProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;