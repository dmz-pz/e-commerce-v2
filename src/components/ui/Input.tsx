import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-4 text-slate-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full h-11 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 
              placeholder:text-slate-400 shadow-inner
              focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all
              disabled:opacity-50 disabled:bg-slate-100 disabled:cursor-not-allowed
              ${leftIcon ? 'pl-11' : 'px-4'} 
              ${rightIcon ? 'pr-11' : 'px-4'}
              ${error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : ''}
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-4 text-slate-400 pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-[10px] font-bold text-rose-500 px-1 mt-0.5">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
