import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Flame, 
  Dumbbell, 
  Pin, 
  ShoppingBag, 
  MessageSquare,
  ArrowRight,
  Target,
  TrendingUp,
  Award
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

                // Calculate Habit Score
                const totalHabits = habits.length;
                const completedToday = habits.filter((h: any) => 
                    h.completedDates && h.completedDates.includes(todayStr)
                ).length;
                const habitScore = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

                // Max Streak
                const maxStreak = habits.reduce((max: number, h: any) => 
                    Math.max(max, h.currentStreak || 0), 0);

                // Pending Tasks
                const pendingTasks = todos.filter((t: any) => !t.completed).length;

                setMetrics({
                    habitScore,
                    maxStreak,
                    pendingTasks,
                    isLoading: false
                });
            } catch (error) {
                console.error('Failed to fetch dashboard metrics', error);
                setMetrics(prev => ({ ...prev, isLoading: false }));
            }
        };

        fetchDashboardData();
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div className="dashboard-container animate-fade-in">
            {/* Decorative Background Elements */}
            <div className="bg-ornament orb-1" />
            <div className="bg-ornament orb-2" />
            
            <header className="dashboard-hero">
                <div className="hero-content">
                    <span className="hero-badge">
                        <TrendingUp size={14} style={{ marginRight: '6px' }} />
                        LifeGuide Hub
                    </span>
                    <h1>{getGreeting()}, <span>{user?.name || 'Explorer'}</span></h1>
                    <p>Your personal ecosystem is ready. Where shall we focus today?</p>
                </div>
            </header>

            <section className="dashboard-section insights-section">
                <div className="section-header">
                    <h2>Daily Insights</h2>
                    <p>Your progress at a glance</p>
                </div>
                
                <div className="insights-grid">
                    <div className="insight-card glass-panel">
                        <div className="insight-icon score">
                            <Target size={24} />
                        </div>
                        <div className="insight-data">
                            <span className="insight-label">Habit Score</span>
                            <div className="insight-value-row">
                                <span className="insight-value">{metrics.isLoading ? '...' : `${metrics.habitScore}%`}</span>
                                {!metrics.isLoading && <div className="mini-progress"><div className="fill" style={{ width: `${metrics.habitScore}%` }} /></div>}
                            </div>
                        </div>
                    </div>

                    <div className="insight-card glass-panel">
                        <div className="insight-icon streak">
                            <Flame size={24} />
                        </div>
                        <div className="insight-data">
                            <span className="insight-label">Top Streak</span>
                            <span className="insight-value">{metrics.isLoading ? '...' : `${metrics.maxStreak} Days`}</span>
                        </div>
                    </div>

                    <div className="insight-card glass-panel">
                        <div className="insight-icon tasks">
                            <Award size={24} />
                        </div>
                        <div className="insight-data">
                            <span className="insight-label">Pending Tasks</span>
                            <span className="insight-value">{metrics.isLoading ? '...' : metrics.pendingTasks}</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="dashboard-section">
                <div className="section-header">
                    <h2>Quick Launch</h2>
                    <p>Access your primary modules</p>
                </div>
                
                <div className="app-launcher-grid">
                    <Link to="/todos" className="launcher-card glass-panel interactive">
                        <div className="launcher-icon task">
                            <CheckCircle2 size={28} />
                        </div>
                        <div className="launcher-info">
                            <h3>Tasks</h3>
                            <p>Productivity & Goals</p>
                        </div>
                        <ArrowRight className="launcher-arrow" size={20} />
                    </Link>

                    <Link to="/habits" className="launcher-card glass-panel interactive">
                        <div className="launcher-icon habit">
                            <Flame size={28} />
                        </div>
                        <div className="launcher-info">
                            <h3>Habits</h3>
                            <p>Consistency & Streaks</p>
                        </div>
                        <ArrowRight className="launcher-arrow" size={20} />
                    </Link>

                    <Link to="/workouts" className="launcher-card glass-panel interactive">
                        <div className="launcher-icon fitness">
                            <Dumbbell size={28} />
                        </div>
                        <div className="launcher-info">
                            <h3>Fitness</h3>
                            <p>Health & Progress</p>
                        </div>
                        <ArrowRight className="launcher-arrow" size={20} />
                    </Link>

                    <Link to="/pins" className="launcher-card glass-panel interactive">
                        <div className="launcher-icon pin">
                            <Pin size={28} />
                        </div>
                        <div className="launcher-info">
                            <h3>Pins</h3>
                            <p>Ideas & Resources</p>
                        </div>
                        <ArrowRight className="launcher-arrow" size={20} />
                    </Link>

                    <Link to="/shopping-lists" className="launcher-card glass-panel interactive">
                        <div className="launcher-icon store">
                            <ShoppingBag size={28} />
                        </div>
                        <div className="launcher-info">
                            <h3>Shopping</h3>
                            <p>Lists & Coordination</p>
                        </div>
                        <ArrowRight className="launcher-arrow" size={20} />
                    </Link>

                    <Link to="/messages" className="launcher-card glass-panel interactive">
                        <div className="launcher-icon mail">
                            <MessageSquare size={28} />
                        </div>
                        <div className="launcher-info">
                            <h3>Inbox</h3>
                            <p>Updates & Alerts</p>
                        </div>
                        <ArrowRight className="launcher-arrow" size={20} />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
