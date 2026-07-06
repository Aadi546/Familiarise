import {
  Bell, CalendarDays, ChevronRight, Download, ImagePlus,
  MessageCircle, Megaphone, Phone, ShieldCheck, UserRound
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMediaStatus } from '../api/media.js';
import { createReminder, fetchReminders } from '../api/reminders.js';
import { fetchPushPublicKey, savePushSubscription } from '../api/push.js';
import Avatar from '../components/Avatar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { usePWAInstall } from '../hooks/usePWAInstall.js';

const navItems = [
  { to: '/chat', icon: MessageCircle, label: 'Open Chat', desc: 'Send messages and media to everyone.' },
  { to: '/notices', icon: Megaphone, label: 'Noticeboard', desc: 'Read important family announcements.' },
  { to: '/calls', icon: Phone, label: 'Family Calls', desc: 'Start an audio or video call.' },
  { to: '/profile', icon: UserRound, label: 'Profile', desc: 'Update your photo and birthday.' }
];

function urlBase64ToUint8Array(value) {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  return new Uint8Array([...raw].map((c) => c.charCodeAt(0)));
}

export default function Home() {
  const { user, activeFamily } = useAuth();
  const { promptInstall, canInstall, isInstalled } = usePWAInstall();
  const [mediaStatus, setMediaStatus] = useState({ configured: false });
  const [reminders, setReminders] = useState([]);
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [notice, setNotice] = useState('');
  const isAdmin = activeFamily.role === 'admin';

  useEffect(() => {
    let alive = true;
    fetchMediaStatus()
      .then((s) => alive && setMediaStatus(s))
      .catch(() => {});
    fetchReminders(activeFamily.id, user.id)
      .then((d) => alive && setReminders(d.reminders || []))
      .catch(() => {});
    return () => { alive = false; };
  }, [activeFamily.id, user.id]);

  async function handleReminderSubmit(e) {
    e.preventDefault();
    if (!reminderTitle.trim() || !reminderDate) return;
    try {
      const data = await createReminder({
        familyId: activeFamily.id, authorId: user.id,
        title: reminderTitle.trim(), details: null, remindOn: reminderDate
      });
      setReminders((c) => [...c, data.reminder].sort((a, b) => a.remind_on.localeCompare(b.remind_on)));
      setReminderTitle('');
      setReminderDate('');
    } catch (err) { setNotice(err.message); }
  }

  async function enableNotifications() {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setNotice('Push notifications not supported in this browser.');
        return;
      }
      const config = await fetchPushPublicKey();
      if (!config.configured) { setNotice('VAPID keys not configured on backend.'); return; }
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') { setNotice('Permission not granted.'); return; }
      const reg = await navigator.serviceWorker.register('/push-sw.js');
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(config.publicKey)
      });
      await savePushSubscription({ userId: user.id, familyId: activeFamily.id, subscription: sub });
      setNotice('Push notifications enabled! ✅');
    } catch (err) { setNotice(err.message); }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 p-5 shadow-glow-teal text-white">
        <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/5" />
        <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/5" />
        <div className="relative flex items-center gap-4">
          <Avatar name={user.full_name} src={user.avatar_url} className="ring-2 ring-white/30" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-teal-100">Welcome back,</p>
            <h2 className="text-2xl font-black truncate">{user.full_name}</h2>
            <p className="text-sm font-medium text-teal-200 truncate">{activeFamily.name}</p>
          </div>
        </div>
      </div>

      {/* Install app nudge */}
      {canInstall && !isInstalled && (
        <button
          type="button"
          onClick={promptInstall}
          className="w-full card card-hover p-4 flex items-center gap-3 border-teal-200 dark:border-teal-900/60 text-left"
        >
          <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
            <Download size={20} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-900 dark:text-white text-sm">Install as App</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Tap to install on your home screen — no App Store needed.</p>
          </div>
          <ChevronRight size={18} className="text-slate-400 shrink-0" />
        </button>
      )}

      {/* Navigation cards */}
      <div className="grid grid-cols-2 gap-3">
        {navItems.map(({ to, icon: Icon, label, desc }) => (
          <Link
            key={to}
            to={to}
            className="card card-hover p-4 flex flex-col gap-3 group"
          >
            <div className="h-10 w-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform duration-200">
              <Icon size={22} />
            </div>
            <div>
              <p className="font-black text-slate-900 dark:text-white text-sm">{label}</p>
              <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400 leading-5">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {notice && (
        <div className="rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/50 px-4 py-3 text-sm font-medium text-amber-800 dark:text-amber-300 animate-slide-down">
          {notice}
        </div>
      )}

      {/* Reminders */}
      <div className="card p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <CalendarDays size={20} />
          </div>
          <div>
            <h3 className="font-black text-slate-900 dark:text-white text-sm">Birthdays & Reminders</h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Upcoming family dates</p>
          </div>
        </div>

        {isAdmin && (
          <form onSubmit={handleReminderSubmit} className="mb-4 flex flex-col sm:flex-row gap-2">
            <input
              value={reminderTitle}
              onChange={(e) => setReminderTitle(e.target.value)}
              className="input h-10 flex-1 text-sm"
              placeholder="Reminder title"
            />
            <input
              type="date"
              value={reminderDate}
              onChange={(e) => setReminderDate(e.target.value)}
              className="input h-10 text-sm"
            />
            <button className="btn-primary h-10 px-4 text-sm whitespace-nowrap">Add</button>
          </form>
        )}

        {reminders.length === 0 ? (
          <p className="text-sm font-medium text-slate-400 dark:text-slate-500">No upcoming reminders.</p>
        ) : (
          <div className="space-y-2">
            {reminders.map((r) => (
              <div key={r.id} className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 px-3 py-2.5">
                <div className="h-2 w-2 rounded-full bg-teal-500 shrink-0" />
                <p className="font-bold text-slate-900 dark:text-white text-sm flex-1 min-w-0 truncate">{r.title}</p>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 shrink-0">
                  {new Date(`${r.remind_on}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Media & Push cards */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="card p-4 flex items-start gap-3">
          <div className="h-9 w-9 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
            <ImagePlus size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-slate-900 dark:text-white text-sm">Photos & Videos</p>
            <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
              {mediaStatus.configured ? 'Connected & ready.' : 'R2 not connected yet.'}
            </p>
          </div>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${mediaStatus.configured ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'}`}>
            {mediaStatus.configured ? 'Ready' : 'Later'}
          </span>
        </div>

        <div className="card p-4 flex items-start gap-3">
          <div className="h-9 w-9 shrink-0 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <ShieldCheck size={18} />
          </div>
          <div>
            <p className="font-black text-slate-900 dark:text-white text-sm">Private Access</p>
            <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">Family-only PIN login.</p>
          </div>
        </div>
      </div>

      {/* Enable notifications */}
      <button
        type="button"
        onClick={enableNotifications}
        className="w-full card card-hover p-4 flex items-center justify-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200"
      >
        <Bell size={18} className="text-teal-600 dark:text-teal-400" />
        Enable Push Notifications
      </button>
    </div>
  );
}
