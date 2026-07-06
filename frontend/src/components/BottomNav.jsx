import { Home, Megaphone, MessageCircle, Phone } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const itemClass = ({ isActive }) =>
  [
    'flex min-h-14 flex-1 items-center justify-center gap-1 rounded-lg px-2 text-sm font-bold transition sm:gap-2 sm:text-base',
    isActive ? 'bg-family-700 text-white' : 'text-slate-700 hover:bg-slate-100'
  ].join(' ');

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white px-3 pt-2 safe-bottom">
      <div className="mx-auto flex max-w-3xl gap-2">
        <NavLink to="/" end className={itemClass}>
          <Home size={22} />
          Home
        </NavLink>
        <NavLink to="/chat" className={itemClass}>
          <MessageCircle size={22} />
          Chat
        </NavLink>
        <NavLink to="/notices" className={itemClass}>
          <Megaphone size={22} />
          Notices
        </NavLink>
        <NavLink to="/calls" className={itemClass}>
          <Phone size={22} />
          Calls
        </NavLink>
      </div>
    </nav>
  );
}
