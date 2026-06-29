import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext.tsx';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'client' | 'staff' | 'picker' | 'admin'>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user } = useUser();

  // Si no está autenticado, redirigir al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado pero se requieren roles específicos y el usuario no lo tiene
  if (allowedRoles && (!user.role || !allowedRoles.includes(user.role))) {
    return (
      <main className="min-h-[75vh] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden text-center p-8 md:p-12"
        >
          <div className="mx-auto mb-6 w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center border border-red-100 shadow-md">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">Acceso Restringido</h1>
          <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
            Tu cuenta actual ({user.email}) no cuenta con los privilegios necesarios para acceder a este módulo corporativo.
          </p>

          <div className="space-y-4">
            <Link 
              to="/" 
              className="w-full h-12 bg-brand text-white rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-brand-dark transition-all shadow-md shadow-brand/10"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al Catalogo
            </Link>
            <Link 
              to="/login"
              className="block text-brand text-xs font-black uppercase tracking-widest hover:underline py-2"
            >
              Iniciar sesión con otra cuenta
            </Link>
          </div>
        </motion.div>
      </main>
    );
  }

  // Si pasa todas las validaciones, renderizar el componente hijo
  return <>{children}</>;
};
