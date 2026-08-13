import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => {
  return (
    <img 
      src="/logo.webp" 
      alt="Minegocio Logo" 
      className={`${className} object-contain`}
    />
  );
};