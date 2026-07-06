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
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-black text-slate-950">Calls</h2>
        <p className="mt-1 text-base font-semibold text-slate-500">Start a reliable family audio or video call.</p>
      </div>

      <div className="rounded-lg bg-family-700 p-5 text-white shadow-soft">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white/15">
            <Video size={30} />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-family-100">Powered by Jitsi</p>
            <h3 className="mt-1 text-2xl font-black">Family Call Room</h3>
            <p className="mt-3 text-base leading-7 text-family-50">
              This opens a shared Jitsi room for {activeFamily.name}. It avoids TURN setup and should work better on phones.
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={openCall}
        className="flex min-h-16 w-full items-center justify-center gap-3 rounded-lg bg-slate-950 px-5 text-lg font-black text-white"
      >
        <Phone size={24} />
        Join Family Call
        <ExternalLink size={22} />
      </button>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-family-100 text-family-900">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-950">How family should use it</h3>
            <p className="mt-1 text-base leading-7 text-slate-600">
              Tap the button, allow microphone/camera, then share the same room with family members from this app.
            </p>
          </div>
        </div>
      </div>

      <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm font-semibold leading-6 text-amber-900">
        Jitsi handles the call infrastructure. Your Family Hub app still handles chat, notices, reminders, and profiles.
      </p>
    </section>
  );
}
