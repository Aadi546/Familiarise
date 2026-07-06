import { Home, Megaphone, MessageCircle, Phone } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/home', end: true, icon: Home, label: 'Home' },
  { to: '/chat', icon: MessageCircle, label: 'Chat' },
  { to: '/notices', icon: Megaphone, label: 'Notices' },
  { to: '/calls', icon: Phone, label: 'Calls' }
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-4 left-1/2 z-30 -translate-x-1/2 px-3">
      <div className="flex items-center gap-1 rounded-2xl glass shadow-glow-teal-sm border border-slate-200/60 dark:border-slate-700/60 px-2 py-2">
        {links.map(({ to, end, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'flex flex-col items-center justify-center gap-0.5 rounded-xl px-4 py-2 min-w-[60px] transition-all duration-200 select-none',
                isActive
                  ? 'bg-teal-600 text-white shadow-glow-teal-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
              ].join(' ')
            }
          >
            <Icon size={20} strokeWidth={2.2} />
            <span className="text-[10px] font-bold tracking-tight">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
