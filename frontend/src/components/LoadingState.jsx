export default function LoadingState({ label = 'Loading' }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 h-12 w-12 animate-pulse rounded-full bg-family-100" />
      <p className="text-lg font-black text-slate-800">{label}...</p>
    </div>
  );
}
