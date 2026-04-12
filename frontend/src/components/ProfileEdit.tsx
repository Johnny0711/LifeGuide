import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/apiService';
import './Profile.css';

const Profile: React.FC = () => {
    const { user } = useAuth();
    const [profileData, setProfileData] = useState({
        username: '',
        age: '',
        heightCm: '',
        currentWeightKg: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/profile');
                if (response.data) {
                    setProfileData({
                        username: response.data.username || '',
                        age: response.data.age || '',
                        heightCm: response.data.heightCm || '',
                        currentWeightKg: response.data.currentWeightKg || ''
                    });
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);

        try {
            await api.put('/profile', {
                username: profileData.username,
                age: profileData.age ? parseInt(profileData.age as string) : null,
                heightCm: profileData.heightCm ? parseFloat(profileData.heightCm as string) : null,
                currentWeightKg: profileData.currentWeightKg ? parseFloat(profileData.currentWeightKg as string) : null
            });
            setMessage({ text: 'Profile updated successfully!', type: 'success' });
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({ text: 'Failed to update profile.', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="profile-container">Loading Profile...</div>;

    return (
        <div className="profile-container animate-fade-in">
            <header className="profile-header">
                <img src={'https://via.placeholder.com/100'} alt="Profile" className="profile-large-pic" />
                <div className="profile-info-readonly">
                    <h2>{user?.username}</h2>
                    <p>{user?.email}</p>
                </div>
            </header>

            <form className="profile-form glass-panel" onSubmit={handleSubmit}>
                <h3>Edit Details</h3>

                {message && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={profileData.username}
                        onChange={handleChange}
                        className="oop-input"
                        placeholder="Choose a unique username"
                    />
                </div>

                <div className="form-stats-row">
                    <div className="form-group">
                        <label htmlFor="age">Age</label>
                        <input
                            type="number"
                            id="age"
                            name="age"
                            value={profileData.age}
                            onChange={handleChange}
                            className="oop-input"
                            placeholder="e.g. 25"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="heightCm">Height (cm)</label>
                        <input
                            type="number"
                            id="heightCm"
                            name="heightCm"
                            value={profileData.heightCm}
                            onChange={handleChange}
                            className="oop-input"
                            placeholder="e.g. 180"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="currentWeightKg">Weight (kg)</label>
                        <input
                            type="number"
                            id="currentWeightKg"
                            name="currentWeightKg"
                            value={profileData.currentWeightKg}
                            onChange={handleChange}
                            className="oop-input"
                            placeholder="e.g. 75.5"
                            step="0.1"
                        />
                    </div>
                </div>

                <button type="submit" className="save-btn oop-btn" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
};

export default Profile;
