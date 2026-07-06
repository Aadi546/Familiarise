import Avatar from './Avatar.jsx';
import { formatDateTime } from '../utils/date.js';

const priorityStyles = {
  normal: 'bg-slate-100 text-slate-700',
  important: 'bg-amber-100 text-amber-900',
  urgent: 'bg-rose-100 text-rose-900'
};

export default function NoticeCard({ notice }) {
  const author = notice.users || {};
  const media = notice.media_files;

  return (
    <article className={`rounded-lg border bg-white p-4 shadow-sm ${notice.is_pinned ? 'border-family-600 ring-2 ring-family-100' : 'border-slate-200'}`}>
      <div className="flex items-start gap-3">
        <Avatar name={author.full_name} src={author.avatar_url} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-lg font-bold text-slate-950">{author.full_name}</h2>
            {notice.is_pinned && <span className="rounded-full bg-family-100 px-3 py-1 text-sm font-bold text-family-900">Pinned</span>}
            <span className={`rounded-full px-3 py-1 text-sm font-bold capitalize ${priorityStyles[notice.priority]}`}>
              {notice.priority}
            </span>
          </div>
          <p className="mt-1 text-sm font-semibold text-slate-500">{formatDateTime(notice.created_at)}</p>
        </div>
      </div>
      <p className="mt-4 whitespace-pre-wrap text-lg leading-8 text-slate-800">{notice.content}</p>
      {media?.public_url && media.file_type?.startsWith('image/') && (
        <img
          src={media.public_url}
          alt=""
          className="mt-4 max-h-96 w-full rounded-lg object-cover"
          loading="lazy"
        />
      )}
      {media?.public_url && media.file_type?.startsWith('video/') && (
        <video src={media.public_url} controls className="mt-4 max-h-96 w-full rounded-lg" />
      )}
    </article>
  );
}
