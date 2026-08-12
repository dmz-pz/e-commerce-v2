import React, { useState, useEffect } from 'react';
import { ChevronDown, Fingerprint } from 'lucide-react';

export interface CedulaInputProps {
  label?: string;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  id?: string;
}

const PREFIXES = [
  { value: 'V', label: 'V' },
  { value: 'E', label: 'E' },
];

export const CedulaInput: React.FC<CedulaInputProps> = ({
  label,
  error,
  value = '',
  onChange,
  className = '',
  id,
}) => {
  const generatedId = id || (label ? `${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}-input` : undefined);
  const errorId = generatedId ? `${generatedId}-error` : undefined;

  const [prefix, setPrefix] = useState('V');
  const [number, setNumber] = useState('');

  // Sincronizar estado interno si cambia el value externo (ej. "V-12345678" o "V12345678")
  useEffect(() => {
    if (value) {
      const match = value.match(/^([VE])[-]?(\d{0,8})$/);
      if (match) {
        setPrefix(match[1] || 'V');
        setNumber(match[2] || '');
      }
    } else {
      setNumber('');
    }
  }, [value]);

  const handlePrefixChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPrefix = e.target.value;
    setPrefix(newPrefix);
    updateExternalValue(newPrefix, number);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Solo permitir números y máximo 8 caracteres
    const newNumber = e.target.value.replace(/\D/g, '').slice(0, 8);
    setNumber(newNumber);
    updateExternalValue(prefix, newNumber);
  };

  const updateExternalValue = (currentPrefix: string, currentNumber: string) => {
    if (onChange) {
      if (currentNumber.length === 0) {
        onChange(''); // Emitir vacío si no hay números
      } else {
        // Formato estándar: V-12345678
        onChange(`${currentPrefix}-${currentNumber}`);
      }
    }
  };

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={generatedId} className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
          {label}
        </label>
      )}

      <div className="flex gap-2">
        {/* Prefix Selector */}
        <div className="relative flex-shrink-0 w-20">
          <select
            value={prefix}
            onChange={handlePrefixChange}
            aria-invalid={!!error}
            className={`
              w-full appearance-none h-11 bg-slate-50 border rounded-xl text-xs font-bold text-slate-800 
              shadow-inner pr-8 pl-4 cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all
              ${error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-300'}
            `}
          >
            {PREFIXES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <ChevronDown size={14} strokeWidth={3} />
          </div>
        </div>

        {/* Number Input */}
        <div className="relative flex-grow">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
            <Fingerprint className="w-5 h-5" />
          </div>
          <input
            id={generatedId}
            type="text"
            placeholder="12345678"
            value={number}
            onChange={handleNumberChange}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            className={`
              w-full h-11 bg-slate-50 border rounded-xl text-xs font-bold text-slate-800 
              placeholder:text-slate-400 shadow-inner pl-11 pr-4
              focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all
              ${error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-300'}
            `}
          />
        </div>
      </div>

      {error && (
        <p id={errorId} role="alert" className="text-[10px] font-bold text-rose-500 px-1 mt-0.5">{error}</p>
      )}
    </div>
  );
};
