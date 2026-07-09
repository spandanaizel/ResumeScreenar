import { Link, Outlet } from 'react-router-dom';
import { Target } from 'lucide-react';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-accent-purple text-white shadow-sm">
              <Target size={20} />
            </div>
            <span className="text-lg font-extrabold text-slate-900">CareerFit AI</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:text-primary-700 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 hover:shadow-md transition-all"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} CareerFit AI. Built as a final-year CSE project.
        </div>
      </footer>
    </div>
  );
}
