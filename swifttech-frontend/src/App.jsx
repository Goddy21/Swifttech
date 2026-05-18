/**
 * App.jsx  — updated to wire Login route and remove old platform auth
 */

import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';

import AppLayout from '@/components/layout/AppLayout';
import Home from '@/pages/Home';
import ProductDetail from '@/pages/ProductDetail';
import AdminUpload from '@/pages/AdminUpload';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import Orders from '@/pages/Orders';
import Login from '@/pages/Login';

// Loading spinner
const Spinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-[#F8FAFF]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
      <p className="font-mono text-xs text-muted-foreground tracking-widest">LOADING...</p>
    </div>
  </div>
);

// Requires auth — redirects to /login if not signed in
const RequireAuth = ({ children }) => {
  const { isAuthenticated, isLoadingAuth, authChecked } = useAuth();
  if (isLoadingAuth || !authChecked) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// Requires admin role
const RequireAdmin = ({ children }) => {
  const { user, isLoadingAuth, authChecked } = useAuth();
  if (isLoadingAuth || !authChecked) return <Spinner />;
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl border border-border shadow-sm max-w-sm">
          <p className="font-heading text-lg font-semibold mb-2">Admin Access Required</p>
          <p className="text-muted-foreground text-sm">You need admin privileges to view this page.</p>
        </div>
      </div>
    );
  }
  return children;
};

const AppRoutes = () => {
  const { isLoadingAuth, authChecked } = useAuth();
  if (isLoadingAuth || !authChecked) return <Spinner />;

  return (
    <Routes>
      {/* Public login */}
      <Route path="/login" element={<Login />} />

      {/* Main layout */}
      <Route element={<AppLayout />}>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetail />} />

        {/* Auth required */}
        <Route path="/cart" element={<RequireAuth><Cart /></RequireAuth>} />
        <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
        <Route path="/orders" element={<RequireAuth><Orders /></RequireAuth>} />

        {/* Admin only */}
        <Route path="/admin" element={<RequireAdmin><AdminUpload /></RequireAdmin>} />
      </Route>

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AppRoutes />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}
