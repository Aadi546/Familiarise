export default function LoadingState({ label = 'Loading' }) {
  return (
    <div className="flex min-h-64 items-center justify-center px-6 text-center text-lg font-semibold text-slate-600">
      {label}...
    </div>
  );
}
