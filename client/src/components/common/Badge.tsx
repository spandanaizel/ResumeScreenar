import type { ReactNode } from 'react';

type BadgeTone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}

const toneClasses: Record<BadgeTone, string> = {
  primary: 'bg-primary-100 text-primary-800 border-primary-300',
  success: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  warning: 'bg-amber-100 text-amber-800 border-amber-300',
  danger: 'bg-red-100 text-red-800 border-red-300',
  neutral: 'bg-slate-100 text-slate-700 border-slate-300',
};

export default function Badge({ children, tone = 'neutral', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
