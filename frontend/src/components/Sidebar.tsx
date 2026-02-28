import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { LayoutDashboard, CheckSquare, Pin, Dumbbell, Flame, LogOut } from 'lucide-react';
import './Sidebar.css';

const Sidebar: React.FC = () => {
    const { logout } = useAuth0();

    const navItems = [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
        { name: 'Habits', path: '/habits', icon: <Flame size={20} /> },
        { name: 'To-Dos', path: '/todos', icon: <CheckSquare size={20} /> },
        { name: 'Pins', path: '/pins', icon: <Pin size={20} /> },
        { name: 'Workouts', path: '/workouts', icon: <Dumbbell size={20} /> },
    ];

    return (
        <aside className="sidebar glass-panel">
            <div className="sidebar-header">
                <h2>LifeGuide</h2>
            </div>
            <nav className="sidebar-nav">
                <ul>
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                            >
                                {item.icon}
                                <span>{item.name}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                <button
                    onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                    className="nav-item"
                    style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--text-secondary)' }}
                >
                    <LogOut className="nav-icon" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
