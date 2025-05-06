// src/components/icons/CreditIcon.tsx
import React from 'react';

interface CreditIconProps extends React.SVGProps<SVGSVGElement> {}

export default function CreditIcon(props: CreditIconProps) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* coin/credit icon */}
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
      <path
        d="M8 12a4 4 0 014-4v8a4 4 0 01-4-4z"
        fill="currentColor"
      />
    </svg>
  );
}
