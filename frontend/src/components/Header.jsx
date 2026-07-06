import { LogOut, Moon, Sun, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import Avatar from './Avatar.jsx';

export default function Header() {
  const { user, activeFamily, logout, families } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-20 glass-header px-4 py-3">
      <div className="mx-auto flex max-w-2xl items-center gap-3">
        <Link to="/profile" aria-label="Open profile">
          <Avatar name={user?.full_name} src={user?.avatar_url} />
        </Link>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {user?.full_name}
          </p>
          <h1 className="truncate text-lg font-black text-slate-900 dark:text-white leading-tight">
            {activeFamily?.name || 'Familiarise'}
          </h1>
          {activeFamily?.role && (
            <span className="badge-teal">{activeFamily.role}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {families?.length > 1 && (
            <Link
              to="/family"
              className="btn-ghost flex h-10 w-10 items-center justify-center"
              aria-label="Switch family"
            >
              <UsersRound size={20} />
            </Link>
          )}

          <button
            type="button"
            onClick={toggleTheme}
            className="btn-ghost flex h-10 w-10 items-center justify-center"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun size={20} className="text-amber-400" />
            ) : (
              <Moon size={20} />
            )}
          </button>

          <button
            type="button"
            onClick={logout}
            className="btn-ghost flex h-10 w-10 items-center justify-center text-rose-500 dark:text-rose-400"
            aria-label="Log out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
