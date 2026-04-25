import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    CheckCircle2,
    Flame,
    Dumbbell,
    Pin,
    ShoppingBag,
    MessageSquare,
    Search,
    Target,
    User,
    Award,
    Calendar,
    ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/apiService';
import './Dashboard.css';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
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
                <div className="db-hero-top">
                    <div className="db-score-main">
                        <div className="db-receipt-icon"><Target size={28} /></div>
                        <div className="db-big-number">
                            <span className="currency">%</span>
                            {metrics.isLoading ? '0' : metrics.habitScore}
                        </div>
                    </div>
                    <div className="db-meta-group">
                        <div className="db-meta-item">
                            <div className="meta-icon"><User size={14}/></div>
                            <div className="meta-text">
                                <span className="label">Account</span>
                                <strong>{user?.username || 'User'}</strong>
                            </div>
                        </div>
                        <div className="db-meta-item">
                            <div className="meta-icon"><Award size={14}/></div>
                            <div className="meta-text">
                                <span className="label">Daily Goal</span>
                                <strong>Habits</strong>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="db-hero-bottom">
                    <div className="db-pills-row">
                        <div className="db-pill green-pill">
                            <div className="pill-header">Tasks</div>
                            <div className="pill-body">
                                <CheckCircle2 size={16}/> {metrics.pendingTasks} Pending
                            </div>
                        </div>
                        <div className="db-pill yellow-pill">
                            <div className="pill-header">Consistency</div>
                            <div className="pill-body">
                                <Flame size={16}/> {metrics.maxStreak} Streak
                            </div>
                        </div>
                        
                        <div className="db-progress-wrapper">
                            <div className="prog-header">Daily Completion</div>
                            <div className="prog-track">
                                <div className="prog-fill" style={{width: `${metrics.habitScore}%`}}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bottom Split Area */}
            <section className="db-split-area">
                
                {/* Left Side: Modules */}
                <div className="db-pane-left">
                    <div className="db-pane-tabs">
                        <div className="tab active">Modules</div>
                    </div>
                    
                    <div className="db-pane-content">
                        <div className="pane-header">
                            <div className="pane-title">
                                <h3>Quick Launch</h3>
                                <span className="item-count">6 Modules</span>
                            </div>
                            <div className="pane-search">
                                <Search size={14} /> <input type="text" placeholder="Search modules..." />
                            </div>
                        </div>

                        <div className="db-modules-grid">
                            <Link to="/todos" className="module-card">
                                <div className="mod-icon task-icon"><CheckCircle2 size={24}/></div>
                                <div className="mod-info">
                                    <h4>Tasks</h4>
                                    <p>Productivity & Goals</p>
                                </div>
                                <div className="mod-footer">
                                    <span className="qty">Pending: {metrics.pendingTasks}</span>
                                    <button className="dot-btn"><ArrowRight size={14}/></button>
                                </div>
                            </Link>

                            <Link to="/habits" className="module-card">
                                <div className="mod-icon habit-icon"><Flame size={24}/></div>
                                <div className="mod-info">
                                    <h4>Habits</h4>
                                    <p>Consistency & Streaks</p>
                                </div>
                                <div className="mod-footer">
                                    <span className="qty">Daily Routine</span>
                                    <button className="dot-btn"><ArrowRight size={14}/></button>
                                </div>
                            </Link>

                            <Link to="/workouts" className="module-card">
                                <div className="mod-icon fit-icon"><Dumbbell size={24}/></div>
                                <div className="mod-info">
                                    <h4>Fitness</h4>
                                    <p>Health & Progress</p>
                                </div>
                                <div className="mod-footer">
                                    <span className="qty">Gym Tracker</span>
                                    <button className="dot-btn"><ArrowRight size={14}/></button>
                                </div>
                            </Link>
                            
                            <Link to="/pins" className="module-card">
                                <div className="mod-icon pin-icon"><Pin size={24}/></div>
                                <div className="mod-info">
                                    <h4>Pins</h4>
                                    <p>Ideas & Resources</p>
                                </div>
                                <div className="mod-footer">
                                    <span className="qty">Bookmarks</span>
                                    <button className="dot-btn"><ArrowRight size={14}/></button>
                                </div>
                            </Link>
                            
                            <Link to="/shopping-lists" className="module-card">
                                <div className="mod-icon shop-icon"><ShoppingBag size={24}/></div>
                                <div className="mod-info">
                                    <h4>Shopping</h4>
                                    <p>Lists & Coordination</p>
                                </div>
                                <div className="mod-footer">
                                    <span className="qty">Groceries</span>
                                    <button className="dot-btn"><ArrowRight size={14}/></button>
                                </div>
                            </Link>
                            
                            <Link to="/messages" className="module-card">
                                <div className="mod-icon mail-icon"><MessageSquare size={24}/></div>
                                <div className="mod-info">
                                    <h4>Inbox</h4>
                                    <p>Updates & Alerts</p>
                                </div>
                                <div className="mod-footer">
                                    <span className="qty">Messages</span>
                                    <button className="dot-btn"><ArrowRight size={14}/></button>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Right Side: Activity */}
                <div className="db-pane-right">
                    <div className="activity-tab">Pending Tasks</div>
                    
                    <div className="activity-content">
                        <div className="act-title-row" style={{ marginTop: '1rem' }}>
                            <h3>Action Items</h3>
                            <span className="count">{metrics.pendingTasks} <small>Left</small></span>
                        </div>
                        
                        <div className="act-stack">
                            {metrics.recentTodos.length > 0 ? (
                                metrics.recentTodos.map((todo, index) => (
                                    <div key={todo.id} className={`act-card ${index % 2 === 0 ? 'act-purple' : 'act-yellow'}`}>
                                        <div className="act-card-date">
                                            <div className="date-icon"><Calendar size={16}/></div>
                                            <div className="date-text">TODO</div>
                                        </div>
                                        <div className="act-card-info">
                                            <h4>{todo.title}</h4>
                                            <div className="act-user">
                                                <div className="mini-avatar"><CheckCircle2 size={10}/></div>
                                                <span>Pending task from your list</span>
                                            </div>
                                        </div>
                                        <Link to="/todos" className="act-go">↗</Link>
                                    </div>
                                ))
                            ) : (
                                <div className="act-card act-green">
                                    <div className="act-card-info" style={{ textAlign: 'center', width: '100%' }}>
                                        <h4>All Caught Up!</h4>
                                        <p style={{ margin: '0.5rem 0 0', opacity: 0.8, fontSize: '0.9rem' }}>No pending tasks today.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </section>
        </div>
    );
};

export default Dashboard;
