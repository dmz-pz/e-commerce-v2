import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => {
  return (
    <svg 
      className={className}
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}
    >
      {/* Outer focus Ring (Dark Blue) */}
      <circle cx="50" cy="50" r="48" fill="#003399" />
      
      {/* Background Yellow Circle */}
      <circle cx="50" cy="50" r="42" fill="#FFC107" />
      
      {/* The 'm' cart symbol - Perfectly centered */}
      <g stroke="#003399">
        {/* Handle */}
        <path 
          d="M22 38 H28" 
          strokeWidth="9" 
          strokeLinecap="round" 
        />
        
        {/* Styled 'm' Body */}
        <path 
          d="M28 38 L33 58 M33 46 C33 38 43 36 48 42 L52 58 M52 46 C52 38 62 36 67 42 L72 58" 
          strokeWidth="11" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        
        {/* Base Chassis Bar */}
        <path 
          d="M20 58 H80" 
          strokeWidth="10" 
          strokeLinecap="round" 
        />
        
        {/* Cart Wheels */}
        <circle cx="33" cy="70" r="7" fill="#003399" stroke="none" />
        <circle cx="67" cy="70" r="7" fill="#003399" stroke="none" />
      </g>
    </svg>
  );
};
