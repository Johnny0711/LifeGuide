import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
    const { user, logout } = useAuth0();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const handleLogout = () => {
        logout({ logoutParams: { returnTo: window.location.origin } });
    };

    const handleEditProfile = () => {
        setMenuOpen(false);
        navigate('/profile');
    };

    return (
        <nav className="navbar">
            <div className="navbar-left" onClick={() => navigate('/')}>
                <h1 className="navbar-logo">LifeGuide</h1>
            </div>
            <div className="navbar-right">
                <div className="profile-container" onClick={toggleMenu}>
                    <img
                        src={user?.picture || 'https://via.placeholder.com/40'}
                        alt="Profile"
                        className="profile-pic"
                    />
                    {menuOpen && (
                        <div className="profile-dropdown">
                            <button onClick={handleEditProfile} className="dropdown-item">Edit Profile</button>
                            <button onClick={handleLogout} className="dropdown-item">Log out</button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
