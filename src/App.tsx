import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { Catalog } from './pages/Catalog.tsx';
import { ProductDetail } from './pages/ProductDetail.tsx';
import { StaffDashboard } from './pages/StaffDashboard.tsx';
import { AdminDashboard } from './pages/AdminDashboard.tsx';
import { CategoryModal } from './components/catalog/CategoryModal.tsx';
import { CartDrawer } from './components/catalog/CartDrawer.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { CatalogProvider } from './context/CatalogContext.tsx';
import { UserProvider, useUser } from './context/UserContext.tsx';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import Profile from './pages/Profile.tsx';
import ForgotPassword from './pages/ForgotPassword.tsx';
import ResetPassword from './pages/ResetPassword.tsx';
import { DeliveryDashboard } from './pages/DeliveryDashboard.tsx';
import { Checkout } from './pages/Checkout.tsx';

import { Role } from './types/index.ts';

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

export default function App() {
  return (
    <UserProvider>
      <CartProvider>
      <CatalogProvider>
        <Router>
        <div className="min-h-screen bg-slate-50 flex flex-col pb-16 md:pb-0">
          <Navbar />
          <div className="flex-1">
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
  );
}
