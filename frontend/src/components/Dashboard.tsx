import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    CheckCircle2,
    Flame,
    Dumbbell,
    Pin,
    ShoppingBag,
    MessageSquare,
    ArrowRight
} from 'lucide-react';
import api from '../services/apiService';
import './Dashboard.css';

const Dashboard: React.FC = () => {
    const [metrics, setMetrics] = useState({
        habitScore: 0,
        maxStreak: 0,
        pendingTasks: 0,
        recentTodos: [] as any[],
        isLoading: true
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [habitsRes, todosRes] = await Promise.all([
                    api.get('/habits'),
                    api.get('/todos')
                ]);

                const habits = habitsRes.data || [];
                const todos = todosRes.data || [];
                const todayStr = new Date().toISOString().split('T')[0];

                const totalHabits = habits.length;
                const completedToday = habits.filter((h: any) =>
                    h.completedDates && h.completedDates.includes(todayStr)
                ).length;
                const habitScore = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

                const maxStreak = habits.reduce((max: number, h: any) =>
                    Math.max(max, h.currentStreak || 0), 0);

                const pendingTodos = todos.filter((t: any) => !t.completed);
                const recentTodos = pendingTodos.slice(0, 2);

                setMetrics({
                    habitScore,
                    maxStreak,
                    pendingTasks: pendingTodos.length,
                    recentTodos,
                    isLoading: false
                });
            } catch (error) {
                console.error('Failed to fetch dashboard metrics', error);
                setMetrics(prev => ({ ...prev, isLoading: false }));
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="db-container animate-fade-in">
            {/* The Huge Hero Section */}
            <section className="db-hero">

                <div className="db-hero-bottom">
                    <div className="db-pills-row">
                        <div className="db-pill green-pill">
                            <div className="pill-header">Tasks</div>
                            <div className="pill-body">
                                <CheckCircle2 size={16} /> {metrics.pendingTasks} Pending
                            </div>
                        </div>
                        <div className="db-pill yellow-pill">
                            <div className="pill-header">Consistency</div>
                            <div className="pill-body">
                                <Flame size={16} /> {metrics.maxStreak} Streak
                            </div>
                        </div>

                        <div className="db-progress-wrapper">
                            <div className="prog-header">Daily Completion</div>
                            <div className="prog-track">
                                <div className="prog-fill" style={{ width: `${metrics.habitScore}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bottom Split Area */}
            <section className="db-split-area">

                {/* Left Side: Modules */}
                <div className="db-pane-left">

                    <div className="db-pane-content">
                        <div className="pane-header">
                            <div className="pane-title">
                                <h3>Quick Launch</h3>
                                <span className="item-count">6 Modules</span>
                            </div>
                        </div>

                        <div className="db-modules-grid">
                            <Link to="/todos" className="module-card">
                                <div className="mod-icon task-icon"><CheckCircle2 size={24} /></div>
                                <div className="mod-info">
                                    <h4>Tasks</h4>
                                    <p>Productivity & Goals</p>
                                </div>
                                <div className="mod-footer">
                                    <span className="qty">Pending: {metrics.pendingTasks}</span>
                                    <button className="dot-btn"><ArrowRight size={14} /></button>
                                </div>
                            </Link>

                            <Link to="/habits" className="module-card">
                                <div className="mod-icon habit-icon"><Flame size={24} /></div>
                                <div className="mod-info">
                                    <h4>Habits</h4>
                                    <p>Consistency & Streaks</p>
                                </div>
                                <div className="mod-footer">
                                    <span className="qty">Daily Routine</span>
                                    <button className="dot-btn"><ArrowRight size={14} /></button>
                                </div>
                            </Link>

                            <Link to="/workouts" className="module-card">
                                <div className="mod-icon fit-icon"><Dumbbell size={24} /></div>
                                <div className="mod-info">
                                    <h4>Fitness</h4>
                                    <p>Health & Progress</p>
                                </div>
                                <div className="mod-footer">
                                    <span className="qty">Gym Tracker</span>
                                    <button className="dot-btn"><ArrowRight size={14} /></button>
                                </div>
                            </Link>

                            <Link to="/pins" className="module-card">
                                <div className="mod-icon pin-icon"><Pin size={24} /></div>
                                <div className="mod-info">
                                    <h4>Pins</h4>
                                    <p>Ideas & Resources</p>
                                </div>
                                <div className="mod-footer">
                                    <span className="qty">Bookmarks</span>
                                    <button className="dot-btn"><ArrowRight size={14} /></button>
                                </div>
                            </Link>

                            <Link to="/shopping-lists" className="module-card">
                                <div className="mod-icon shop-icon"><ShoppingBag size={24} /></div>
                                <div className="mod-info">
                                    <h4>Shopping</h4>
                                    <p>Lists & Coordination</p>
                                </div>
                                <div className="mod-footer">
                                    <span className="qty">Groceries</span>
                                    <button className="dot-btn"><ArrowRight size={14} /></button>
                                </div>
                            </Link>

                            <Link to="/messages" className="module-card">
                                <div className="mod-icon mail-icon"><MessageSquare size={24} /></div>
                                <div className="mod-info">
                                    <h4>Inbox</h4>
                                    <p>Updates & Alerts</p>
                                </div>
                                <div className="mod-footer">
                                    <span className="qty">Messages</span>
                                    <button className="dot-btn"><ArrowRight size={14} /></button>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

            </section>
        </div>
    );
};

export default Dashboard;
