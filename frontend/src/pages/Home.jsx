import { ChevronRight, ImagePlus, Megaphone, MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMediaStatus } from '../api/media.js';
import Avatar from '../components/Avatar.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Home() {
  const { user, activeFamily } = useAuth();
  const [mediaStatus, setMediaStatus] = useState({ configured: false });

  useEffect(() => {
    let isMounted = true;

    fetchMediaStatus()
      .then((status) => {
        if (isMounted) {
          setMediaStatus(status);
        }
      })
      .catch(() => {
        if (isMounted) {
          setMediaStatus({ configured: false });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="space-y-5">
      <div className="rounded-lg bg-family-700 p-5 text-white shadow-soft">
        <div className="flex items-center gap-4">
          <Avatar name={user.full_name} src={user.avatar_url} className="bg-white text-family-900" />
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold text-family-100">Welcome, {user.full_name}</p>
            <h2 className="mt-1 truncate text-3xl font-black">{activeFamily.name}</h2>
          </div>
        </div>
        <p className="mt-4 text-lg leading-8 text-family-50">A private place for family messages and important updates.</p>
      </div>

      <div className="grid gap-3">
        <HomeAction
          to="/chat"
          icon={<MessageCircle size={26} />}
          title="Open Chat"
          description="Send quick messages to everyone in the family."
        />
        <HomeAction
          to="/notices"
          icon={<Megaphone size={26} />}
          title="Noticeboard"
          description="Read important updates and announcements."
        />
        <HomeAction
          to="/calls"
          icon={<Phone size={26} />}
          title="Family Calls"
          description="Start an audio or video call when people are online."
        />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <ImagePlus size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-black text-slate-950">Photos and Videos</h3>
            <p className="mt-1 text-base leading-7 text-slate-600">
              {mediaStatus.configured
                ? 'Media uploads are connected and ready.'
                : 'Media uploads are paused until Cloudflare R2 is connected.'}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-sm font-bold ${
              mediaStatus.configured ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
            }`}
          >
            {mediaStatus.configured ? 'Ready' : 'Later'}
          </span>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-family-100 text-family-900">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-950">Private Access</h3>
            <p className="mt-1 text-base leading-7 text-slate-600">
              Only the family members already added to the database can sign in with their name and PIN.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomeAction({ to, icon, title, description }) {
  return (
    <Link to={to} className="flex min-h-24 items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-family-100 text-family-900">{icon}</div>
      <div className="min-w-0 flex-1">
        <h3 className="text-xl font-black text-slate-950">{title}</h3>
        <p className="mt-1 text-base leading-6 text-slate-600">{description}</p>
      </div>
      <ChevronRight className="shrink-0 text-slate-400" size={24} />
    </Link>
  );
}
