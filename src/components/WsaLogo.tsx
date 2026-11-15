import React from 'react';

interface WsaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function WsaLogo({ className = '', size = 'md' }: WsaLogoProps) {
  const dimensions = {
    sm: 'h-8 w-auto',
    md: 'h-10 sm:h-11 w-auto',
    lg: 'h-13 w-auto',
  }[size];

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <svg
        viewBox="0 0 220 74"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={dimensions}
        aria-label="WSA Veículos"
      >
        {/* Aerodynamic Red Coupe Roofline Swoop */}
        <path
          d="M14 23.5C36 21.5 64 9.5 103 9.5C132 9.5 156 17.5 178 22.5C153 19.2 132 13.8 103 13.8C72 13.8 46 23.2 21 25.5C17 25.8 14.5 24.8 14 23.5Z"
          fill="#D91B22"
        />
        {/* Secondary Dynamic Beltline Swoop */}
        <path
          d="M95 16.2C112 24.8 152 22.2 204 27.5C184 22.8 146 19.6 116 18.2C107 17.8 99 16.5 95 16.2Z"
          fill="#D91B22"
        />
        <path
          d="M15 26.2C32 28.5 66 24.5 96 26.8C73 22.2 44 23.8 20 24.8L15 26.2Z"
          fill="#D91B22"
          opacity="0.92"
        />

        {/* Bold Geometric WSA Wordmark */}
        <text
          x="18"
          y="53"
          fill="#F5F5F7"
          fontFamily="var(--font-display), system-ui, sans-serif"
          fontWeight="800"
          fontSize="35"
          letterSpacing="2.5"
        >
          WSA
        </text>

        {/* Three Progressive Red Speed Blocks */}
        <rect x="20" y="59.5" width="28" height="9" rx="1" fill="#D91B22" />
        <rect x="51.5" y="59.5" width="13" height="9" rx="1" fill="#D91B22" />
        <rect x="68" y="59.5" width="5.5" height="9" rx="0.8" fill="#D91B22" />

        {/* Spaced VEÍCULOS Sub-wordmark */}
        <text
          x="79"
          y="67.8"
          fill="#E4E4E7"
          fontFamily="var(--font-display), system-ui, sans-serif"
          fontWeight="700"
          fontSize="11.2"
          letterSpacing="3.4"
        >
          VEÍCULOS
        </text>
      </svg>
    </div>
  );
}
