import React, { useState, useEffect } from 'react';
import api from '../services/apiService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Plus, Trash2, ChevronDown, Edit2, Check, Dumbbell, Activity, TrendingUp } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { ConfirmModal } from './ui/ConfirmModal';
import './Workouts.css';

const Workouts: React.FC = () => {
    const [splits, setSplits] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'routines' | 'progress'>('routines');

    // Progress State
    const [profileData, setProfileData] = useState<any>(null);
    const [fitnessLogs, setFitnessLogs] = useState<any[]>([]);
    const [newWeight, setNewWeight] = useState('');

    const [expandedDay, setExpandedDay] = useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    
    // Modal State
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        confirmAction: () => Promise<void>;
    }>({
        isOpen: false,
        title: '',
        message: '',
        confirmAction: async () => {}
    });

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

            if (Array.isArray(logsRes.data)) {
                const formattedLogs = logsRes.data
                    .sort((a: any, b: any) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
                    .map((log: any) => ({
                        id: log.id,
                        date: new Date(log.recordedAt).toLocaleDateString(),
                        weight: log.weightKg
                    }));
                setFitnessLogs(formattedLogs);
            } else {
                setFitnessLogs([]);
            }
        } catch (error) {
            console.error('Failed to fetch progress data', error);
        }
    };

    const handleLogWeight = async () => {
        if (!newWeight) return;
        try {
            await api.post('/fitness-logs', { weightKg: parseFloat(newWeight) });
            setNewWeight('');
            fetchProgressData();
        } catch (error) {
            console.error('Failed to log weight', error);
        }
    };

    const requestDeleteLog = (logId: string) => {
        setModalConfig({
            isOpen: true,
            title: 'Delete Log?',
            message: 'Are you sure you want to delete this weight entry?',
            confirmAction: async () => {
                try {
                    await api.delete(`/fitness-logs/${logId}`);
                    fetchProgressData();
                } catch (error) {
                    console.error('Failed to delete log', error);
                } finally {
                    setModalConfig(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    const fetchSplits = async () => {
        try {
            const response = await api.get('/workouts');
            if (Array.isArray(response.data)) {
                setSplits(response.data);
            } else {
                setSplits([]);
            }
        } catch (error) {
            console.error('Failed to fetch workouts', error);
        } finally {
            setIsLoading(false);
        }
    };

    const requestDeleteSplit = (id: string) => {
        setModalConfig({
            isOpen: true,
            title: 'Delete Routine?',
            message: 'Are you sure you want to delete this workout routine? All exercises within it will be removed.',
            confirmAction: async () => {
                try {
                    await api.delete(`/workouts/${id}`);
                    setSplits(prev => prev.filter(s => s.id !== id));
                    if (expandedDay === id) setExpandedDay(null);
                } catch (error) {
                    console.error('Failed to delete split', error);
                } finally {
                    setModalConfig(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    const requestDeleteExercise = (workoutId: string, exerciseId: string) => {
        setModalConfig({
            isOpen: true,
            title: 'Remove Exercise?',
            message: 'Remove this exercise from your routine?',
            confirmAction: async () => {
                try {
                    await api.delete(`/workouts/${workoutId}/exercises/${exerciseId}`);
                    setSplits(prev => prev.map(s => {
                        if (s.id === workoutId) {
                            return { ...s, exercises: s.exercises.filter((ex: any) => ex.id !== exerciseId) };
                        }
                        return s;
                    }));
                } catch (error) {
                    console.error('Failed to delete exercise', error);
                } finally {
                    setModalConfig(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    const addSplit = async () => {
        try {
            const response = await api.post('/workouts', { day: 'Monday', splitName: 'Body Focus' });
            setSplits(prev => [...prev, response.data]);
            setExpandedDay(response.data.id);
            setIsEditMode(true);
        } catch (error) {
            console.error('Failed to create split', error);
        }
    };

    const addExercise = async (workoutId: string) => {
        try {
            const response = await api.post(`/workouts/${workoutId}/exercises`, { name: 'New Exercise', sets: 3, reps: 10, weight: 0 });
            setSplits(prev => prev.map(s => {
                if (s.id === workoutId) {
                    return { ...s, exercises: [...s.exercises, response.data] };
                }
                return s;
            }));
        } catch (error) {
            console.error('Failed to add exercise', error);
        }
    };

    // --- State Update Handlers (Local Only) ---
    
    const handleSplitChange = (id: string, updates: any) => {
        setSplits(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
    };

    const handleExerciseChange = (workoutId: string, exerciseId: string, updates: any) => {
        setSplits(prev => prev.map(s => {
            if (s.id === workoutId) {
                return {
                    ...s,
                    exercises: s.exercises.map((ex: any) => 
                        ex.id === exerciseId ? { ...ex, ...updates } : ex
                    )
                };
            }
            return s;
        }));
    };

    // --- Persistence Handlers (API) ---

    const persistSplit = async (id: string, updates: any) => {
        try {
            await api.put(`/workouts/${id}`, updates);
            // No need to setSplits here as we already updated it locally for responsiveness
            // But we can refresh just to be safe or ignore if we trust local state
        } catch (error) {
            console.error('Failed to persist split', error);
            fetchSplits(); // Revert on failure
        }
    };

    const persistExercise = async (workoutId: string, exerciseId: string, updates: any) => {
        try {
            await api.put(`/workouts/${workoutId}/exercises/${exerciseId}`, updates);
        } catch (error) {
            console.error('Failed to persist exercise', error);
            fetchSplits(); // Revert on failure
        }
    };

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

    return (
        <div className="workouts-container animate-fade-in">
            <header className="workouts-header">
                <div className="header-main">
                    <h1><Dumbbell className="header-icon" /> Fitness Tracker</h1>
                    <p>Track your weekly routines and overall physical progress.</p>
                </div>

                <div className="tab-switcher glass-panel">
                    <button
                        className={activeTab === 'routines' ? 'active' : ''}
                        onClick={() => setActiveTab('routines')}
                    >
                        Routines
                    </button>
                    <button
                        className={activeTab === 'progress' ? 'active' : ''}
                        onClick={() => setActiveTab('progress')}
                    >
                        Body Progress
                    </button>
                </div>
            </header>

            {activeTab === 'routines' ? (
                <div className="routines-view">
                    <div className="routines-controls">
                        <Button
                            variant="primary"
                            onClick={addSplit}
                            leftIcon={<Plus size={18} />}
                        >
                            New Routine
                        </Button>
                        <Button
                            variant={isEditMode ? "primary" : "secondary"}
                            onClick={() => setIsEditMode(!isEditMode)}
                            leftIcon={isEditMode ? <Check size={18} /> : <Edit2 size={18} />}
                        >
                            {isEditMode ? 'Done Editing' : 'Edit Routines'}
                        </Button>
                    </div>

                    <div className="splits-list">
                        {isLoading ? (
                            <div className="empty-state">Loading Workout Plans...</div>
                        ) : (splits || []).length === 0 ? (
                            <div className="empty-state">No workout routines defined. Create your first one to get started!</div>
                        ) : (
                            splits.map(split => (
                                <Card key={split.id} className={`split-card-oop ${expandedDay === split.id ? 'expanded' : ''}`} noPadding>
                                    <div className="split-header" onClick={() => setExpandedDay(expandedDay === split.id ? null : split.id)}>
                                        <div className="split-title-group">
                                            {isEditMode ? (
                                                <div className="split-edit-inputs" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="text"
                                                        value={split.day || ''}
                                                        onChange={(e) => handleSplitChange(split.id, { day: e.target.value })}
                                                        onBlur={(e) => persistSplit(split.id, { day: e.target.value })}
                                                        className="split-day-input"
                                                        placeholder="Day (e.g. Monday)"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={split.splitName || ''}
                                                        onChange={(e) => handleSplitChange(split.id, { splitName: e.target.value })}
                                                        onBlur={(e) => persistSplit(split.id, { splitName: e.target.value })}
                                                        className="split-name-input"
                                                        placeholder="Muscle Group (e.g. Chest)"
                                                    />
                                                </div>
                                            ) : (
                                                <>
                                                    <h3>{split.day}</h3>
                                                    <span className="split-subtitle">{split.splitName}</span>
                                                </>
                                            )}
                                        </div>
                                        <div className="split-meta">
                                            {isEditMode && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="delete-split-btn"
                                                    onClick={(e) => { e.stopPropagation(); requestDeleteSplit(split.id); }}
                                                >
                                                    <Trash2 size={18} />
                                                </Button>
                                            )}
                                            <div className={`expand-trigger ${expandedDay === split.id ? 'expanded' : ''}`}>
                                                <ChevronDown size={20} />
                                            </div>
                                        </div>
                                    </div>

                                    {expandedDay === split.id && (
                                        <div className="split-content animate-fade-in">
                                            <div className="exercises-list">
                                                {split.exercises && split.exercises.length > 0 ? (
                                                    split.exercises.map((ex: any) => (
                                                        <Card key={ex.id} className="exercise-item-oop">
                                                            <div className="ex-info">
                                                                {isEditMode ? (
                                                                    <div className="ex-edit-header">
                                                                        <input
                                                                            type="text"
                                                                            value={ex.name || ''}
                                                                            onChange={(e) => handleExerciseChange(split.id, ex.id, { name: e.target.value })}
                                                                            onBlur={(e) => persistExercise(split.id, ex.id, { name: e.target.value })}
                                                                            className="ex-name-input-edit"
                                                                            placeholder="Exercise name"
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <h4>{ex.name}</h4>
                                                                )}
                                                                
                                                                <div className="ex-metrics-row">
                                                                    <div className="metric">
                                                                        <span>Sets:</span>
                                                                        {isEditMode ? (
                                                                            <input
                                                                                type="number"
                                                                                value={ex.sets ?? ''}
                                                                                onChange={(e) => handleExerciseChange(split.id, ex.id, { sets: parseInt(e.target.value) || 0 })}
                                                                                onBlur={(e) => persistExercise(split.id, ex.id, { sets: parseInt(e.target.value) || 0 })}
                                                                                className="metric-input-small"
                                                                            />
                                                                        ) : (
                                                                            <strong>{ex.sets}</strong>
                                                                        )}
                                                                    </div>
                                                                    <div className="metric">
                                                                        <span>Reps:</span>
                                                                        {isEditMode ? (
                                                                            <input
                                                                                type="number"
                                                                                value={ex.reps ?? ''}
                                                                                onChange={(e) => handleExerciseChange(split.id, ex.id, { reps: parseInt(e.target.value) || 0 })}
                                                                                onBlur={(e) => persistExercise(split.id, ex.id, { reps: parseInt(e.target.value) || 0 })}
                                                                                className="metric-input-small"
                                                                            />
                                                                        ) : (
                                                                            <strong>{ex.reps}</strong>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="ex-inputs">
                                                                <div className="weight-input-group">
                                                                    <input
                                                                        type="number"
                                                                        value={ex.weight ?? ''}
                                                                        onChange={(e) => handleExerciseChange(split.id, ex.id, { weight: parseFloat(e.target.value) || 0 })}
                                                                        onBlur={(e) => persistExercise(split.id, ex.id, { weight: parseFloat(e.target.value) || 0 })}
                                                                        placeholder="0"
                                                                        className="weight-input"
                                                                    />
                                                                    <span className="unit">kg</span>
                                                                </div>

                                                                {isEditMode && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="delete-ex-btn"
                                                                        onClick={() => requestDeleteExercise(split.id, ex.id)}
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </Card>
                                                    ))
                                                ) : (
                                                    <p className="no-exercises">No exercises added yet.</p>
                                                )}
                                            </div>
                                            {isEditMode && (
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => addExercise(split.id)}
                                                    leftIcon={<Plus size={18} />}
                                                    className="add-exercise-btn"
                                                    fullWidth
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
                </div>
            ) : (
                <div className="progress-view animate-fade-in">
                    <div className="progress-grid">
                        <Card className="stats-card">
                            <div className="card-header">
                                <h3><Activity size={20} /> Current Stats</h3>
                            </div>
                            
                            {profileData && profileData.heightCm ? (
                                <div className="stats-layout">
                                    <div className="stat-item">
                                        <span className="stat-label">Height</span>
                                        <span className="stat-value">{profileData.heightCm} cm</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">Weight</span>
                                        <span className="stat-value">{profileData.currentWeightKg || '-'} kg</span>
                                    </div>
                                    {currentBmi && (
                                        <div className="stat-item highlight">
                                            <span className="stat-label">BMI</span>
                                            <span className="stat-value">{currentBmi}</span>
                                            <span className={`bmi-tag ${bmiCategory.toLowerCase()}`}>{bmiCategory}</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="insufficient-data">
                                    <p>Update your profile with height and weight to see metrics.</p>
                                </div>
                            )}

                            <div className="log-weight-form">
                                <h4>Quick Log</h4>
                                <div className="log-input-row">
                                    <Input
                                        type="number"
                                        placeholder="Weight (kg)"
                                        value={newWeight}
                                        onChange={(e) => setNewWeight(e.target.value)}
                                    />
                                    <Button onClick={handleLogWeight} variant="primary">Log</Button>
                                </div>
                            </div>
                        </Card>

                        <Card className="chart-card">
                            <div className="card-header">
                                <h3><TrendingUp size={20} /> Weight Trend</h3>
                            </div>
                            <div className="chart-container" style={{ height: '300px', width: '100%' }}>
                                {fitnessLogs.length > 0 ? (
                                    <ResponsiveContainer>
                                        <LineChart data={fitnessLogs}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                            <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickMargin={10} />
                                            <YAxis stroke="var(--text-muted)" fontSize={12} tickMargin={10} domain={['dataMin - 5', 'dataMax + 5']} />
                                            <RechartsTooltip
                                                contentStyle={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', color: 'white' }}
                                                itemStyle={{ color: 'var(--accent-primary)' }}
                                            />
                                            <Line type="monotone" dataKey="weight" stroke="var(--accent-primary)" strokeWidth={3} dot={{ fill: 'var(--accent-primary)', r: 4 }} activeDot={{ r: 8 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="empty-chart">No data points yet.</div>
                                )}
                            </div>
                        </Card>
                    </div>

                    <div className="history-section">
                        <h3>Entry History</h3>
                        <div className="history-list">
                            {fitnessLogs.length === 0 ? (
                                <div className="empty-state">No history recorded.</div>
                            ) : (
                                [...fitnessLogs].reverse().map(log => (
                                    <Card key={log.id} className="history-item">
                                        <div className="history-info">
                                            <span className="date">{log.date}</span>
                                            <span className="weight">{log.weight} kg</span>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => requestDeleteLog(log.id)} className="delete-log">
                                            <Trash2 size={16} />
                                        </Button>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={modalConfig.isOpen}
                title={modalConfig.title}
                message={modalConfig.message}
                onConfirm={modalConfig.confirmAction}
                onCancel={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
};

export default Workouts;
