import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from './components/Navbar.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { CategoryModal } from './components/catalog/CategoryModal.tsx';
import { CartDrawer } from './components/catalog/CartDrawer.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { CatalogProvider } from './context/CatalogContext.tsx';
import { UserProvider, useUser } from './context/UserContext.tsx';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';

const Catalog = lazy(() => import('./pages/Catalog.tsx').then(module => ({ default: module.Catalog })));
const ProductDetail = lazy(() => import('./pages/ProductDetail.tsx').then(module => ({ default: module.ProductDetail })));
const StaffDashboard = lazy(() => import('./pages/StaffDashboard.tsx').then(module => ({ default: module.StaffDashboard })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.tsx').then(module => ({ default: module.AdminDashboard })));
const DeliveryDashboard = lazy(() => import('./pages/DeliveryDashboard.tsx').then(module => ({ default: module.DeliveryDashboard })));
const Checkout = lazy(() => import('./pages/Checkout.tsx').then(module => ({ default: module.Checkout })));

const Login = lazy(() => import('./pages/Login.tsx'));
const Register = lazy(() => import('./pages/Register.tsx'));
const Profile = lazy(() => import('./pages/Profile.tsx'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.tsx'));
const ResetPassword = lazy(() => import('./pages/ResetPassword.tsx'));
const EmailVerified = lazy(() => import('./pages/EmailVerified.tsx').then(module => ({ default: module.EmailVerified })));
import { Role } from './types/index.ts';

// Configuración global de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutos
    },
  },
});

// Redirecciona a usuarios con roles operativos/administrativos lejos de la tienda pública
const ClientRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  if (user) {
    if (user.role === Role.ADMINISTRADOR) {
      return <Navigate to="/admin" replace />;
    }
    if (user.role === Role.STAFF_PICKER) {
      return <Navigate to="/staff" replace />;
    }
    if (user.role === Role.DELIVERY) {
      return <Navigate to="/delivery" replace />;
    }
  }
  return <>{children}</>;
};

// Evita que usuarios ya autenticados vuelvan a la pantalla de Login/Registro
const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  if (user) {
    if (user.role === Role.ADMINISTRADOR) {
      return <Navigate to="/admin" replace />;
    }
    if (user.role === Role.STAFF_PICKER) {
      return <Navigate to="/staff" replace />;
    }
    if (user.role === Role.DELIVERY) {
      return <Navigate to="/delivery" replace />;
    }
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const LoadingFallback = () => (
  <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-brand rounded-full animate-spin"></div>
      <span className="text-sm font-bold text-slate-400 tracking-widest uppercase">Cargando...</span>
    </div>
  </div>
);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <CartProvider>
        <CatalogProvider>
        <Router>
        <div className="min-h-screen bg-slate-50 flex flex-col pb-16 md:pb-0">
          <Navbar />
          <div className="flex-1">
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
              <Route path="/" element={
                <ClientRoute>
                  <Catalog />
                </ClientRoute>
              } />
              <Route path="/product/:id" element={
                <ClientRoute>
                  <ProductDetail />
                </ClientRoute>
              } />
              <Route path="/staff" element={
                <ProtectedRoute allowedRoles={[Role.STAFF_PICKER, Role.ADMINISTRADOR]}>
                  <StaffDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={[Role.ADMINISTRADOR]}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/login" element={
                <AuthRoute>
                  <Login />
                </AuthRoute>
              } />
              <Route path="/register" element={
                <AuthRoute>
                  <Register />
                </AuthRoute>
              } />
              <Route path="/forgot-password" element={
                <AuthRoute>
                  <ForgotPassword />
                </AuthRoute>
              } />
              <Route path="/reset-password" element={
                <AuthRoute>
                  <ResetPassword />
                </AuthRoute>
              } />
              <Route path="/email-verified" element={
                <EmailVerified />
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/checkout" element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } />
              <Route path="/delivery" element={
                <ProtectedRoute allowedRoles={[Role.DELIVERY, Role.ADMINISTRADOR]}>
                  <DeliveryDashboard />
                </ProtectedRoute>
              } />
            </Routes>
            </Suspense>
          </div>
          <BottomNav />
          <CartDrawer />
          <CategoryModal />
          
          <footer className="bg-white border-t border-slate-200 py-10 mt-20">
            <div className="max-w-[1600px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex flex-col items-center md:items-start">
                <p className="text-brand text-[10px] font-mono tracking-[0.3em] uppercase mb-1 font-black">Minegocio OS v3.0.0</p>
                <p className="text-slate-400 text-[10px]">© {new Date().getFullYear()} Minegocio • High Performance Retail Solutions</p>
              </div>
              <div className="flex gap-8 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <a href="#" className="hover:text-brand transition-colors">Infraestructura</a>
                <a href="#" className="hover:text-brand transition-colors">Seguridad</a>
                <a href="#" className="hover:text-brand transition-colors uppercase">Base de Datos</a>
              </div>
            </div>
          </footer>
        </div>
      </Router>
      </CatalogProvider>
      </CartProvider>
    </UserProvider>
    </QueryClientProvider>
  );
}
