import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  containerClassName?: string;
  iconClassName?: string;
  buttonClassName?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  placeholder = "••••••••",
  className = "h-14 text-sm font-bold",
  containerClassName = "",
  iconClassName = "w-5 h-5 text-slate-300",
  buttonClassName = "text-slate-400 hover:text-brand transition-colors p-1 cursor-pointer",
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={`relative ${containerClassName}`}>
      <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 ${iconClassName}`} />
      <input
        type={showPassword ? "text" : "password"}
        className={`w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-12 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all placeholder:text-slate-300 ${className}`}
        placeholder={placeholder}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        className={`absolute right-4 top-1/2 -translate-y-1/2 ${buttonClassName}`}
        tabIndex={-1}
        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {showPassword ? (
          <EyeOff className="w-5 h-5" />
        ) : (
          <Eye className="w-5 h-5" />
        )}
      </button>
    </div>
  );
};
