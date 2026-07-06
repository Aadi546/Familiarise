import { Bell, CalendarDays, ChevronRight, ImagePlus, Megaphone, MessageCircle, Phone, ShieldCheck, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMediaStatus } from '../api/media.js';
import { createReminder, fetchReminders } from '../api/reminders.js';
import { fetchPushPublicKey, savePushSubscription } from '../api/push.js';
import Avatar from '../components/Avatar.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Home() {
  const { user, activeFamily } = useAuth();
  const [mediaStatus, setMediaStatus] = useState({ configured: false });
  const [reminders, setReminders] = useState([]);
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [notice, setNotice] = useState('');
  const isAdmin = activeFamily.role === 'admin';

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

    fetchReminders(activeFamily.id, user.id)
      .then((data) => {
        if (isMounted) {
          setReminders(data.reminders || []);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [activeFamily.id, user.id]);

  async function handleReminderSubmit(event) {
    event.preventDefault();

    if (!reminderTitle.trim() || !reminderDate) {
      return;
    }

    try {
      const data = await createReminder({
        familyId: activeFamily.id,
        authorId: user.id,
        title: reminderTitle.trim(),
        details: null,
        remindOn: reminderDate
      });

      setReminders((current) => [...current, data.reminder].sort((a, b) => a.remind_on.localeCompare(b.remind_on)));
      setReminderTitle('');
      setReminderDate('');
    } catch (err) {
      setNotice(err.message);
    }
  }

  async function enableNotifications() {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setNotice('Push notifications are not supported in this browser.');
        return;
      }

      const config = await fetchPushPublicKey();

      if (!config.configured) {
        setNotice('Push notifications need VAPID keys configured on the backend.');
        return;
      }

      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        setNotice('Notification permission was not granted.');
        return;
      }

      const registration = await navigator.serviceWorker.register('/push-sw.js');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(config.publicKey)
      });

      await savePushSubscription({ userId: user.id, familyId: activeFamily.id, subscription });
      setNotice('Push notifications enabled.');
    } catch (err) {
      setNotice(err.message);
    }
  }

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
        <HomeAction
          to="/profile"
          icon={<UserRound size={26} />}
          title="Profile"
          description="Add your photo and birthday."
        />
      </div>

      {notice && <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">{notice}</p>}

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-family-100 text-family-900">
            <CalendarDays size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-950">Birthdays and Reminders</h3>
            <p className="text-sm font-semibold text-slate-500">Upcoming family dates.</p>
          </div>
        </div>

        {isAdmin && (
          <form onSubmit={handleReminderSubmit} className="mb-4 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
            <input
              value={reminderTitle}
              onChange={(event) => setReminderTitle(event.target.value)}
              className="h-12 rounded-lg border border-slate-300 px-4 text-base outline-none focus:border-family-700 focus:ring-4 focus:ring-family-100"
              placeholder="Reminder title"
            />
            <input
              type="date"
              value={reminderDate}
              onChange={(event) => setReminderDate(event.target.value)}
              className="h-12 rounded-lg border border-slate-300 px-4 text-base outline-none focus:border-family-700 focus:ring-4 focus:ring-family-100"
            />
            <button className="min-h-12 rounded-lg bg-family-700 px-5 text-base font-black text-white">Add</button>
          </form>
        )}

        {reminders.length === 0 ? (
          <p className="text-base font-semibold text-slate-500">No upcoming reminders yet.</p>
        ) : (
          <div className="space-y-2">
            {reminders.map((reminder) => (
              <div key={reminder.id} className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="font-black text-slate-950">{reminder.title}</p>
                <p className="text-sm font-semibold text-slate-500">{new Date(`${reminder.remind_on}T00:00:00`).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
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

      <button
        type="button"
        onClick={enableNotifications}
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-base font-black text-slate-800 shadow-sm"
      >
        <Bell size={22} />
        Enable Notifications
      </button>
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

function urlBase64ToUint8Array(value) {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);

  for (let index = 0; index < raw.length; index += 1) {
    output[index] = raw.charCodeAt(index);
  }

  return output;
}
