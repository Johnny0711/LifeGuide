import React, { useState, useEffect } from 'react';
import api from '../services/apiService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Plus, Trash2, ChevronDown, ChevronUp, Edit2, Check } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import './Workouts.css';

const Workouts: React.FC = () => {
    // We expect the API to return objects that satisfy IDaySplit
    const [splits, setSplits] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'routines' | 'progress'>('routines');

    // Progress State
    const [profileData, setProfileData] = useState<any>(null);
    const [fitnessLogs, setFitnessLogs] = useState<any[]>([]);
    const [newWeight, setNewWeight] = useState('');

    const [expandedDay, setExpandedDay] = useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState<boolean>(false);

    useEffect(() => {
        fetchSplits();
        fetchProgressData();
    }, []);

    const fetchProgressData = async () => {
        try {
            const [profileRes, logsRes] = await Promise.all([
                api.get('/profile'),
                api.get('/fitness-logs')
            ]);
            setProfileData(profileRes.data);

            // Format logs for Recharts
            const formattedLogs = logsRes.data
                .sort((a: any, b: any) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
                .map((log: any) => ({
                    id: log.id,
                    date: new Date(log.recordedAt).toLocaleDateString(),
                    weight: log.weightKg
                }));
            setFitnessLogs(formattedLogs);
        } catch (error) {
            console.error('Failed to fetch progress data', error);
        }
    };

    const handleLogWeight = async () => {
        if (!newWeight) return;
        try {
            await api.post('/fitness-logs', { weightKg: parseFloat(newWeight) });
            // Refresh logs
            setNewWeight('');
            fetchProgressData();
        } catch (error) {
            console.error('Failed to log weight', error);
        }
    };

    const handleDeleteLog = async (logId: string) => {
        try {
            await api.delete(`/fitness-logs/${logId}`);
            fetchProgressData();
        } catch (error) {
            console.error('Failed to delete log', error);
        }
    };

    // Calculate BMI if height is available
    let currentBmi = null;
    let bmiCategory = '';

    if (profileData && profileData.heightCm && profileData.currentWeightKg) {
        const heightM = profileData.heightCm / 100;
        currentBmi = (profileData.currentWeightKg / (heightM * heightM)).toFixed(1);

        const bmiVal = parseFloat(currentBmi);
        if (bmiVal < 18.5) bmiCategory = 'Underweight';
        else if (bmiVal < 25) bmiCategory = 'Normal';
        else if (bmiVal < 30) bmiCategory = 'Overweight';
        else bmiCategory = 'Obese';
    }

    const fetchSplits = async () => {
        try {
            const response = await api.get('/workouts');
            setSplits(response.data);
        } catch (error) {
            console.error('Failed to fetch workouts', error);
        } finally {
            setIsLoading(false);
        }
    };
    // Simplified Optimistic UI update wrapper
    const updateLocalSplit = (splitId: string, updater: (split: any) => void) => {
        setSplits(prev => prev.map(s => {
            if (s.id === splitId) {
                const cloned = { ...s, exercises: [...s.exercises] };
                updater(cloned);
                return cloned;
            }
            return s;
        }));
    };

    const handleUpdateSplitName = async (id: string, newName: string) => {
        updateLocalSplit(id, s => s.splitName = newName);
        try { await api.put(`/workouts/${id}`, { splitName: newName }); }
        catch (e) { console.error('Failed to update split name', e); fetchSplits(); }
    };

    const handleUpdateDayName = async (id: string, newDayName: string) => {
        updateLocalSplit(id, s => s.day = newDayName);
        try { await api.put(`/workouts/${id}`, { day: newDayName }); }
        catch (e) { console.error('Failed to update day name', e); fetchSplits(); }
    };

    const addExercise = async (splitId: string) => {
        try {
            const response = await api.post(`/workouts/${splitId}/exercises`, {
                name: "New Exercise",
                sets: 3,
                reps: 10,
                weight: 0
            });
            updateLocalSplit(splitId, s => s.exercises.push(response.data));
        } catch (e) { console.error('Failed to add exercise', e); }
    };

    const updateExercise = async (splitId: string, exId: string, updates: any) => {
        // Optimistic UI Update
        updateLocalSplit(splitId, s => {
            const exIndex = s.exercises.findIndex((e: any) => e.id === exId);
            if (exIndex > -1) {
                s.exercises[exIndex] = { ...s.exercises[exIndex], ...updates };
            }
        });

        // API Update
        try {
            await api.put(`/workouts/${splitId}/exercises/${exId}`, updates);
        } catch (e) {
            console.error('Failed to update exercise', e);
            fetchSplits(); // rollback on failure
        }
    };

    const deleteExercise = async (id: string, exId: string) => {
        updateLocalSplit(id, s => s.exercises = s.exercises.filter((e: any) => e.id !== exId));
        try { await api.delete(`/workouts/${id}/exercises/${exId}`); }
        catch (e) { console.error('Failed to delete exercise', e); fetchSplits(); }
    };

    const toggleDay = (id: string) => {
        setExpandedDay(expandedDay === id ? null : id);
    };

    const addNewSplit = async () => {
        try {
            const response = await api.post('/workouts', {
                day: 'New Day',
                splitName: 'Core',
                exercises: []
            });
            setSplits([...splits, response.data]);
            setExpandedDay(response.data.id);
        } catch (e) { console.error('Failed to add split', e); }
    };

    const deleteSplit = async (id: string) => {
        setSplits(splits.filter(s => s.id !== id));
        if (expandedDay === id) setExpandedDay(null);
        try { await api.delete(`/workouts/${id}`); }
        catch (e) { console.error('Failed to delete split', e); fetchSplits(); }
    };

    return (
        <div className="workouts-container animate-fade-in">
            <header className="workouts-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1>Fitness</h1>
                    <p>Track your weekly routines and overall physical progress.</p>
                </div>

                <div className="fitness-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'routines' ? 'active' : ''}`}
                        onClick={() => setActiveTab('routines')}
                    >
                        Routines
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'progress' ? 'active' : ''}`}
                        onClick={() => setActiveTab('progress')}
                    >
                        Progress & BMI
                    </button>
                </div>

                {activeTab === 'routines' && (
                    <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                        <Button
                            variant={isEditMode ? "primary" : "secondary"}
                            onClick={() => setIsEditMode(!isEditMode)}
                            leftIcon={isEditMode ? <Check size={20} /> : <Edit2 size={20} />}
                            className="workouts-edit-btn"
                        >
                            {isEditMode ? 'Done Editing' : 'Edit Routine'}
                        </Button>
                        {isEditMode && (
                            <Button variant="primary" onClick={addNewSplit} leftIcon={<Plus size={20} />}>
                                New Routine
                            </Button>
                        )}
                    </div>
                )}
            </header>

            {isLoading ? (
                <div className="empty-state">Loading Data...</div>
            ) : activeTab === 'routines' ? (
                <div className="splits-list">
                    {splits.length === 0 ? (
                        <div className="empty-state">No workouts created yet. Click "Edit Routine" to generate your first plan!</div>
                    ) : (
                        splits.map(split => (
                            <Card key={split.id} className={`split-card-oop ${expandedDay === split.id ? 'expanded' : ''}`} noPadding>
                                <div className="split-header" onClick={() => toggleDay(split.id)}>
                                    <div className="split-title">
                                        {isEditMode ? (
                                            <>
                                                <input
                                                    type="text"
                                                    value={split.day}
                                                    onChange={(e) => handleUpdateDayName(split.id, e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="split-day-input"
                                                    placeholder="Day Name"
                                                />
                                                <input
                                                    type="text"
                                                    value={split.splitName}
                                                    onChange={(e) => handleUpdateSplitName(split.id, e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="split-name-input"
                                                    placeholder="e.g. Push, Pull, Rest"
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <span className="split-day-text">{split.day}</span>
                                                <span className="split-name-text">{split.splitName}</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="split-actions">
                                        {isEditMode && (
                                            <button
                                                className="split-delete-btn"
                                                onClick={(e) => { e.stopPropagation(); deleteSplit(split.id); }}
                                                aria-label="Delete routine"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        )}
                                        <button className="expand-btn" aria-label="Expand day">
                                            {expandedDay === split.id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                                        </button>
                                    </div>
                                </div>

                                {expandedDay === split.id && (
                                    <div className="split-content">
                                        <div className="exercises-list">
                                            {split.exercises.length === 0 ? (
                                                <div className="empty-exercises">
                                                    No exercises added yet. {split.splitName.toLowerCase() === 'rest' && 'Enjoy your rest day!'}
                                                </div>
                                            ) : (
                                                split.exercises.map((ex: any) => (
                                                    <Card key={ex.id} className="exercise-item-oop" noPadding={false}>
                                                        <div className="ex-main">
                                                            {isEditMode ? (
                                                                <input
                                                                    type="text"
                                                                    value={ex.name}
                                                                    onChange={(e) => updateExercise(split.id, ex.id, { name: e.target.value })}
                                                                    className="ex-name-input"
                                                                    placeholder="Exercise name"
                                                                />
                                                            ) : (
                                                                <span className="ex-name-text">{ex.name}</span>
                                                            )}
                                                        </div>

                                                        <div className="ex-metrics">
                                                            <div className="metric-group">
                                                                <label>Sets</label>
                                                                {isEditMode ? (
                                                                    <Input
                                                                        type="number"
                                                                        value={ex.sets}
                                                                        onChange={(e) => updateExercise(split.id, ex.id, { sets: Number(e.target.value) })}
                                                                        min="1"
                                                                        style={{ width: '80px', padding: '0.4rem' }}
                                                                    />
                                                                ) : (
                                                                    <div className="metric-display">{ex.sets}</div>
                                                                )}
                                                            </div>

                                                            <div className="metric-group">
                                                                <label>Reps</label>
                                                                {isEditMode ? (
                                                                    <Input
                                                                        type="number"
                                                                        value={ex.reps}
                                                                        onChange={(e) => updateExercise(split.id, ex.id, { reps: Number(e.target.value) })}
                                                                        min="1"
                                                                        style={{ width: '80px', padding: '0.4rem' }}
                                                                    />
                                                                ) : (
                                                                    <div className="metric-display">{ex.reps}</div>
                                                                )}
                                                            </div>

                                                            <div className="metric-group weight-group">
                                                                <label>Weight</label>
                                                                <Input
                                                                    type="number"
                                                                    value={ex.weight}
                                                                    onChange={(e) => updateExercise(split.id, ex.id, { weight: Number(e.target.value) })}
                                                                    min="0"
                                                                    step="0.5"
                                                                    style={{ width: '100px', borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)', padding: '0.4rem' }}
                                                                />
                                                            </div>

                                                            {isEditMode && (
                                                                <Button
                                                                    variant="danger"
                                                                    size="sm"
                                                                    style={{ backgroundColor: 'transparent', padding: '0.8rem' }}
                                                                    className="ex-delete"
                                                                    onClick={() => deleteExercise(split.id, ex.id)}
                                                                    aria-label="Delete exercise"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </Card>
                                                ))
                                            )}
                                        </div>

                                        {isEditMode && (
                                            <Button
                                                fullWidth
                                                variant="ghost"
                                                onClick={() => addExercise(split.id)}
                                                leftIcon={<Plus size={18} />}
                                                style={{ border: '1px dashed var(--accent-primary)', color: 'var(--accent-primary)' }}
                                            >
                                                Add Exercise
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </Card>
                        ))
                    )}
                </div>
            ) : (
                <div className="progress-tab-content animate-fade-in">
                    <div className="progress-grid">
                        <Card noPadding={false} className="bmi-card">
                            <h3>Current Stats</h3>
                            {profileData && profileData.heightCm ? (
                                <div className="bmi-stats">
                                    <div className="stat-box">
                                        <span className="stat-label">Height</span>
                                        <span className="stat-value">{profileData.heightCm} cm</span>
                                    </div>
                                    <div className="stat-box">
                                        <span className="stat-label">Current Weight</span>
                                        <span className="stat-value">{profileData.currentWeightKg || '-'} kg</span>
                                    </div>
                                    {currentBmi && (
                                        <div className="stat-box bmi-highlight">
                                            <span className="stat-label">BMI</span>
                                            <span className="stat-value">{currentBmi}</span>
                                            <span className={`bmi-category ${bmiCategory.toLowerCase()}`}>{bmiCategory}</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <p>Please update your Profile with Height & Weight to calculate BMI.</p>
                                </div>
                            )}

                            <div className="log-weight-section">
                                <h4>Log Weight Today</h4>
                                <div className="log-input-group">
                                    <Input
                                        type="number"
                                        value={newWeight}
                                        onChange={(e) => setNewWeight(e.target.value)}
                                        placeholder="Weight (kg)"
                                        style={{ width: '120px' }}
                                    />
                                    <Button onClick={handleLogWeight} variant="primary">Log It</Button>
                                </div>
                            </div>
                            
                            {fitnessLogs.length > 0 && (
                                <div className="log-history-section" style={{ marginTop: '2rem' }}>
                                    <h4>History</h4>
                                    <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {[...fitnessLogs].reverse().slice(0, 5).map(log => (
                                            <li key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)' }}>
                                                <span>{log.date} - <strong>{log.weight} kg</strong></span>
                                                <Button variant="ghost" size="sm" onClick={() => handleDeleteLog(log.id)} style={{ color: 'var(--danger)' }}>
                                                    <Trash2 size={16} />
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </Card>

                        <Card noPadding={false} className="chart-card">
                            <h3>Weight Progress (kg)</h3>
                            {fitnessLogs.length > 0 ? (
                                <div style={{ height: 300, width: '100%', marginTop: '1rem' }}>
                                    <ResponsiveContainer>
                                        <LineChart data={fitnessLogs} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                            <XAxis dataKey="date" stroke="var(--text-secondary)" />
                                            <YAxis domain={['auto', 'auto']} stroke="var(--text-secondary)" />
                                            <RechartsTooltip
                                                contentStyle={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--glass-border)', color: 'white' }}
                                                itemStyle={{ color: 'var(--accent-primary)' }}
                                            />
                                            <Line type="monotone" dataKey="weight" stroke="var(--accent-primary)" strokeWidth={3} activeDot={{ r: 8 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="empty-state" style={{ height: '300px', display: 'flex', alignItems: 'center' }}>
                                    No weight logs found. Start logging above to see your progress chart!
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Workouts;
