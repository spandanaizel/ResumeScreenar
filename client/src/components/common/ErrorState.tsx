import { AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = 'Something went wrong',
  description = 'We could not complete your request. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 mb-4">
        <AlertTriangle size={28} />
      </div>
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-slate-500">{description}</p>
      {onRetry && (
        <div className="mt-6">
          <Button variant="outline" onClick={onRetry}>
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}
