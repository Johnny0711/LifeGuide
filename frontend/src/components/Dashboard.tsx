import React, { useState, useEffect } from 'react';
import api from '../services/apiService';
import { Link } from 'react-router-dom';
import { CheckSquare, Pin, Dumbbell, ArrowRight, Flame } from 'lucide-react';
import { Card } from './ui/Card';
import './Dashboard.css';

const Dashboard: React.FC = () => {
    const [todos, setTodos] = useState<any[]>([]);
    const [pins, setPins] = useState<any[]>([]);
    const [splits, setSplits] = useState<any[]>([]);
    const [habits, setHabits] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [todosRes, pinsRes, splitsRes, habitsRes] = await Promise.all([
                    api.get('/todos'),
                    api.get('/pins'),
                    api.get('/workouts'),
                    api.get('/habits')
                ]);

                setTodos(todosRes.data);
                setPins(pinsRes.data);
                setSplits(splitsRes.data);
                setHabits(habitsRes.data);
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (isLoading) {
        return <div className="dashboard-container" style={{ padding: '2rem', textAlign: 'center' }}>Loading Dashboard...</div>;
    }

    const activeTodos = todos.filter((t) => !t.completed);
    const todaysDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todaySplit = splits.find((s) => s.day === todaysDayName);
    const recentPins = [...pins].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3);

    // Quick habit snapshot
    const totalHabits = habits.length;
    // Calculate if it's done today: We check current streak and completed dates.
    // The backend Habit response has a completedDates array we can check.
    const todayStr = new Date().toISOString().split('T')[0];
    const completedHabits = habits.filter(h => h.completedDates && h.completedDates.includes(todayStr)).length;

    return (
        <div className="dashboard-container animate-fade-in">
            <header className="dashboard-header">
                <h1>Welcome Back, Joni</h1>
                <p>Here's a summary of your life today: <strong>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</strong></p>
            </header>

            <div className="dashboard-grid">
                {/* Habit Snapshot */}
                <Card noPadding={false} className="widget">
                    <div className="widget-header">
                        <div className="widget-title">
                            <Flame size={20} className="widget-icon" />
                            <h2>Today's Habits</h2>
                        </div>
                        <Link to="/habits" className="widget-link">
                            View <ArrowRight size={16} />
                        </Link>
                    </div>
                    <div className="widget-content">
                        {totalHabits > 0 ? (
                            <div className="habit-quick-stats">
                                <div className="stat-circle">
                                    <span className="stat-number">{completedHabits} / {totalHabits}</span>
                                    <span className="stat-label"> Done</span>
                                </div>
                            </div>
                        ) : (
                            <p className="no-data">No habits tracked today.</p>
                        )}
                    </div>
                </Card>

                {/* Workout Widget */}
                <Card noPadding={false} className="widget">
                    <div className="widget-header">
                        <div className="widget-title">
                            <Dumbbell size={20} className="widget-icon" />
                            <h2>Today's Workout</h2>
                        </div>
                        <Link to="/workouts" className="widget-link">
                            View <ArrowRight size={16} />
                        </Link>
                    </div>
                    <div className="widget-content">
                        {todaySplit && todaySplit.exercises && todaySplit.exercises.length > 0 ? (
                            <div className="today-workout">
                                <div className="split-badge">{todaySplit.splitName}</div>
                                <p className="ex-count">
                                    {todaySplit.exercises.length} exercise{todaySplit.exercises.length !== 1 ? 's' : ''} planned
                                </p>
                            </div>
                        ) : (
                            <p className="no-data">No workout data found for today.</p>
                        )}
                    </div>
                </Card>

                {/* Todos Widget */}
                <Card noPadding={false} className="widget">
                    <div className="widget-header">
                        <div className="widget-title">
                            <CheckSquare size={20} className="widget-icon" />
                            <h2>Active Tasks</h2>
                        </div>
                        <Link to="/todos" className="widget-link">
                            View <ArrowRight size={16} />
                        </Link>
                    </div>
                    <div className="widget-content">
                        {activeTodos.length > 0 ? (
                            <ul className="mini-list">
                                {activeTodos.slice(0, 4).map((todo) => (
                                    <li key={todo.id} className="mini-list-item">
                                        <span className="dot"></span>
                                        <span className="text-truncate">{todo.text}</span>
                                    </li>
                                ))}
                                {activeTodos.length > 4 && (
                                    <li className="more-text">+{activeTodos.length - 4} more</li>
                                )}
                            </ul>
                        ) : (
                            <p className="no-data">All caught up! No active tasks.</p>
                        )}
                    </div>
                </Card>

                {/* Pins Widget */}
                <Card noPadding={false} className="widget span-2">
                    <div className="widget-header">
                        <div className="widget-title">
                            <Pin size={20} className="widget-icon" />
                            <h2>Recent Pins</h2>
                        </div>
                        <Link to="/pins" className="widget-link">
                            View All <ArrowRight size={16} />
                        </Link>
                    </div>
                    <div className="widget-content pins-widget-grid">
                        {recentPins.length > 0 ? (
                            recentPins.map((pin) => (
                                <div key={pin.id} className="mini-pin" style={{ borderTopColor: pin.color }}>
                                    {pin.title && <h3>{pin.title}</h3>}
                                    <p className="text-truncate-multi">{pin.content}</p>
                                </div>
                            ))
                        ) : (
                            <p className="no-data">No pins created yet.</p>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
