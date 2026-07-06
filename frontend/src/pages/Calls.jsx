import { ExternalLink, Phone, ShieldCheck, Video } from 'lucide-react';
import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Calls() {
  const { user, activeFamily } = useAuth();

  const roomUrl = useMemo(() => {
    const slug = `${activeFamily.name}-family-call`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const params = new URLSearchParams({
      'userInfo.displayName': user.full_name,
      'config.prejoinPageEnabled': 'true'
    });
    return `https://meet.jit.si/${slug}#${params.toString()}`;
  }, [activeFamily.name, user.full_name]);

  function openCall() {
    window.open(roomUrl, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="page-title">Family Calls</h2>
        <p className="page-subtitle">Start a video or audio call, instantly.</p>
      </div>

      {/* Hero call card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 to-teal-900 p-6 text-white shadow-glow-teal">
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5" />
        <div className="relative flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
            <Video size={28} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-teal-200">Powered by Jitsi</p>
            <h3 className="mt-1 text-2xl font-black">Family Call Room</h3>
            <p className="mt-2 text-sm font-medium text-teal-100 leading-6">
              Opens a private call room for <strong>{activeFamily.name}</strong>. Works on any device, no accounts needed.
            </p>
          </div>
        </div>
      </div>

      {/* Join button */}
      <button
        type="button"
        onClick={openCall}
        className="w-full flex items-center justify-center gap-3 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-black py-4 text-base transition-all duration-200 active:scale-[0.98] animate-glow shadow-glow-teal"
      >
        <Phone size={22} />
        Join Family Call
        <ExternalLink size={18} className="opacity-60" />
      </button>

      {/* Instructions */}
      <div className="card p-4 flex gap-3">
        <div className="h-10 w-10 shrink-0 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h3 className="font-black text-slate-900 dark:text-white text-sm">How to use</h3>
          <ol className="mt-2 space-y-1.5">
            {[
              'Tap "Join Family Call" to open the room.',
              'Allow microphone and camera access.',
              'Share the same room URL with family members.'
            ].map((step, i) => (
              <li key={i} className="flex gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                <span className="shrink-0 h-4 w-4 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 text-[9px] font-black flex items-center justify-center">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <p className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 px-4 py-3 text-xs font-medium text-amber-800 dark:text-amber-300 leading-6">
        Calls are handled by Jitsi's infrastructure. Your chat, notices, and reminders remain in Familiarise.
      </p>
    </div>
  );
}
