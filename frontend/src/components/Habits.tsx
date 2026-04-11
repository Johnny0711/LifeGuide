import React, { useState, useEffect } from 'react';
import api from '../services/apiService';
import { Plus, Trash2, Flame, CheckCircle, Circle } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { ConfirmModal } from './ui/ConfirmModal';
import './Habits.css';

const Habits: React.FC = () => {
    const [habits, setHabits] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newHabitName, setNewHabitName] = useState('');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [habitToDelete, setHabitToDelete] = useState<string | null>(null);

    useEffect(() => {
        fetchHabits();
    }, []);

    const fetchHabits = async () => {
        try {
            const response = await api.get('/habits');
            if (Array.isArray(response.data)) {
                setHabits(response.data);
            } else {
                setHabits([]);
            }
        } catch (error) {
            console.error('Failed to fetch habits', error);
        } finally {
            setIsLoading(false);
        }
    };

    const addHabit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newHabitName.trim()) return;

        try {
            const response = await api.post('/habits', { title: newHabitName.trim() });
            setHabits(prev => [...prev, response.data]);
            setNewHabitName('');
        } catch (error) {
            console.error('Failed to create habit', error);
        }
    };

    const requestDelete = (id: string) => {
        setHabitToDelete(id);
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!habitToDelete) return;
        try {
            await api.delete(`/habits/${habitToDelete}`);
            setHabits(prev => prev.filter(h => h.id !== habitToDelete));
        } catch (error) {
            console.error('Failed to delete habit', error);
        } finally {
            setIsModalOpen(false);
            setHabitToDelete(null);
        }
    };

    const toggleToday = async (id: string) => {
        const todayStr = new Date().toISOString().split('T')[0];
        try {
            const response = await api.put(`/habits/${id}/toggle?date=${todayStr}`);
            setHabits(prev => prev.map(h => (h.id === id ? response.data : h)));
        } catch (error) {
            console.error('Failed to toggle habit', error);
        }
    };

    // Generate last 7 days for the mini-calendar view
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d;
    });

    const todayStr = new Date().toISOString().split('T')[0];

    return (
        <div className="habits-container animate-fade-in">
            <header className="habits-header">
                <h1>Habit Tracker</h1>
                <p>Build consistency and track your daily streaks.</p>
            </header>

            <Card className="habits-controls" noPadding={false}>
                <form onSubmit={addHabit} className="add-habit-form">
                    <Input
                        fullWidth
                        placeholder="E.g., Read 10 pages, Drink water..."
                        value={newHabitName}
                        onChange={(e) => setNewHabitName(e.target.value)}
                    />
                    <Button type="submit" variant="primary" leftIcon={<Plus size={18} />} disabled={!newHabitName.trim()}>
                        Add Habit
                    </Button>
                </form>
            </Card>

            <div className="habits-list">
                {isLoading ? (
                    <div className="empty-state">Loading Habits...</div>
                ) : habits.length === 0 ? (
                    <div className="empty-state">No habits defined yet. Start building a new one today!</div>
                ) : (
                    habits.map(habit => {
                        const streak = habit.currentStreak || 0;
                        const isDoneToday = habit.completedDates && habit.completedDates.includes(todayStr);

                        return (
                            <Card key={habit.id} className="habit-card-oop" interactive>
                                <div className="habit-main">
                                    <div className="habit-info">
                                        <h3>{habit.title}</h3>
                                        <div className="streak-badge" title={`${streak} day streak`}>
                                            <Flame size={16} className={streak > 0 ? "flame-active" : "flame-inactive"} />
                                            <span>{streak} Streak</span>
                                        </div>
                                    </div>

                                    <div className="habit-actions">
                                        <Button
                                            variant={isDoneToday ? "primary" : "secondary"}
                                            onClick={() => toggleToday(habit.id)}
                                            leftIcon={isDoneToday ? <CheckCircle size={18} /> : <Circle size={18} />}
                                            className="today-btn"
                                        >
                                            {isDoneToday ? 'Done Today' : 'Mark Done'}
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            onClick={() => requestDelete(habit.id)}
                                            className="habit-delete-btn"
                                            aria-label="Delete habit"
                                        >
                                            <Trash2 size={18} />
                                        </Button>
                                    </div>
                                </div>

                                <div className="habit-history">
                                    {last7Days.map((date, i) => {
                                        const dateStr = date.toISOString().split('T')[0];
                                        const completed = habit.completedDates && habit.completedDates.includes(dateStr);
                                        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                                        const isToday = i === 6;

                                        return (
                                            <div key={dateStr} className="history-day" title={date.toLocaleDateString()}>
                                                <span className="day-label">{isToday ? 'Today' : dayName}</span>
                                                <div className={`day-circle ${completed ? 'completed' : 'missed'}`} />
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>
                        );
                    })
                )}
            </div>

            <ConfirmModal
                isOpen={isModalOpen}
                title="Delete Habit?"
                message="Are you sure you want to delete this habit? All history and streaks for this habit will be lost."
                onConfirm={confirmDelete}
                onCancel={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export default Habits;
