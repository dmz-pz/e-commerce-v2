import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface PhoneInputProps {
  label?: string;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  id?: string;
}

const CARRIER_PREFIXES = [
  { group: 'Movistar', codes: ['0414', '0424'] },
  { group: 'Movilnet', codes: ['0416', '0426'] },
  { group: 'Digitel', codes: ['0412', '0422'] },
];

export const PhoneInput: React.FC<PhoneInputProps> = ({
  label,
  error,
  value = '',
  onChange,
  className = '',
  id,
}) => {
  const generatedId = id || (label ? `${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}-input` : undefined);
  const errorId = generatedId ? `${generatedId}-error` : undefined;

  const [prefix, setPrefix] = useState('0414');
  const [number, setNumber] = useState('');

  // Sincronizar estado interno si cambia el value externo (ej. si viene de la DB o un form reset)
  useEffect(() => {
    if (value && value.startsWith('+58') && value.length > 3) {
      // value ej: +584141234567
      const withoutCountry = value.slice(3); // 4141234567
      const expectedPrefix = '0' + withoutCountry.slice(0, 3); // 0414
      const restNumber = withoutCountry.slice(3); // 1234567

      // Validar que el prefijo sea uno conocido de nuestra lista
      const isKnownPrefix = CARRIER_PREFIXES.some(group => group.codes.includes(expectedPrefix));
      
      if (isKnownPrefix) {
        setPrefix(expectedPrefix);
        setNumber(restNumber);
      }
    } else if (!value) {
      setNumber(''); // Limpiar si el valor se borró desde fuera
    }
  }, [value]);

  const handlePrefixChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPrefix = e.target.value;
    setPrefix(newPrefix);
    updateExternalValue(newPrefix, number);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Solo permitir números y máximo 7 caracteres
    const newNumber = e.target.value.replace(/\D/g, '').slice(0, 7);
    setNumber(newNumber);
    updateExternalValue(prefix, newNumber);
  };

  const updateExternalValue = (currentPrefix: string, currentNumber: string) => {
    if (onChange) {
      if (currentNumber.length === 0) {
        onChange(''); // Si está vacío, emitimos un string vacío para facilitar validaciones requeridas
      } else {
        // Formato E.164: +58 + (prefijo sin cero) + numero
        // Ejemplo: +58 414 1234567 -> +584141234567
        const prefixWithoutZero = currentPrefix.substring(1);
        onChange(`+58${prefixWithoutZero}${currentNumber}`);
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
        {/* Country Code (Fijo +58) */}
        <div className="relative flex-shrink-0">
          <div className={`
            flex items-center gap-1.5 h-11 bg-slate-50 border rounded-xl px-3 
            text-xs font-bold text-slate-800 shadow-inner cursor-not-allowed opacity-80
            ${error ? 'border-rose-400' : 'border-slate-300'}
          `}>
            <span>🇻🇪</span>
            <span>+58</span>
          </div>
        </div>

        {/* Prefix Selector */}
        <div className="relative flex-shrink-0">
          <select
            value={prefix}
            onChange={handlePrefixChange}
            aria-invalid={!!error}
            className={`
              appearance-none h-11 bg-slate-50 border rounded-xl text-xs font-bold text-slate-800 
              shadow-inner pr-8 pl-3 cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all
              ${error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-300'}
            `}
          >
            {CARRIER_PREFIXES.map((group) => (
              <optgroup key={group.group} label={group.group}>
                {group.codes.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <ChevronDown size={14} strokeWidth={3} />
          </div>
        </div>

        {/* Number Input */}
        <div className="relative flex-grow">
          <input
            id={generatedId}
            type="tel"
            placeholder="Número (7 dígitos)"
            value={number}
            onChange={handleNumberChange}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            className={`
              w-full h-11 bg-slate-50 border rounded-xl text-xs font-bold text-slate-800 
              placeholder:text-slate-400 shadow-inner px-4
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
