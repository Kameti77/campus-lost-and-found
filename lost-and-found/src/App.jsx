import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SearchProvider } from './context/SearchContext';
import AppLayout from './components/layout/AppLayout';
import PrivateRoute from './components/auth/PrivateRoute';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SearchProvider>
          <Routes>

            {/* ── PUBLIC ── */}
            <Route path="/login"           element={<Login />} />
            <Route path="/signup"          element={<Signup />} />
            <Route path="/verify-email"    element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* ── PROTECTED: standalone pages (outside AppLayout) ── */}
            {/* Profile must be listed BEFORE the /* catch-all */}
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />

            {/* ── PROTECTED: main app shell ── */}
            {/* AppLayout has its own nested Routes for /, /lost, /found */}
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <AppLayout />
                </PrivateRoute>
              }
            />

          </Routes>
        </SearchProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;