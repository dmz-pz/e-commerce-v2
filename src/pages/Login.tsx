import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext.tsx';
import { User, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { Logo } from '../components/Logo.tsx';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useUser();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await login(email, password);
      navigate('/profile');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
      >
        <div className="p-8 md:p-12">
          <div className="text-center mb-10">
            <div className="mx-auto mb-4 w-16 h-16 drop-shadow-lg">
              <Logo className="w-full h-full" />
            </div>
            <h1 className="text-2xl font-black text-brand uppercase tracking-tight">Bienvenido</h1>
            <p className="text-slate-400 text-sm font-medium">Ingresa a tu cuenta para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input 
                  type="email" 
                  required
                  className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all placeholder:text-slate-300"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input 
                  type="password" 
                  required
                  className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all placeholder:text-slate-300"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-xs font-bold text-center bg-red-50 py-3 rounded-xl border border-red-100"
              >
                {error}
              </motion.p>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-brand text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-brand-dark transition-all disabled:opacity-50 shadow-lg shadow-brand/20 group"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Iniciar Sesión
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-400 text-sm font-medium">
              ¿No tienes una cuenta?{' '}
              <Link to="/register" className="text-brand font-black hover:underline underline-offset-4">
                Regístrate gratis
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </main>
  );
};

export default Login;
