import { Menu, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 backdrop-blur-md px-6 py-4 print:hidden">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-primary-700">
          <User size={18} />
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-slate-800 leading-tight">{user?.name}</p>
          <p className="text-xs text-slate-500 leading-tight">{user?.email}</p>
        </div>
      </div>
    </header>
  );
}
