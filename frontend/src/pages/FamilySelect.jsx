import { useNavigate } from 'react-router-dom';
import { Check, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function FamilySelect() {
  const { families, activeFamily, selectFamily, logout } = useAuth();
  const navigate = useNavigate();

  function chooseFamily(family) {
    selectFamily(family);
    navigate('/chat', { replace: true });
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <section className="mx-auto max-w-xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-base font-bold text-family-700">Choose a family</p>
            <h1 className="mt-1 text-3xl font-black text-slate-950">Where are we going?</h1>
          </div>
          <button type="button" onClick={logout} className="min-h-12 rounded-lg bg-slate-200 px-4 text-base font-bold text-slate-800">
            Log out
          </button>
        </div>

        <div className="space-y-3">
          {families.map((family) => (
            <button
              key={family.id}
              type="button"
              onClick={() => chooseFamily(family)}
              className="flex min-h-20 w-full items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-family-100 text-family-900">
                <Home size={24} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xl font-black text-slate-950">{family.name}</p>
                <p className="text-base font-semibold capitalize text-slate-500">{family.role}</p>
              </div>
              {activeFamily?.id === family.id && <Check className="text-family-700" size={26} />}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
