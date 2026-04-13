import React, { useState } from 'react';
import api, { setAuthToken } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      
      const token = response.data.token;
      if (token) {
        setAuthToken(token);
        login(token);
      }
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        setError('Ungültige E-Mail oder Passwort. Tipp: Standard-Admin ist admin / admin123');
      } else {
        setError(err.response?.data?.message || 'Login fehlgeschlagen. Bitte versuche es später erneut.');
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-logo">LifeGuide</h1>
        <h2 className="auth-title">Login</h2>
        
        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>E-Mail oder Benutzername</label>
            <input 
               type="text" 
               value={email} 
               onChange={(e) => setEmail(e.target.value)} 
               required 
            />
          </div>
          <div className="form-group">
            <label>Passwort</label>
            <input 
               type="password" 
               value={password} 
               onChange={(e) => setPassword(e.target.value)} 
               required 
            />
          </div>
          
          <button type="submit" className="auth-button">
            Anmelden
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
