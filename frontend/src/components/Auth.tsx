import React, { useState } from 'react';
import api, { setAuthToken } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin ? { email, password } : { email, password, name };
      
      const response = await api.post(endpoint, payload);
      
      const token = response.data.token;
      if (token) {
        setAuthToken(token);
        login(token);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Ein Fehler ist aufgetreten');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-logo">LifeGuide</h1>
        <h2 className="auth-title">{isLogin ? 'Login' : 'Registrieren'}</h2>
        
        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Name</label>
              <input 
                 type="text" 
                 value={name} 
                 onChange={(e) => setName(e.target.value)} 
                 required 
              />
            </div>
          )}
          <div className="form-group">
            <label>E-Mail</label>
            <input 
               type="email" 
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
            {isLogin ? 'Anmelden' : 'Account erstellen'}
          </button>
        </form>

        <p className="auth-switch">
          {isLogin ? 'Noch keinen Account?' : 'Bereits registriert?'}
          <button 
             type="button" 
             className="auth-switch-btn" 
             onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Hier registrieren' : 'Hier einloggen'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
