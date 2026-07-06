import { LogOut, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Avatar from './Avatar.jsx';

export default function Header() {
  const { user, activeFamily, logout, families } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center gap-3">
        <Avatar name={user?.full_name} src={user?.avatar_url} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-500">{user?.full_name}</p>
          <h1 className="truncate text-xl font-bold text-slate-950">{activeFamily?.name || 'Family Hub'}</h1>
          {activeFamily?.role && <p className="text-xs font-bold uppercase tracking-wide text-family-700">{activeFamily.role}</p>}
        </div>
        {families.length > 1 && (
          <Link
            to="/family"
            className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 text-slate-700"
            aria-label="Switch family"
            title="Switch family"
          >
            <UsersRound size={22} />
          </Link>
        )}
        <button
          type="button"
          onClick={logout}
          className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-700"
          aria-label="Log out"
          title="Log out"
        >
          <LogOut size={22} />
        </button>
      </div>
    </header>
  );
}
