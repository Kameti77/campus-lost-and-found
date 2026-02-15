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

// Protected pages
import Profile from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      {/* AuthProvider must wrap everything so all components can access auth state */}
      <AuthProvider>
        <SearchProvider>
          <Routes>

            {/* ── PUBLIC ROUTES — no login required ── */}
            <Route path="/login"           element={<Login />} />
            <Route path="/signup"          element={<Signup />} />
            <Route path="/verify-email"    element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* ── PROTECTED ROUTES — must be logged in + verified ── */}

            {/* Profile page — standalone, outside AppLayout so it has its own header */}
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />

            {/* Main app — AppLayout contains your existing sidebar + content */}
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <AppLayout />
                </PrivateRoute>
              }
            />

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />

          </Routes>
        </SearchProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;