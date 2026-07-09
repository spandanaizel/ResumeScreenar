import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSearch,
  History,
  LogOut,
  Target,
  X,
  Map,
  Puzzle,
  Briefcase,
  PlusSquare,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const candidateNavItems = [
  { to: '/candidate/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/candidate/analyze', label: 'Analyze Resume', icon: FileSearch },
  { to: '/candidate/history', label: 'History', icon: History },
  { to: '/candidate/roadmaps', label: 'Roadmaps', icon: Map },
  { to: '/candidate/skills', label: 'Skill Gaps', icon: Puzzle },
];

const recruiterNavItems = [
  { to: '/recruiter/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/recruiter/jobs', label: 'Jobs', icon: Briefcase },
  { to: '/recruiter/jobs/create', label: 'Post a Job', icon: PlusSquare },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { logout, user } = useAuth();
  const navItems = user?.role === 'recruiter' ? recruiterNavItems : candidateNavItems;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden print:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 print:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-accent-purple text-white shadow-sm">
              <Target size={20} />
            </div>
            <span className="text-lg font-extrabold text-slate-900">CareerFit AI</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-4">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 px-4 py-4">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
