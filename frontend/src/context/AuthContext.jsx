import { createContext, useContext, useMemo, useState } from 'react';
import { login as loginRequest } from '../api/auth.js';

const AuthContext = createContext(null);
const storageKey = 'family-hub-session';

function readStoredSession() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || {};
  } catch {
    return {};
  }
}

export function AuthProvider({ children }) {
  const stored = readStoredSession();
  const [user, setUser] = useState(stored.user || null);
  const [families, setFamilies] = useState(stored.families || []);
  const [activeFamily, setActiveFamily] = useState(stored.activeFamily || null);

  function persist(next) {
    localStorage.setItem(storageKey, JSON.stringify(next));
  }

  async function login(fullName, pin) {
    const result = await loginRequest(fullName, pin);
    const nextFamily = result.families[0] || null;

    setUser(result.user);
    setFamilies(result.families);
    setActiveFamily(nextFamily);
    persist({ user: result.user, families: result.families, activeFamily: nextFamily });

    return result;
  }

  function selectFamily(family) {
    setActiveFamily(family);
    persist({ user, families, activeFamily: family });
  }

  function logout() {
    setUser(null);
    setFamilies([]);
    setActiveFamily(null);
    localStorage.removeItem(storageKey);
  }

  function updateUser(nextUser) {
    const merged = { ...user, ...nextUser };
    setUser(merged);
    persist({ user: merged, families, activeFamily });
  }

  const value = useMemo(
    () => ({
      user,
      families,
      activeFamily,
      login,
      logout,
      selectFamily,
      updateUser
    }),
    [user, families, activeFamily]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
}
