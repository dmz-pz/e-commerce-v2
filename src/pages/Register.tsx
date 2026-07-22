import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext.tsx';
import { User, Mail, ArrowRight, Loader2, Phone, Calendar, Fingerprint } from 'lucide-react';
import { Logo } from '../components/Logo.tsx';
import { PasswordInput } from '../components/PasswordInput.tsx';

const Register: React.FC = () => {
  const [cedula, setCedula] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useUser();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Validaciones básicas de formato del frontend previas al backend
    if (!/^\d{7,8}$/.test(cedula)) {
      setError('La cédula debe contener entre 7 y 8 dígitos numéricos.');
      setLoading(false);
      return;
    }

    if (!/^\d{11}$/.test(phone)) {
      setError('El teléfono debe contener exactamente 11 dígitos numéricos (ej: 04121234567).');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      setLoading(false);
      return;
    }

    try {
      await register({
        cedula,
        firstName,
        lastName,
        phone,
        email,
        password,
        birthdate: birthdate || undefined
      });
      navigate('/profile');
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[90vh] flex items-center justify-center p-4 py-10 bg-slate-50/50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-xl shadow-border/5 border border-slate-100 overflow-hidden"
      >
        <div className="p-8 md:p-12">
          <div className="text-center mb-10">
            <div className="mx-auto mb-4 w-16 h-16 drop-shadow-lg">
              <Logo className="w-full h-full" />
            </div>
            <h1 className="text-2xl font-black text-brand uppercase tracking-tight">Crea tu cuenta</h1>
            <p className="text-slate-400 text-sm font-medium">Completa tu información de cliente para comenzar a comprar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Primer Nombre */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Primer Nombre</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input 
                    type="text" 
                    required
                    minLength={3}
                    maxLength={16}
                    className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all placeholder:text-slate-300"
                    placeholder="María"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
              </div>

              {/* Primer Apellido */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Primer Apellido</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input 
                    type="text" 
                    required
                    minLength={3}
                    maxLength={25}
                    className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all placeholder:text-slate-300"
                    placeholder="Pérez"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              {/* Cédula */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Cédula de Identidad</label>
                <div className="relative">
                  <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input 
                    type="text" 
                    required
                    className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all placeholder:text-slate-300"
                    placeholder="12345678"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Teléfono Móvil</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input 
                    type="tel" 
                    required
                    className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all placeholder:text-slate-300"
                    placeholder="04121112233"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input 
                    type="email" 
                    required
                    className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all placeholder:text-slate-300"
                    placeholder="maria.perez@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Fecha de Nacimiento (Opcional) */}
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Fecha de Nacimiento (Opcional)</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input 
                    type="date" 
                    className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all placeholder:text-slate-300"
                    value={birthdate}
                    onChange={(e) => setBirthdate(e.target.value)}
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Contraseña</label>
                <PasswordInput
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="text-[10px] text-slate-400 mt-2 px-1 font-semibold">
                  Debe incluir mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número.
                </p>
              </div>
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-xs font-bold text-center bg-red-50 py-3 px-4 rounded-xl border border-red-100"
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
                  Registrarme y Comprar
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-400 text-sm font-medium">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="text-brand font-black hover:underline underline-offset-4">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </main>
  );
};

export default Register;
