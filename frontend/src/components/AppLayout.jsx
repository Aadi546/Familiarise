import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav.jsx';
import Header from './Header.jsx';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Header />
      <main className="mx-auto max-w-2xl px-4 pt-4 pb-28">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
