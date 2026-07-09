import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padded?: boolean;
}

export default function Card({ children, padded = true, className = '', ...rest }: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-soft border border-slate-100 ${padded ? 'p-6' : ''} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
