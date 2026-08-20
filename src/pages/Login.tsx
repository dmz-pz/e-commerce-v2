import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext.tsx';
import { Mail, ArrowRight, Loader2, RefreshCw, CheckCircle2 } from 'lucide-react';
import { authClient } from '../services/authClient';
import { Logo } from '../components/Logo.tsx';
import { PasswordInput } from '../components/PasswordInput.tsx';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [showUnverified, setShowUnverified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const { login } = useUser();
  const navigate = useNavigate();

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [resendCooldown]);

  const handleResend = async (targetEmail: string) => {
    if (resendCooldown > 0) return;
    
    setResendLoading(true);
    setResendSuccess(false);
    try {
      await authClient.sendVerificationEmail({
        email: targetEmail,
        callbackURL: '/login' // No se usa directamente aquí pero es requerido por la API
      });
      setResendSuccess(true);
      setResendCooldown(60);
    } catch (error) {
      console.error('Error re-enviando email', error);
    } finally {
      setResendLoading(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setGeneralError('');

    try {
      await login(email, password);
      navigate('/profile');
    } catch (error) {
      const err = error as any;
      
      if (err.code === 'EMAIL_NOT_VERIFIED') {
        setShowUnverified(true);
        setUnverifiedEmail(email);
        handleResend(email);
        return;
      }

      if (err.data?.issues) {
        const newErrors: Record<string, string> = {};
        err.data.issues.forEach((issue: any) => {
          if (issue.path && issue.path[0]) {
            newErrors[issue.path[0]] = issue.message;
          }
        });
        setErrors(newErrors);
      } else {
        setGeneralError(err.message || 'Error al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };

  if (showUnverified) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl shadow-brand/10 border border-slate-100"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-brand" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Verifica tu correo</h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              Hemos enviado un correo de verificación a <span className="font-bold text-slate-700">{unverifiedEmail}</span>. 
              Por favor, revisa tu bandeja de entrada o spam.
            </p>
          </div>

          <div className="space-y-4">
            {resendSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-50 text-emerald-600 p-4 rounded-xl text-sm font-medium flex items-center gap-3 justify-center mb-4 border border-emerald-100"
              >
                <CheckCircle2 className="w-5 h-5" />
                Correo reenviado con éxito
              </motion.div>
            )}

            <button
              onClick={() => handleResend(unverifiedEmail)}
              disabled={resendCooldown > 0 || resendLoading}
              className="w-full h-14 bg-brand text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-brand-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand/20 group"
            >
              {resendLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : resendCooldown > 0 ? (
                `Reenviar en ${resendCooldown}s`
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Reenviar correo
                </>
              )}
            </button>
            <button
              onClick={() => {
                setShowUnverified(false);
                setGeneralError('');
                setResendSuccess(false);
              }}
              className="w-full h-14 bg-slate-100 text-slate-600 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-slate-200 transition-all"
            >
              Volver al inicio de sesión
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

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
                  onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: '' })); }}
                />
              </div>
              {errors.email && (
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-[10px] font-bold mt-1 px-1">
                  {errors.email}
                </motion.p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 px-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Contraseña</label>
                <Link to="/forgot-password" className="text-[10px] font-bold text-brand hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <PasswordInput
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: '' })); }}
              />
              {errors.password && (
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-[10px] font-bold mt-1 px-1">
                  {errors.password}
                </motion.p>
              )}
            </div>

            {generalError && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-xs font-bold text-center bg-red-50 py-3 rounded-xl border border-red-100"
              >
                {generalError}
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
