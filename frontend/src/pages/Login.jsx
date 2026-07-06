import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
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
      navigate(result.families.length > 1 ? '/family' : '/chat', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-family-50 px-4 py-10">
      <section className="w-full max-w-md rounded-lg bg-white p-6 shadow-soft">
        <div className="mb-8">
          <p className="text-base font-bold text-family-700">Private family space</p>
          <h1 className="mt-2 text-4xl font-black text-slate-950">Family Hub</h1>
          <p className="mt-3 text-lg leading-8 text-slate-600">Sign in with your name and 4-digit family PIN.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-base font-bold text-slate-800">Full name</span>
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="mt-2 h-14 w-full rounded-lg border border-slate-300 px-4 text-lg outline-none focus:border-family-700 focus:ring-4 focus:ring-family-100"
              placeholder="Jane Smith"
              autoComplete="name"
            />
          </label>

          <label className="block">
            <span className="text-base font-bold text-slate-800">4-digit PIN</span>
            <input
              value={pin}
              onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 4))}
              className="mt-2 h-14 w-full rounded-lg border border-slate-300 px-4 text-center text-2xl font-bold tracking-[0.3em] outline-none focus:border-family-700 focus:ring-4 focus:ring-family-100"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="1234"
            />
          </label>

          {error && <p className="rounded-lg bg-rose-50 px-4 py-3 text-base font-semibold text-rose-800">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting || !fullName.trim() || pin.length !== 4}
            className="min-h-14 w-full rounded-lg bg-family-700 px-5 py-3 text-lg font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSubmitting ? 'Signing in...' : 'Enter Family Hub'}
          </button>
        </form>
      </section>
    </main>
  );
}
