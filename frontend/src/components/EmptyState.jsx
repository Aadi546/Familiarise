export default function EmptyState({ title, message, icon }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center animate-fade-in">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-900/30 text-teal-500 dark:text-teal-400">
        {icon || (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        )}
      </div>
      <h2 className="text-lg font-black text-slate-900 dark:text-white">{title}</h2>
      <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400 max-w-xs">{message}</p>
    </div>
  );
}
