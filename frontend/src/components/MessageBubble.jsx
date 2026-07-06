import Avatar from './Avatar.jsx';
import { formatTime } from '../utils/date.js';

const EMOJI_MAP = {
  heart: '❤️',
  thumbs_up: '👍',
  laugh: '😂',
  pray: '🙏'
};

export default function MessageBubble({ message, isMine, onReact }) {
  const author = message.users || {};
  const media = message.media_files;
  const reactions = message.message_reactions || [];

  return (
    <div className={`flex gap-2.5 animate-slide-up ${isMine ? 'flex-row-reverse' : ''}`}>
      {!isMine && <Avatar name={author.full_name} src={author.avatar_url} className="mt-auto h-8 w-8 text-xs" />}

      <div className={`max-w-[78%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
        {/* Bubble */}
        <div
          className={`relative rounded-2xl px-4 py-3 ${
            isMine
              ? 'bg-teal-600 text-white rounded-br-md shadow-glow-teal-sm'
              : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-md'
          }`}
        >
          {!isMine && (
            <p className="mb-1 text-xs font-bold text-teal-600 dark:text-teal-400">
              {author.full_name}
            </p>
          )}

          {/* Media */}
          {media?.public_url && media.file_type?.startsWith('image/') && (
            <img
              src={media.public_url}
              alt=""
              className="mb-2 max-h-72 w-full rounded-xl object-cover"
              loading="lazy"
            />
          )}
          {media?.public_url && media.file_type?.startsWith('video/') && (
            <video src={media.public_url} controls className="mb-2 max-h-64 w-full rounded-xl" />
          )}
          {media?.public_url && media.file_type?.startsWith('audio/') && (
            <audio src={media.public_url} controls className="mb-2 w-full" />
          )}

          {message.content && (
            <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
          )}

          {/* Reaction badges */}
          {reactions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {Object.entries(
                reactions.reduce((acc, r) => {
                  acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                  return acc;
                }, {})
              ).map(([emoji, count]) => (
                <span
                  key={emoji}
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    isMine
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {EMOJI_MAP[emoji] || emoji} {count}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <p className={`mt-1 px-1 text-[10px] font-medium text-slate-400 dark:text-slate-500`}>
          {formatTime(message.created_at)}
        </p>

        {/* Reaction buttons */}
        <div className={`flex gap-1 mt-0.5 ${isMine ? 'flex-row-reverse' : ''}`}>
          {Object.entries(EMOJI_MAP).map(([key, emoji]) => (
            <button
              key={key}
              type="button"
              onClick={() => onReact?.(message.id, key)}
              className="rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2 py-0.5 text-xs transition-all duration-150 active:scale-110 select-none"
              title={key}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
