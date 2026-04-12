import React, { useState } from 'react';
import api from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import './Auth.css'; // Reusing some auth styles

const SetupAccount: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [error, setError] = useState('');
    const { logout } = useAuth(); // To force re-login if needed, although we just want to refresh user state

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 8) {
            setError('Das Passwort muss mindestens 8 Zeichen lang sein.');
            return;
        }

        if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
            setError('Das Passwort muss Buchstaben und Zahlen enthalten.');
            return;
        }

        if (password !== passwordConfirm) {
            setError('Die Passwörter stimmen nicht überein.');
            return;
        }

        try {
            await api.post('/auth/setup-account', {
                username,
                password,
                passwordConfirm
            });
            // Refresh the page or reload user to clear needsSetup flag
            window.location.reload();
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Setup fehlgeschlagen');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-logo">LifeGuide</h1>
                <h2 className="auth-title">Account Setup</h2>
                <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                    Willkommen! Bitte wähle einen Usernamen und ein neues Passwort.
                </p>
                
                {error && <div className="auth-error">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input 
                            type="text" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            required 
                            placeholder="Dein gewünschter Username"
                        />
                    </div>
                    <div className="form-group">
                        <label>Neues Passwort</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            placeholder="Zahlen & Buchstaben, min. 8 Zeichen"
                        />
                    </div>
                    <div className="form-group">
                        <label>Passwort bestätigen</label>
                        <input 
                            type="password" 
                            value={passwordConfirm} 
                            onChange={(e) => setPasswordConfirm(e.target.value)} 
                            required 
                        />
                    </div>
                    
                    <button type="submit" className="auth-button">
                        Setup abschließen
                    </button>
                    
                    <button type="button" className="auth-switch-btn" onClick={logout} style={{ marginTop: '1rem' }}>
                        Abbrechen & Ausloggen
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SetupAccount;
