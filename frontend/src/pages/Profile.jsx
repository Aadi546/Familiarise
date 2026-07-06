import { useState } from 'react';
import { updateProfile } from '../api/users.js';
import Avatar from '../components/Avatar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Check } from 'lucide-react';

export default function Profile() {
  const { user, activeFamily, updateUser } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || '');
  const [birthday, setBirthday] = useState(user.birthday || '');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaved(false);
    setIsSaving(true);
    try {
      const data = await updateProfile({
        userId: user.id, familyId: activeFamily.id,
        avatarUrl: avatarUrl.trim() || null, birthday: birthday || null
      });
      updateUser(data.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="page-title">Profile</h2>
        <p className="page-subtitle">Update your photo and birthday.</p>
      </div>

      {/* Profile header card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 p-6 text-white">
        <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/5" />
        <div className="flex items-center gap-4">
          <Avatar name={user.full_name} src={avatarUrl || user.avatar_url} className="h-16 w-16 text-xl ring-3 ring-white/30" />
          <div>
            <h3 className="text-xl font-black">{user.full_name}</h3>
            <span className="inline-block mt-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold capitalize">
              {activeFamily.role}
            </span>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <form onSubmit={handleSubmit} className="card p-5 space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Profile Photo URL
          </label>
          <input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className="input h-11 w-full text-sm"
            placeholder="https://example.com/photo.jpg"
          />
          <p className="mt-1 text-xs font-medium text-slate-400 dark:text-slate-500">
            Paste a public image URL — Google Photos, Dropbox, etc.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Birthday
          </label>
          <input
            type="date"
            value={birthday || ''}
            onChange={(e) => setBirthday(e.target.value)}
            className="input h-11 w-full text-sm"
          />
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800/40 px-4 py-3 text-sm font-medium text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        {saved && (
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/40 px-4 py-3 text-sm font-medium text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-slide-down">
            <Check size={16} />
            Profile saved!
          </div>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="btn-primary w-full h-11 text-sm disabled:opacity-50 shadow-glow-teal-sm"
        >
          {isSaving ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Saving…
            </span>
          ) : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
