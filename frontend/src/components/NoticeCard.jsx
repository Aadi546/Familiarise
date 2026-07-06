import { Pin, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Avatar from './Avatar.jsx';
import { formatDateTime } from '../utils/date.js';

const priorityConfig = {
  normal: {
    bar: 'bg-slate-300 dark:bg-slate-600',
    badge: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
  },
  important: {
    bar: 'bg-amber-400 dark:bg-amber-500',
    badge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300'
  },
  urgent: {
    bar: 'bg-rose-500 dark:bg-rose-600',
    badge: 'bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300'
  }
};

export default function NoticeCard({ notice, isAdmin, onDelete }) {
  const author = notice.users || {};
  const media = notice.media_files;
  const cfg = priorityConfig[notice.priority] || priorityConfig.normal;
  const [confirming, setConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirming) { setConfirming(true); return; }
    setIsDeleting(true);
    await onDelete?.(notice.id);
    setIsDeleting(false);
    setConfirming(false);
  }

  return (
    <article
      className={`card animate-slide-up overflow-hidden transition-all duration-200 ${
        notice.is_pinned ? 'ring-1 ring-teal-500/50 dark:ring-teal-400/40 shadow-glow-teal-sm' : ''
      }`}
    >
      {/* Priority bar */}
      <div className={`h-1 w-full ${cfg.bar}`} />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start gap-3">
          <Avatar name={author.full_name} src={author.avatar_url} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-bold text-slate-900 dark:text-white text-sm">{author.full_name}</span>
              {notice.is_pinned && (
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 dark:bg-teal-900/40 px-2 py-0.5 text-xs font-bold text-teal-700 dark:text-teal-300">
                  <Pin size={10} /> Pinned
                </span>
              )}
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold capitalize ${cfg.badge}`}>
                {notice.priority}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{formatDateTime(notice.created_at)}</p>
          </div>

          {/* Admin delete button */}
          {isAdmin && (
            <div className="flex items-center gap-1 shrink-0">
              {confirming && (
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 px-2 py-1"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200 ${
                  confirming
                    ? 'bg-rose-500 text-white hover:bg-rose-600 animate-bounce-in'
                    : 'text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20'
                }`}
                title={confirming ? 'Confirm delete' : 'Delete notice'}
              >
                {isDeleting ? (
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <Trash2 size={14} />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-800 dark:text-slate-200">{notice.content}</p>

        {/* Media */}
        {media?.public_url && media.file_type?.startsWith('image/') && (
          <img src={media.public_url} alt="" className="mt-4 max-h-80 w-full rounded-xl object-cover" loading="lazy" />
        )}
        {media?.public_url && media.file_type?.startsWith('video/') && (
          <video src={media.public_url} controls className="mt-4 max-h-80 w-full rounded-xl" />
        )}
      </div>
    </article>
  );
}
