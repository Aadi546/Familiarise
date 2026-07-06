import { useState } from 'react';
import { updateProfile } from '../api/users.js';
import Avatar from '../components/Avatar.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Profile() {
  const { user, activeFamily, updateUser } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || '');
  const [birthday, setBirthday] = useState(user.birthday || '');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSaved(false);
    setIsSaving(true);

    try {
      const data = await updateProfile({
        userId: user.id,
        familyId: activeFamily.id,
        avatarUrl: avatarUrl.trim() || null,
        birthday: birthday || null
      });
      updateUser(data.user);
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-black text-slate-950">Profile</h2>
        <p className="mt-1 text-base font-semibold text-slate-500">Update your photo and birthday.</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-5 flex items-center gap-4">
          <Avatar name={user.full_name} src={avatarUrl} className="h-16 w-16 text-xl" />
          <div>
            <h3 className="text-xl font-black text-slate-950">{user.full_name}</h3>
            <p className="text-sm font-bold uppercase tracking-wide text-family-700">{activeFamily.role}</p>
          </div>
        </div>

        <label className="block">
          <span className="text-base font-bold text-slate-800">Profile photo URL</span>
          <input
            value={avatarUrl}
            onChange={(event) => setAvatarUrl(event.target.value)}
            className="mt-2 h-12 w-full rounded-lg border border-slate-300 px-4 text-base outline-none focus:border-family-700 focus:ring-4 focus:ring-family-100"
            placeholder="https://example.com/photo.jpg"
          />
        </label>

        <label className="mt-4 block">
          <span className="text-base font-bold text-slate-800">Birthday</span>
          <input
            type="date"
            value={birthday || ''}
            onChange={(event) => setBirthday(event.target.value)}
            className="mt-2 h-12 w-full rounded-lg border border-slate-300 px-4 text-base outline-none focus:border-family-700 focus:ring-4 focus:ring-family-100"
          />
        </label>

        {error && <p className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-base font-semibold text-rose-800">{error}</p>}
        {saved && <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-base font-semibold text-emerald-900">Profile saved.</p>}

        <button
          type="submit"
          disabled={isSaving}
          className="mt-5 min-h-12 w-full rounded-lg bg-family-700 px-5 py-3 text-base font-black text-white disabled:bg-slate-300"
        >
          {isSaving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </section>
  );
}
