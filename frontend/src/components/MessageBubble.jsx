import Avatar from './Avatar.jsx';
import { formatTime } from '../utils/date.js';

export default function MessageBubble({ message, isMine, onReact }) {
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
          {media?.public_url && media.file_type?.startsWith('audio/') && (
            <audio src={media.public_url} controls className="mb-3 w-full" />
          )}
          {message.content && <p className="whitespace-pre-wrap text-base leading-7">{message.content}</p>}
          <MessageReactions reactions={message.message_reactions || []} />
        </div>
        <p className="mt-1 px-1 text-sm font-medium text-slate-500">{formatTime(message.created_at)}</p>
        <div className={`mt-1 flex gap-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
          {[
            ['heart', 'Love'],
            ['thumbs_up', 'Like'],
            ['laugh', 'Laugh'],
            ['pray', 'Pray']
          ].map(([emoji, label]) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onReact?.(message.id, emoji)}
              className="rounded-full bg-slate-100 px-2 py-1 text-xs font-black text-slate-700"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MessageReactions({ reactions }) {
  if (!reactions.length) {
    return null;
  }

  const labels = {
    heart: 'Love',
    thumbs_up: 'Like',
    laugh: 'Laugh',
    pray: 'Pray'
  };

  const counts = reactions.reduce((acc, reaction) => {
    acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {Object.entries(counts).map(([emoji, count]) => (
        <span key={emoji} className="rounded-full bg-white/80 px-2 py-1 text-xs font-black text-slate-700">
          {labels[emoji]} {count}
        </span>
      ))}
    </div>
  );
}
