export default function LoadingState({ label = 'Loading' }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-4 px-6 text-center animate-fade-in">
      <div className="relative">
        <div className="h-12 w-12 rounded-full border-4 border-teal-100 dark:border-teal-900/50" />
        <div className="absolute inset-0 h-12 w-12 animate-spin rounded-full border-4 border-transparent border-t-teal-600 dark:border-t-teal-400" />
      </div>
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}…</p>
    </div>
  );
}
