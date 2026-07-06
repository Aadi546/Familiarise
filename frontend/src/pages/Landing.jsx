import { Link } from 'react-router-dom';
import { Moon, Sun, MessageCircle, Megaphone, Phone, CalendarDays, Download, Share, MoreHorizontal } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { usePWAInstall } from '../hooks/usePWAInstall.js';

const features = [
  {
    icon: MessageCircle,
    title: 'Family Chat',
    desc: 'Send messages, photos, voice notes, and react with emojis in your private family room.',
    color: 'from-teal-500 to-teal-700'
  },
  {
    icon: Megaphone,
    title: 'Noticeboard',
    desc: 'Admins can post pinned announcements with urgent, important, or normal priorities.',
    color: 'from-cyan-500 to-teal-600'
  },
  {
    icon: Phone,
    title: 'Video & Audio Calls',
    desc: 'Start an instant family video or audio call—no accounts needed, powered by Jitsi.',
    color: 'from-teal-600 to-emerald-600'
  },
  {
    icon: CalendarDays,
    title: 'Reminders',
    desc: 'Track birthdays and upcoming family dates so no one misses an important moment.',
    color: 'from-emerald-500 to-teal-600'
  }
];

export default function Landing() {
  const { theme, toggleTheme } = useTheme();
  const { promptInstall, canInstall, showIOSInstructions, isInstalled } = usePWAInstall();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Nav */}
      <nav className="sticky top-0 z-20 glass-header px-4 sm:px-8 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 shadow-glow-teal-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <span className="text-lg font-black text-slate-900 dark:text-white">Familiarise</span>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="btn-ghost flex h-9 w-9 items-center justify-center">
              {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            </button>
            <Link to="/login" className="btn-primary px-4 py-2 text-sm">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-20 pb-24 text-center">
        {/* Glow blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-teal-500/10 dark:bg-teal-500/8 blur-3xl" />
          <div className="absolute top-32 left-1/4 h-48 w-48 rounded-full bg-cyan-400/10 dark:bg-cyan-400/6 blur-2xl" />
          <div className="absolute top-20 right-1/4 h-64 w-64 rounded-full bg-emerald-500/8 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-2xl">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200 dark:border-teal-800/60 bg-teal-50 dark:bg-teal-900/30 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse-slow" />
            <span className="text-xs font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wider">
              Private · Family Only · No Ads
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
            Your family,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-500">
              together
            </span>
          </h1>

          <p className="mt-5 text-lg font-medium text-slate-600 dark:text-slate-400 leading-8 max-w-lg mx-auto">
            A private space for your family to chat, share updates, schedule reminders, and video call — without social media.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/login"
              className="btn-primary px-8 py-3.5 text-base shadow-glow-teal"
            >
              Enter Family Hub →
            </Link>
            {canInstall && !isInstalled && (
              <button
                type="button"
                onClick={promptInstall}
                className="btn-secondary px-8 py-3.5 text-base flex items-center justify-center gap-2"
              >
                <Download size={18} />
                Install App
              </button>
            )}
          </div>
        </div>

        {/* Floating card mockup */}
        <div className="relative mx-auto mt-16 max-w-sm animate-float">
          <div className="card shadow-soft overflow-hidden">
            <div className="bg-gradient-to-br from-teal-600 to-teal-800 px-4 py-3 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">A</div>
              <div>
                <p className="text-xs font-bold text-teal-100">Our Family</p>
                <p className="text-sm font-black text-white">4 members online</p>
              </div>
            </div>
            <div className="p-4 space-y-3 bg-white dark:bg-slate-900">
              <div className="flex gap-2">
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-teal-400 to-teal-700 shrink-0 mt-1" />
                <div className="rounded-2xl rounded-bl-md bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 max-w-[75%]">
                  Good morning everyone! ☀️
                </div>
              </div>
              <div className="flex gap-2 flex-row-reverse">
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-700 shrink-0 mt-1" />
                <div className="rounded-2xl rounded-br-md bg-teal-600 px-3 py-2 text-xs font-medium text-white max-w-[75%]">
                  Morning! ❤️ See you at dinner!
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-cyan-400 to-teal-700 shrink-0 mt-1" />
                <div className="rounded-2xl rounded-bl-md bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 max-w-[75%]">
                  Don't forget Dadi's birthday on Thursday! 🎂
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 bg-white dark:bg-slate-900/50">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Everything your family needs</h2>
            <p className="mt-2 text-base font-medium text-slate-500 dark:text-slate-400">
              Private by design. No accounts for family members to manage.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="card card-hover p-5 flex gap-4">
                <div className={`h-12 w-12 shrink-0 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-glow-teal-sm`}>
                  <Icon size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white">{title}</h3>
                  <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400 leading-6">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Install Section */}
      <section className="px-4 py-16" id="install">
        <div className="mx-auto max-w-2xl">
          <div className="text-center mb-10">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 shadow-glow-teal mx-auto">
              <Download size={26} className="text-white" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">
              Install as an App
            </h2>
            <p className="mt-2 text-base font-medium text-slate-500 dark:text-slate-400">
              No app store required. Install directly from your browser for a native app experience.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Android / Desktop */}
            <div className="card p-5">
              <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <span className="text-xl">🤖</span> Android & Desktop
              </h3>
              <ol className="space-y-3">
                {[
                  'Open Familiarise in Chrome.',
                  'Tap the three-dot menu ⋮ (top right).',
                  'Select "Add to Home Screen" or "Install App".',
                  'Tap "Install" to confirm.'
                ].map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                    <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/50 text-xs font-black text-teal-700 dark:text-teal-300">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
              {canInstall && !showIOSInstructions && !isInstalled && (
                <button
                  type="button"
                  onClick={promptInstall}
                  className="btn-primary mt-4 w-full py-2.5 text-sm flex items-center justify-center gap-2 shadow-glow-teal-sm"
                >
                  <Download size={16} />
                  Install Now
                </button>
              )}
            </div>

            {/* iOS */}
            <div className="card p-5">
              <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <span className="text-xl">🍎</span> iPhone & iPad
              </h3>
              <ol className="space-y-3">
                {[
                  'Open this page in Safari.',
                  <>Tap the <Share size={13} className="inline text-teal-600" /> Share button at the bottom.</>,
                  'Scroll down and tap "Add to Home Screen".',
                  'Tap "Add" in the top right.'
                ].map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                    <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/50 text-xs font-black text-teal-700 dark:text-teal-300">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-xs font-medium text-slate-400 dark:text-slate-500">
                Once installed, the app opens full screen without the Safari toolbar.
              </p>
            </div>
          </div>

          {isInstalled && (
            <div className="mt-6 card p-4 flex items-center gap-3 border-teal-300 dark:border-teal-800">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">Already installed!</p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  You're running Familiarise as an app.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 px-4 py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-teal-700">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span className="font-black text-slate-900 dark:text-white">Familiarise</span>
        </div>
        <p className="text-xs font-medium text-slate-400 dark:text-slate-600">
          A private space for your family. No ads, no tracking.
        </p>
        <Link to="/login" className="mt-4 inline-block text-sm font-bold text-teal-600 dark:text-teal-400 hover:underline">
          Enter Family Hub →
        </Link>
      </footer>
    </div>
  );
}
