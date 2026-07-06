import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout.jsx';
import { useAuth } from './context/AuthContext.jsx';
import Calls from './pages/Calls.jsx';
import Chat from './pages/Chat.jsx';
import FamilySelect from './pages/FamilySelect.jsx';
import Home from './pages/Home.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Noticeboard from './pages/Noticeboard.jsx';
import Profile from './pages/Profile.jsx';

function AuthLayout() {
  const { user, activeFamily } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!activeFamily) return <Navigate to="/family" replace />;
  return <AppLayout />;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Landing — only for guests */}
      <Route path="/" element={!user ? <Landing /> : <Navigate to="/home" replace />} />

      {/* Auth pages */}
      <Route path="/login" element={user ? <Navigate to="/home" replace /> : <Login />} />
      <Route path="/family" element={user ? <FamilySelect /> : <Navigate to="/login" replace />} />

      {/* Authenticated app pages */}
      <Route element={<AuthLayout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/notices" element={<Noticeboard />} />
        <Route path="/calls" element={<Calls />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to={user ? '/home' : '/'} replace />} />
    </Routes>
  );
}
