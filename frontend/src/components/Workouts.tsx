import React, { useState, useEffect } from 'react';
import api from '../services/apiService';
import { Plus, Trash2, ChevronDown, ChevronUp, Edit2, Check } from 'lucide-react';
import { DaySplit } from '../models/WorkoutDomain';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import './Workouts.css';

const Workouts: React.FC = () => {
    // We expect the API to return objects that satisfy IDaySplit
    const [splits, setSplits] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [expandedDay, setExpandedDay] = useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState<boolean>(false);

    useEffect(() => {
        fetchSplits();
    }, []);

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
                    <h1>Workout Planner</h1>
                    <p>Track your weekly splits, exercises, sets, reps, and weights.</p>
                </div>
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
            </header>

            {isLoading ? (
                <div className="empty-state">Loading Workouts...</div>
            ) : (
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
                                                split.exercises.map(ex => (
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
                        ))}
                </div>
            )}
        </div>
    );
};

export default Workouts;
