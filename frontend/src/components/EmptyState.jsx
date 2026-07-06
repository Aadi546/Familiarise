export default function EmptyState({ title, message }) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 h-14 w-14 rounded-full bg-family-100" />
      <h2 className="text-xl font-bold text-slate-950">{title}</h2>
      <p className="mt-2 text-base leading-7 text-slate-600">{message}</p>
    </div>
  );
}
