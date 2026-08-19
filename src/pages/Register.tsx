import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext.tsx';
import { User, Mail, ArrowRight, Loader2, Calendar, CheckCircle2, RefreshCw } from 'lucide-react';
import { authClient } from '../services/authClient.ts';
import { userService } from '../services/userService.ts';
import { Logo } from '../components/Logo.tsx';
import { PasswordInput } from '../components/PasswordInput.tsx';
import { PhoneInput } from '../components/ui/PhoneInput.tsx';
import { CedulaInput } from '../components/ui/CedulaInput.tsx';

const Register: React.FC = () => {
  const [cedula, setCedula] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const { register } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [cooldown]);

  const handleResendEmail = async () => {
    if (cooldown > 0) return;
    try {
      await authClient.sendVerificationEmail({
        email,
        callbackURL: `${window.location.origin}/email-verified`
      });
      setCooldown(60);
    } catch (err) {
      console.error("Error al reenviar:", err);
    }
  };

  const checkAvailability = async (field: 'cedula' | 'phone' | 'email', value: string) => {
    if (!value) return;
    try {
      await userService.checkAvailability({ [field]: value });
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    } catch (error: any) {
      if (error.data?.issues) {
        setErrors(prev => {
          const newErrors = { ...prev };
          error.data.issues.forEach((issue: any) => {
            if (issue.path && issue.path[0] === field) {
              newErrors[field] = issue.message;
            }
          });
          return newErrors;
        });
      }
    }
  };

  const handleBlur = (field: 'cedula' | 'phone' | 'email' | 'birthdate', value: string) => {
    if (field === 'birthdate') {
      if (!value) return;
      const birthDateObj = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthDateObj.getFullYear();
      const monthDiff = today.getMonth() - birthDateObj.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
      }
      if (age < 18) {
        setErrors(prev => ({ ...prev, birthdate: 'Debes ser mayor de edad (mínimo 18 años) para registrarte.' }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.birthdate;
          return newErrors;
        });
      }
      return;
    }

    // Asynchronous backend validation for uniqueness
    checkAvailability(field, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setGeneralError('');

    let hasClientErrors = false;
    const newErrors: Record<string, string> = {};

    // Validaciones básicas de formato del frontend previas al backend
    if (!/^[VE]-\d{7,8}$/.test(cedula)) {
      newErrors.cedula = 'La cédula debe ser V o E y contener entre 7 y 8 dígitos (ej: V-12345678).';
      hasClientErrors = true;
    }

    if (!/^\+58\d{10}$/.test(phone)) {
      newErrors.phone = 'El teléfono debe ser válido y contener 10 dígitos (ej: +584121234567).';
      hasClientErrors = true;
    }

    if (password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres.';
      hasClientErrors = true;
    }

    if (!birthdate) {
      newErrors.birthdate = 'La fecha de nacimiento es requerida.';
      hasClientErrors = true;
    } else {
      const birthDateObj = new Date(birthdate);
      const today = new Date();
      let age = today.getFullYear() - birthDateObj.getFullYear();
      const monthDiff = today.getMonth() - birthDateObj.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
      }

      if (age < 18) {
        newErrors.birthdate = 'Debes ser mayor de edad (mínimo 18 años) para registrarte.';
        hasClientErrors = true;
      }
    }

    if (hasClientErrors) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      await register({
        cedula,
        name: `${firstName} ${lastName}`.trim(),
        phone,
        email,
        password,
        birthdate: birthdate || undefined
      });
      setSuccess(true);
    } catch (error) {
      const err = error as any;
      if (err.data?.issues) {
        const backendErrors: Record<string, string> = {};
        err.data.issues.forEach((issue: any) => {
          if (issue.path && issue.path[0]) {
            backendErrors[issue.path[0]] = issue.message;
          }
        });
        setErrors(backendErrors);
      } else {
        setGeneralError(err.message || 'Error al registrarse');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-[90vh] flex items-center justify-center p-4 py-10 bg-slate-50/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-border/5 border border-slate-100 overflow-hidden text-center p-8 md:p-12"
        >
          <div className="mx-auto mb-6 w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-4">¡Registro Exitoso!</h1>
          <p className="text-slate-500 font-medium mb-8">
            Te hemos enviado un enlace de verificación a <strong>{email}</strong>. Por favor, revisa tu bandeja de entrada o la carpeta de Spam para activar tu cuenta.
          </p>

          <div className="space-y-4">
            <button
              onClick={() => navigate('/login')}
              className="w-full h-14 bg-brand text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center hover:bg-brand-dark transition-all shadow-lg shadow-brand/20"
            >
              Ir a Iniciar Sesión
            </button>
            <button
              onClick={handleResendEmail}
              disabled={cooldown > 0}
              className="w-full h-14 bg-slate-50 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-slate-100 transition-all disabled:opacity-50 border border-slate-200"
            >
              <RefreshCw className={`w-4 h-4 ${cooldown > 0 ? '' : 'hover:rotate-180 transition-transform duration-500'}`} />
              {cooldown > 0 ? `Reintentar en ${cooldown}s` : 'Reenviar Correo'}
            </button>
          </div>
        </motion.div>
      </main>
    );
  }
  const isFormComplete = !!(cedula && firstName && lastName && phone && email && birthdate && password);
  const isSubmitDisabled = loading || Object.values(errors).some(Boolean) || !isFormComplete;

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
              {/* Nombre Completo */}
              {/* Nombres */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Nombres</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={20}
                    className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all placeholder:text-slate-300"
                    placeholder="Ej. María"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
              </div>

              {/* Apellidos */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Apellidos</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={20}
                    className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all placeholder:text-slate-300"
                    placeholder="Ej. Pérez"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              {/* Cédula */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Cédula de Identidad</label>
                <div onBlur={() => handleBlur('cedula', cedula)}>
                  <CedulaInput
                    value={cedula}
                    onChange={(val) => { setCedula(val); setErrors(prev => ({ ...prev, cedula: '' })); }}
                  />
                </div>
                {errors.cedula && (
                  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-[10px] font-bold mt-1 px-1">
                    {errors.cedula}
                  </motion.p>
                )}
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Teléfono Móvil</label>
                <div onBlur={() => handleBlur('phone', phone)}>
                  <PhoneInput
                    value={phone}
                    onChange={(val) => { setPhone(val); setErrors(prev => ({ ...prev, phone: '' })); }}
                  />
                </div>
                {errors.phone && (
                  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-[10px] font-bold mt-1 px-1">
                    {errors.phone}
                  </motion.p>
                )}
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
                    onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: '' })); }}
                    onBlur={(e) => handleBlur('email', e.target.value)}
                  />
                </div>
                {errors.email && (
                  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-[10px] font-bold mt-1 px-1">
                    {errors.email}
                  </motion.p>
                )}
              </div>

              {/* Fecha de Nacimiento */}
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Fecha de Nacimiento</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input
                    type="date"
                    required
                    className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all placeholder:text-slate-300"
                    value={birthdate}
                    onChange={(e) => { setBirthdate(e.target.value); setErrors(prev => ({ ...prev, birthdate: '' })); }}
                    onBlur={(e) => handleBlur('birthdate', e.target.value)}
                  />
                </div>
                {!errors.birthdate ? (
                  <p className="text-[10px] text-slate-400 mt-2 px-1 font-semibold">
                    Debes ser mayor de edad para registrarte.
                  </p>
                ) : (
                  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-[10px] font-bold mt-1 px-1">
                    {errors.birthdate}
                  </motion.p>
                )}
              </div>

              {/* Contraseña */}
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Contraseña</label>
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
                <p className="text-[10px] text-slate-400 mt-2 px-1 font-semibold">
                  Debe incluir mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número.
                </p>
              </div>
            </div>

            {generalError && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-xs font-bold text-center bg-red-50 py-3 px-4 rounded-xl border border-red-100"
              >
                {generalError}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={isSubmitDisabled}
              className={`w-full h-14 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-lg group ${isSubmitDisabled
                ? 'bg-slate-300 opacity-70 cursor-not-allowed shadow-none'
                : 'bg-brand hover:bg-brand-dark shadow-brand/20'
                }`}
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
