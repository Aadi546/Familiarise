import { initials } from '../utils/people.js';

export default function Avatar({ name, src, className = '', online = false }) {
  return (
    <div className="relative shrink-0 inline-flex">
      <div
        className={`flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-teal-400 to-teal-700 text-sm font-bold text-white ring-2 ring-white dark:ring-slate-900 shadow-sm ${className}`}
      >
        {src ? (
          <img src={src} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="select-none">{initials(name)}</span>
        )}
      </div>
      {online && (
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-900 animate-pulse-slow" />
      )}
    </div>
  );
}
