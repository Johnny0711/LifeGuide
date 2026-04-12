import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Todos from './components/Todos';
import Pins from './components/Pins';
import Workouts from './components/Workouts';
import Dashboard from './components/Dashboard';
import Habits from './components/Habits';
import ProfileEdit from './components/ProfileEdit';
import ShoppingLists from './components/ShoppingLists';
import Messages from './components/Messages';
import Auth from './components/Auth';
import SetupAccount from './components/SetupAccount';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-primary)' }}>
        <div className="loader"></div>
        <h2 style={{ color: 'var(--text-primary)', marginLeft: '1rem' }}>LifeGuide is waking up...</h2>
      </div>
    );
  }

  if (!token) {
    return <Auth />;
  }

  const { user } = useAuth();

  if (user?.needsSetup) {
    return <SetupAccount />;
  }

  return (
    <div className="app-container">
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/todos" element={<Todos />} />
          <Route path="/pins" element={<Pins />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/shopping-lists" element={<ShoppingLists />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/profile" element={<ProfileEdit />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}

export default App;
