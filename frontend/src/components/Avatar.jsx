import { initials } from '../utils/people.js';

export default function Avatar({ name, src, className = '' }) {
  return (
    <div className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-family-100 text-base font-bold text-family-900 ${className}`}>
      {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : initials(name)}
    </div>
  );
}
