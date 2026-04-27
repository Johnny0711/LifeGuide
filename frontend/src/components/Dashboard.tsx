import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    CheckCircle2, Flame, Dumbbell, Pin, ShoppingBag, MessageSquare, ArrowRight,
    Play, Pause, RotateCcw, Award, Zap
} from 'lucide-react';
import api from '../services/apiService';
import './Dashboard.css';

const Dashboard: React.FC = () => {
    const [metrics, setMetrics] = useState({
        habitScore: 0,
        maxStreak: 0,
        pendingTasks: 0,
        recentTodos: [] as any[],
        topHabit: null as any,
        isLoading: true
    });

    const [pomoTime, setPomoTime] = useState(25 * 60);
    const [pomoActive, setPomoActive] = useState(false);
    const [quickAddText, setQuickAddText] = useState('');

    useEffect(() => {
        let interval: any = null;
        if (pomoActive && pomoTime > 0) {
            interval = setInterval(() => {
                setPomoTime(p => p - 1);
            }, 1000);
        } else if (!pomoActive && pomoTime !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [pomoActive, pomoTime]);

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

                const topHabit = habits.sort((a: any, b: any) => (b.currentStreak || 0) - (a.currentStreak || 0))[0];

                const pendingTodos = todos.filter((t: any) => !t.completed);
                const recentTodos = pendingTodos.slice(0, 1);

                setMetrics({
                    habitScore,
                    maxStreak,
                    pendingTasks: pendingTodos.length,
                    recentTodos,
                    topHabit,
                    isLoading: false
                });
            } catch (error) {
                console.error('Failed to fetch dashboard metrics', error);
                setMetrics(prev => ({ ...prev, isLoading: false }));
            }
        };

        fetchDashboardData();
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleQuickAdd = async () => {
        if (!quickAddText.trim()) return;
        try {
            await api.post('/todos', { text: quickAddText.trim(), completed: false });
            setMetrics(m => ({ ...m, pendingTasks: m.pendingTasks + 1 }));
            setQuickAddText('');
        } catch (error) {
            console.error('Failed to quick add', error);
        }
    };

    const level = Math.floor(metrics.habitScore / 10) + Math.floor(metrics.maxStreak / 5) + 1;

    return (
        <div className="db-container animate-fade-in">
            {/* The Huge Hero Section */}
            <section className="db-hero">
                <div className="db-hero-bottom">
                    <div className="db-pills-row">
                        <div className="db-pill purple-pill">
                            <div className="pill-header">Level {level}</div>
                            <div className="pill-body">
                                <Award size={16} /> Productivity Ninja
                            </div>
                        </div>
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

                {/* Left Side: Modules & Charts */}
                <div className="db-pane-left">
                    <div className="db-pane-content">

                        {/* Quick Add Bar */}
                        <div className="quick-add-bar">
                            <input
                                type="text"
                                placeholder="Add a new task..."
                                value={quickAddText}
                                onChange={(e) => setQuickAddText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
                            />
                            <div className="quick-add-actions">
                                <button onClick={() => handleQuickAdd()} className="qa-btn qa-task"><CheckCircle2 size={16} /> Task</button>
                            </div>
                        </div>

                        <div className="pane-header" style={{ marginTop: '2rem' }}>
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

                {/* Right Side: Widgets */}
                <div className="db-pane-right">

                    {/* Up Next */}
                    <div className="widget-card up-next">
                        <h3><Zap size={18} /> Today's Focus</h3>
                        {metrics.recentTodos.length > 0 && (
                            <div className="focus-item">
                                <div className="focus-icon"><CheckCircle2 size={16} /></div>
                                <div>
                                    <h5>{metrics.recentTodos[0].title}</h5>
                                    <p>Top Priority Task</p>
                                </div>
                            </div>
                        )}
                        {metrics.topHabit && (
                            <div className="focus-item">
                                <div className="focus-icon"><Flame size={16} /></div>
                                <div>
                                    <h5>{metrics.topHabit.title}</h5>
                                    <p>{metrics.topHabit.currentStreak} Day Streak!</p>
                                </div>
                            </div>
                        )}
                        <div className="focus-item">
                            <div className="focus-icon"><Dumbbell size={16} /></div>
                            <div>
                                <h5>Rest Day</h5>
                                <p>No workout planned</p>
                            </div>
                        </div>
                    </div>

                    {/* Pomodoro Timer */}
                    <div className="widget-card pomodoro">
                        <h3>Focus Timer</h3>
                        <div className="pomo-display">{formatTime(pomoTime)}</div>
                        <div className="pomo-controls">
                            <button className="pomo-btn play" onClick={() => setPomoActive(!pomoActive)}>
                                {pomoActive ? <Pause size={20} /> : <Play size={20} />}
                            </button>
                            <button className="pomo-btn reset" onClick={() => { setPomoActive(false); setPomoTime(25 * 60); }}>
                                <RotateCcw size={20} />
                            </button>
                        </div>
                    </div>

                </div>

            </section>
        </div>
    );
};

export default Dashboard;
