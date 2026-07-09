import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 mb-6">
        <Compass size={28} />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900">404</h1>
      <p className="mt-2 text-slate-500">The page you're looking for doesn't exist.</p>
      <Link to="/" className="mt-6">
        <Button>Back to Home</Button>
      </Link>
    </div>
  );
}
