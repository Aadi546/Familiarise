import Avatar from './Avatar.jsx';
import { formatTime } from '../utils/date.js';

export default function MessageBubble({ message, isMine }) {
  const author = message.users || {};
  const media = message.media_files;

  return (
    <div className={`flex gap-3 ${isMine ? 'flex-row-reverse' : ''}`}>
      <Avatar name={author.full_name} src={author.avatar_url} className="mt-1" />
      <div className={`max-w-[78%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`rounded-lg px-4 py-3 shadow-sm ${
            isMine ? 'bg-family-700 text-white' : 'border border-slate-200 bg-white text-slate-950'
          }`}
        >
          {!isMine && <p className="mb-1 text-sm font-bold text-family-700">{author.full_name}</p>}
          {media?.public_url && media.file_type?.startsWith('image/') && (
            <img
              src={media.public_url}
              alt=""
              className="mb-3 max-h-80 w-full rounded-md object-cover"
              loading="lazy"
            />
          )}
          {media?.public_url && media.file_type?.startsWith('video/') && (
            <video src={media.public_url} controls className="mb-3 max-h-80 w-full rounded-md" />
          )}
          {message.content && <p className="whitespace-pre-wrap text-base leading-7">{message.content}</p>}
        </div>
        <p className="mt-1 px-1 text-sm font-medium text-slate-500">{formatTime(message.created_at)}</p>
      </div>
    </div>
  );
}
