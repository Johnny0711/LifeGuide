import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import api from '../services/apiService';
import './Navbar.css';

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        fetchPendingInvites();
        // Poll every 30s for new invites
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

  return (
    <nav className="navbar glass-panel">
      <div className="navbar-container">
        <div className="navbar-left" onClick={() => navigate('/')}>
          <h1 className="navbar-logo">Life<span>Guide</span></h1>
        </div>
        
        <div className="navbar-right">
          <button
            className="navbar-icon-btn hide-mobile"
            onClick={() => navigate('/messages')}
            title="Messages"
          >
            <Mail size={22} />
            {pendingCount > 0 && (
              <span className="navbar-badge">{pendingCount}</span>
            )}
          </button>
          
          <div className="navbar-profile" onClick={toggleMenu}>
            <img
              src={'https://ui-avatars.com/api/?name=' + (user?.name || user?.email) + '&background=6366f1&color=fff'}
              alt="Profile"
              className="navbar-avatar"
            />
            {menuOpen && (
              <div className="navbar-dropdown glass-panel">
                <button onClick={handleEditProfile} className="dropdown-item">Settings</button>
                <div className="dropdown-divider"></div>
                <button onClick={handleLogout} className="dropdown-item logout">Sign Out</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
