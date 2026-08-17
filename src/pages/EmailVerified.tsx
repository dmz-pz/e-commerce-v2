import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Loader2, XCircle } from 'lucide-react';
import { Logo } from '../components/Logo.tsx';

export const EmailVerified: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('success');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const error = searchParams.get('error');
    
    if (error) {
      setStatus('error');
      setErrorMessage('El enlace de verificación es inválido o ha expirado.');
    }
    // better-auth redirige aquí automáticamente tras verificar exitosamente en el backend
  }, [searchParams]);

  return (
    <main className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
      >
        <div className="p-8 md:p-12 text-center">
          <div className="mx-auto mb-6 w-20 h-20 drop-shadow-lg flex justify-center">
            <Logo className="w-full h-full" />
          </div>

          {status === 'verifying' && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-12 h-12 text-brand animate-spin mb-4" />
              <p className="text-slate-500 font-bold">Verificando tu correo...</p>
            </div>
          )}

          {status === 'success' && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="py-4"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-3">
                ¡Correo Verificado!
              </h1>
              <p className="text-sm text-slate-500 mb-8 font-medium">
                Tu dirección de correo electrónico ha sido confirmada exitosamente. Ya puedes disfrutar de todas las funcionalidades de Minegocio OS.
              </p>
              
              <button 
                onClick={() => navigate('/login')}
                className="w-full h-14 bg-brand text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-brand-dark transition-all shadow-lg shadow-brand/20 group"
              >
                Continuar
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-4"
            >
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-3">
                Error de Verificación
              </h1>
              <p className="text-sm text-slate-500 mb-8 font-medium">
                {errorMessage}
              </p>
              
              <button 
                onClick={() => navigate('/login')}
                className="w-full h-14 bg-slate-100 text-slate-700 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"
              >
                Volver al Inicio
              </button>
            </motion.div>
          )}

        </div>
      </motion.div>
    </main>
  );
};
