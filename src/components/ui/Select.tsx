import React, { forwardRef } from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, leftIcon, className = '', children, id, ...props }, ref) => {
    const generatedId = id || (label ? `${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}-select` : undefined);
    const errorId = generatedId ? `${generatedId}-error` : undefined;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={generatedId} className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-4 text-slate-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <select
            id={generatedId}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            className={`
              w-full h-11 bg-slate-50 border rounded-xl text-xs font-bold text-slate-800 
              shadow-inner appearance-none cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all
              disabled:opacity-50 disabled:bg-slate-100 disabled:cursor-not-allowed
              ${leftIcon ? 'pl-11' : 'pl-4'} pr-10
              ${error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-300'}
              ${className}
            `}
            {...props}
          >
            {children}
          </select>
          {/* Custom chevron icon to override default browser appearance */}
          <div className="absolute right-4 pointer-events-none text-slate-400">
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.5 1.75L6 6.25L10.5 1.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        {error && (
          <p id={errorId} role="alert" className="text-[10px] font-bold text-rose-500 px-1 mt-0.5">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
