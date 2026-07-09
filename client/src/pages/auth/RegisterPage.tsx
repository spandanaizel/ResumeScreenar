import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Target, GraduationCap, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { homeRouteForRole } from '../../components/layout/ProtectedRoute';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import type { ApiErrorResponse, UserRole } from '../../types';
import axios from 'axios';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('candidate');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    const nextErrors: FormErrors = {};
    if (!name.trim()) nextErrors.name = 'Name is required';

    if (!email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Enter a valid email address';
    }

    if (!password) {
      nextErrors.password = 'Password is required';
    } else if (password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const newUser = await register(name.trim(), email.trim(), password, role);
      toast.success('Account created successfully!');
      navigate(homeRouteForRole(newUser.role));
    } catch (err) {
      const message = axios.isAxiosError<ApiErrorResponse>(err)
        ? err.response?.data?.message
        : undefined;
      toast.error(message || 'Registration failed. Please try again.');
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
          <h1 className="text-2xl font-extrabold text-slate-900">Create your account</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Start analyzing your resume against real job descriptions.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('candidate')}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
                    role === 'candidate'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <GraduationCap size={16} />
                  Candidate
                </button>
                <button
                  type="button"
                  onClick={() => setRole('recruiter')}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
                    role === 'recruiter'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Briefcase size={16} />
                  Recruiter
                </button>
              </div>
            </div>

            <Input
              label="Full Name"
              name="name"
              type="text"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              autoComplete="name"
            />
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
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              autoComplete="new-password"
            />

            <Button type="submit" fullWidth isLoading={isSubmitting} size="lg">
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
