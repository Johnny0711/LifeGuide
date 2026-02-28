import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import api, { setAuthToken } from './services/apiService';
import Sidebar from './components/Sidebar';
import Todos from './components/Todos';
import Pins from './components/Pins';
import Workouts from './components/Workouts';
import Dashboard from './components/Dashboard';
import Habits from './components/Habits';

function App() {
  const { isAuthenticated, isLoading, loginWithRedirect, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const syncUser = async () => {
      try {
        if (isAuthenticated) {
          const token = await getAccessTokenSilently();
          setAuthToken(token);
          // Sync user profile to backend DB
          await api.post('/users/sync');
        } else {
          setAuthToken(null);
        }
      } catch (err) {
        console.error('Error syncing user or getting token', err);
      }
    };

    if (!isLoading) {
      syncUser();
    }
  }, [isAuthenticated, isLoading, getAccessTokenSilently]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-primary)' }}>
        <h2 style={{ color: 'var(--text-primary)' }}>Lade LifeGuide...</h2>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Willkommen bei LifeGuide</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Bitte melde dich an, um fortzufahren.</p>
          <button
            onClick={() => loginWithRedirect()}
            style={{
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '8px',
              fontSize: '1.1rem',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Login / Registrieren
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/todos" element={<Todos />} />
          <Route path="/pins" element={<Pins />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/habits" element={<Habits />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
