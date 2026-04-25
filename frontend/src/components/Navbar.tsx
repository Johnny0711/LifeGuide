import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Settings, LogOut, Shield, Grid, User } from 'lucide-react';
import api from '../services/apiService';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetchPendingInvites();
    const interval = setInterval(fetchPendingInvites, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingInvites = async () => {
    try {
      const response = await api.get('/shopping-lists/invites');
      const pending = response.data.filter((i: any) => i.status === 'PENDING');
      setPendingCount(pending.length);
    } catch {
      // silently ignore
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleEditProfile = () => {
    setMenuOpen(false);
    navigate('/profile');
  };

  const handleAdmin = () => {
    setMenuOpen(false);
    navigate('/admin');
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Dashboard';
      case '/todos': return 'Tasks';
      case '/habits': return 'Habits';
      case '/workouts': return 'Fitness';
      case '/pins': return 'Pins';
      case '/shopping-lists': return 'Shopping';
      case '/messages': return 'Messages';
      case '/profile': return 'Settings';
      case '/admin': return 'Admin Panel';
      default: return 'LifeGuide';
    }
  };

  return (
    <nav className="navbar-dribbble">
      <div className="nav-d-left">
        <div className="nav-d-logo" onClick={() => navigate('/')}>LG.</div>
        <div className="nav-d-title-group">
          <button className="nav-d-icon-btn" onClick={() => navigate('/')}>
            <Grid size={16} />
          </button>
          <h2>{getPageTitle()}</h2>
        </div>
      </div>

      <div className="nav-d-right">
        <button className="nav-d-pill-btn hide-mobile" onClick={() => navigate('/messages')}>
          <Mail size={14} /> Messages
          {pendingCount > 0 && <span className="nav-d-badge">{pendingCount}</span>}
        </button>

        <div className="nav-d-profile-wrapper" onClick={toggleMenu}>
          <div className="nav-d-avatar">
            <User size={18} />
          </div>

          {menuOpen && (
            <div className="nav-d-dropdown">
              <div className="nav-d-dropdown-header">
                <strong>{user?.username || 'Explorer'}</strong>
                <span>{user?.email}</span>
              </div>
              
              {user?.role === 'ADMIN' && (
                <button onClick={handleAdmin} className="nav-d-dropdown-item">
                  <Shield size={16} /> Admin
                </button>
              )}
              
              <button onClick={handleEditProfile} className="nav-d-dropdown-item">
                <Settings size={16} /> Settings
              </button>
              
              <button onClick={handleLogout} className="nav-d-dropdown-item logout">
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
