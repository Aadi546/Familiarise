import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { Moon, Sun } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const result = await login(fullName, pin);
      navigate(result.families.length > 1 ? '/family' : '/home', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 transition-colors duration-300">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-teal-500/10 dark:bg-teal-500/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-cyan-500/10 dark:bg-cyan-500/5 blur-3xl" />
      </div>

      {/* Theme toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        className="absolute top-4 right-4 btn-ghost flex h-10 w-10 items-center justify-center"
      >
        {theme === 'dark' ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
      </button>

      <div className="relative w-full max-w-sm animate-bounce-in">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 shadow-glow-teal">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Familiarise</h1>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
            Sign in with your name and family PIN
          </p>
        </div>

        {/* Card */}
        <div className="card p-6 shadow-soft">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Full Name
              </label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input h-12 w-full text-base"
                placeholder="e.g. Priya Sharma"
                autoComplete="name"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                4-Digit PIN
              </label>
              <input
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="input h-12 w-full text-center text-2xl font-black tracking-[0.4em]"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="••••"
                required
              />
            </div>

            {error && (
              <div className="rounded-xl bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800/50 px-4 py-3 text-sm font-medium text-rose-700 dark:text-rose-300 animate-slide-down">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !fullName.trim() || pin.length !== 4}
              className="btn-primary w-full h-12 text-sm disabled:cursor-not-allowed disabled:opacity-50 shadow-glow-teal-sm"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                'Enter Family Hub'
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs font-medium text-slate-400 dark:text-slate-600">
          <Link to="/" className="text-teal-600 dark:text-teal-400 hover:underline">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
