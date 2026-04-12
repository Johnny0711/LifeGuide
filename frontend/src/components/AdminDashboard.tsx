import React, { useState, useEffect } from 'react';
import api from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import './AdminDashboard.css';

interface User {
    id: string;
    email: string;
    username: string;
    role: string;
    needsSetup: boolean;
    createdAt: string;
}

const AdminDashboard: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [newRole, setNewRole] = useState('USER');
    const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data);
            setIsLoading(false);
        } catch (err) {
            console.error(err);
            setError('Fehler beim Laden der Benutzer.');
            setIsLoading(false);
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const response = await api.post('/admin/users', { email: newEmail, role: newRole });
            setGeneratedPassword(response.data.password);
            fetchUsers();
            setNewEmail('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Benutzer konnte nicht erstellt werden.');
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!window.confirm('Möchtest du diesen Benutzer wirklich löschen?')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            fetchUsers();
        } catch (err) {
            setError('Löschen fehlgeschlagen.');
        }
    };

    if (currentUser?.role !== 'ADMIN') {
        return <div className="admin-error">Zugriff verweigert. Nur für Admins.</div>;
    }

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <h1>Benutzerverwaltung</h1>
                <button className="add-btn" onClick={() => { setShowAddModal(true); setGeneratedPassword(null); }}>
                    + Neuer Benutzer
                </button>
            </header>

            {error && <div className="admin-alert error">{error}</div>}

            <div className="admin-content">
                {isLoading ? (
                    <div className="loader"></div>
                ) : (
                    <div className="table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>E-Mail</th>
                                    <th>Rolle</th>
                                    <th>Status</th>
                                    <th>Aktionen</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td>{u.username || <span className="setup-pending">Ausstehend</span>}</td>
                                        <td>{u.email}</td>
                                        <td><span className={`role-badge ${u.role.toLowerCase()}`}>{u.role}</span></td>
                                        <td>
                                            {u.needsSetup ? 
                                                <span className="status-badge waiting">Setup nötig</span> : 
                                                <span className="status-badge active">Aktiv</span>
                                            }
                                        </td>
                                        <td>
                                            <button 
                                                className="delete-btn" 
                                                onClick={() => handleDeleteUser(u.id)}
                                                disabled={u.email === currentUser.email}
                                            >
                                                Löschen
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Benutzer hinzufügen</h2>
                        {!generatedPassword ? (
                            <form onSubmit={handleAddUser}>
                                <div className="form-group">
                                    <label>E-Mail</label>
                                    <input 
                                        type="email" 
                                        value={newEmail} 
                                        onChange={(e) => setNewEmail(e.target.value)} 
                                        required 
                                        placeholder="user@example.com"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Rolle</label>
                                    <select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                                        <option value="USER">User</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>Abbrechen</button>
                                    <button type="submit" className="confirm-btn">Erstellen</button>
                                </div>
                            </form>
                        ) : (
                            <div className="password-display">
                                <p>Benutzer erfolgreich erstellt! Kopiere dieses temporäre Passwort:</p>
                                <div className="temp-password">{generatedPassword}</div>
                                <p className="warning">Dieses Passwort wird nur einmal angezeigt!</p>
                                <button className="confirm-btn" onClick={() => setShowAddModal(false)}>Schließen</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
