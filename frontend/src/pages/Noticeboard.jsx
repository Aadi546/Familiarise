import { ImagePlus, Pin, SendHorizontal, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchMediaStatus, uploadMedia } from '../api/media.js';
import { createNotice, deleteNotice, fetchNotices } from '../api/notices.js';
import EmptyState from '../components/EmptyState.jsx';
import LoadingState from '../components/LoadingState.jsx';
import NoticeCard from '../components/NoticeCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Noticeboard() {
  const { user, activeFamily } = useAuth();
  const [notices, setNotices] = useState([]);
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('normal');
  const [isPinned, setIsPinned] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [mediaStatus, setMediaStatus] = useState({ configured: false });
  const [error, setError] = useState('');
  const isAdmin = activeFamily.role === 'admin';

  useEffect(() => {
    let alive = true;
    async function load() {
      setIsLoading(true);
      setError('');
      try {
        const data = await fetchNotices(activeFamily.id, user.id);
        if (alive) setNotices(data.notices);
      } catch (err) {
        if (alive) setError(err.message);
      } finally {
        if (alive) setIsLoading(false);
      }
    }
    load();
    fetchMediaStatus().then((s) => alive && setMediaStatus(s)).catch(() => {});
    return () => { alive = false; };
  }, [activeFamily.id, user.id]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim()) return;
    setIsPosting(true);
    setError('');
    try {
      let mediaFileId = null;
      if (selectedFile) {
        const mf = await uploadMedia({ file: selectedFile, familyId: activeFamily.id, userId: user.id });
        mediaFileId = mf.id;
      }
      const data = await createNotice({ familyId: activeFamily.id, authorId: user.id, content: content.trim(), priority, isPinned, mediaFileId });
      setNotices((c) => [data.notice, ...c]);
      setContent('');
      setPriority('normal');
      setIsPinned(false);
      setSelectedFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsPosting(false);
    }
  }

  async function handleDelete(noticeId) {
    try {
      await deleteNotice({ noticeId, userId: user.id });
      setNotices((c) => c.filter((n) => n.id !== noticeId));
    } catch (err) {
      setError(err.message);
    }
  }

  const priorityOptions = [
    { value: 'normal', label: 'Normal', class: 'btn-secondary' },
    { value: 'important', label: '⚡ Important', class: 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800/40 rounded-xl font-semibold transition-all duration-200' },
    { value: 'urgent', label: '🚨 Urgent', class: 'bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-800/40 rounded-xl font-semibold transition-all duration-200' }
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="page-title">Noticeboard</h2>
        <p className="page-subtitle">Important updates for {activeFamily.name}.</p>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800/40 px-4 py-3 text-sm font-medium text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      {/* Post notice form (admin only) */}
      {isAdmin && (
        <form onSubmit={handleSubmit} className="card p-4 space-y-3">
          <h3 className="font-black text-slate-900 dark:text-white text-sm">Post a Notice</h3>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="input w-full resize-none py-3 text-sm"
            placeholder="Share an important family update…"
          />

          {/* Priority selector */}
          <div className="flex gap-2 flex-wrap">
            {priorityOptions.map(({ value, label, class: cls }) => (
              <button
                key={value}
                type="button"
                onClick={() => setPriority(value)}
                className={`px-3 py-1.5 text-xs transition-all duration-200 ${cls} ${priority === value ? 'ring-2 ring-teal-500 dark:ring-teal-400' : ''}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Pin toggle */}
            <button
              type="button"
              onClick={() => setIsPinned((p) => !p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                isPinned
                  ? 'bg-teal-600 text-white shadow-glow-teal-sm'
                  : 'btn-secondary'
              }`}
            >
              <Pin size={13} />
              {isPinned ? 'Pinned' : 'Pin Notice'}
            </button>

            {/* Media attach */}
            <label
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                mediaStatus.configured ? 'btn-secondary cursor-pointer' : 'cursor-not-allowed text-slate-300 dark:text-slate-600'
              }`}
            >
              <ImagePlus size={13} />
              Add Media
              <input type="file" accept="image/*,video/*" className="sr-only" disabled={!mediaStatus.configured} onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPosting || !content.trim()}
              className="btn-primary ml-auto flex items-center gap-1.5 px-4 py-1.5 text-xs disabled:opacity-50"
            >
              <SendHorizontal size={13} />
              Post
            </button>
          </div>

          {selectedFile && (
            <div className="flex items-center justify-between gap-3 rounded-xl bg-teal-50 dark:bg-teal-900/30 px-3 py-2 border border-teal-200 dark:border-teal-800/40">
              <p className="truncate text-xs font-semibold text-teal-700 dark:text-teal-300">{selectedFile.name}</p>
              <button type="button" onClick={() => setSelectedFile(null)} className="btn-ghost flex h-6 w-6 items-center justify-center shrink-0">
                <X size={14} />
              </button>
            </div>
          )}
        </form>
      )}

      {/* Notices list */}
      <div className="space-y-3">
        {isLoading ? (
          <LoadingState label="Loading notices" />
        ) : notices.length === 0 ? (
          <EmptyState title="No notices yet" message="Important family announcements will appear here." />
        ) : (
          notices.map((n) => (
            <NoticeCard key={n.id} notice={n} isAdmin={isAdmin} onDelete={handleDelete} />
          ))
        )}
      </div>
    </div>
  );
}
