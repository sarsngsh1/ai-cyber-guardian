import React from 'react';

interface ShieldLogoProps {
  className?: string;
  size?: number;
}

export const ShieldLogo: React.FC<ShieldLogoProps> = ({
  className = '',
  size = 40,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="shieldBodyGrad" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0F2547" />
          <stop offset="100%" stopColor="#071326" />
        </linearGradient>
        <linearGradient id="cyanEdgeGrad" x1="12" y1="8" x2="52" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
      </defs>
      {/* Outer protective shield silhouette */}
      <path
        d="M32 5L10 13.5V30.5C10 44.8 19.6 56.4 32 60C44.4 56.4 54 44.8 54 30.5V13.5L32 5Z"
        fill="url(#shieldBodyGrad)"
        stroke="url(#cyanEdgeGrad)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Inner geometric guardian frame */}
      <path
        d="M32 11.5L16 17.8V30.2C16 40.9 22.9 49.8 32 53C41.1 49.8 48 40.9 48 30.2V17.8L32 11.5Z"
        fill="#0A1B36"
        stroke="#22D3EE"
        strokeOpacity="0.35"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      {/* Cyber node & check core */}
      <path
        d="M23.5 32.5L29.2 38.2L41 25.5"
        stroke="#22D3EE"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="18.5" r="2.2" fill="#38BDF8" />
    </svg>
  );
};
