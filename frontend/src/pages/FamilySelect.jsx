import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { Moon, Sun } from 'lucide-react';

export default function FamilySelect() {
  const { families, activeFamily, selectFamily, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  function chooseFamily(family) {
    selectFamily(family);
    navigate('/home', { replace: true });
  }

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 flex items-center justify-center px-4 py-12">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-teal-500/10 dark:bg-teal-500/5 blur-3xl" />
      </div>

      {/* Theme toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        className="absolute top-4 right-4 btn-ghost flex h-10 w-10 items-center justify-center"
      >
        {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
      </button>

      <div className="relative w-full max-w-sm animate-bounce-in">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Choose a Family</h1>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
            Select which family hub to enter.
          </p>
        </div>

        <div className="space-y-3">
          {families.map((family) => (
            <button
              key={family.id}
              type="button"
              onClick={() => chooseFamily(family)}
              className="card card-hover w-full flex items-center gap-4 p-4 text-left"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 text-white font-black text-lg shadow-glow-teal-sm">
                {family.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-black text-slate-900 dark:text-white truncate">{family.name}</p>
                <p className="text-xs font-semibold capitalize text-slate-400 dark:text-slate-500">{family.role}</p>
              </div>
              {activeFamily?.id === family.id ? (
                <Check size={20} className="text-teal-600 dark:text-teal-400 shrink-0" />
              ) : (
                <ChevronRight size={20} className="text-slate-300 dark:text-slate-600 shrink-0" />
              )}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={logout}
          className="mt-6 w-full btn-secondary py-2.5 text-sm"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
