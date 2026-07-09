import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Target } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { homeRouteForRole } from '../../components/layout/ProtectedRoute';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import type { ApiErrorResponse } from '../../types';

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    const nextErrors: FormErrors = {};
    if (!email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Enter a valid email address';
    }
    if (!password) {
      nextErrors.password = 'Password is required';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const loggedInUser = await login(email.trim(), password);
      toast.success('Welcome back!');
      navigate(homeRouteForRole(loggedInUser.role));
    } catch (err) {
      const message = axios.isAxiosError<ApiErrorResponse>(err)
        ? err.response?.data?.message
        : undefined;
      toast.error(message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-gradient-to-br from-slate-50 via-white to-primary-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-accent-purple text-white shadow-md mb-4">
            <Target size={24} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Welcome back</h1>
          <p className="mt-1.5 text-sm text-slate-500">Log in to continue analyzing your resume.</p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="jane@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              autoComplete="email"
            />
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              autoComplete="current-password"
            />

            <Button type="submit" fullWidth isLoading={isSubmitting} size="lg">
              {isSubmitting ? 'Logging in...' : 'Log In'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
