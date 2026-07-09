import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
  size?: number;
}

export default function LoadingSpinner({ message, fullScreen = false, size = 32 }: LoadingSpinnerProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 text-slate-500">
      <Loader2 size={size} className="animate-spin text-primary-600" />
      {message && <p className="text-sm font-medium">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return <div className="flex min-h-screen w-full items-center justify-center bg-slate-50">{content}</div>;
  }

  return <div className="flex w-full items-center justify-center py-16">{content}</div>;
}
