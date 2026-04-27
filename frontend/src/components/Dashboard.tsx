import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    CheckCircle2, Flame, Dumbbell, Pin, ShoppingBag, MessageSquare, ArrowRight,
    Plus, Play, Pause, RotateCcw, Sun, Smile, Meh, Frown, Award, Quote, Calendar, Star,
    Zap, Heart
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/apiService';
import './Dashboard.css';

const mockChartData = [
    { name: 'Mon', tasks: 4, habits: 3 },
    { name: 'Tue', tasks: 3, habits: 4 },
    { name: 'Wed', tasks: 5, habits: 5 },
    { name: 'Thu', tasks: 2, habits: 3 },
    { name: 'Fri', tasks: 6, habits: 4 },
    { name: 'Sat', tasks: 1, habits: 2 },
    { name: 'Sun', tasks: 0, habits: 1 },
];

const quotes = [
    "The secret of getting ahead is getting started.",
    "It always seems impossible until it's done.",
    "Don't watch the clock; do what it does. Keep going.",
    "Quality is not an act, it is a habit."
];

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
    const [mood, setMood] = useState<number | null>(null);
    const [quickAddText, setQuickAddText] = useState('');
    const [quote, setQuote] = useState(quotes[0]);

    useEffect(() => {
        setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, []);

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

    const handleQuickAdd = async (type: 'todo' | 'pin') => {
        if (!quickAddText.trim()) return;
        try {
            if (type === 'todo') {
                await api.post('/todos', { title: quickAddText, completed: false, category: 'Inbox', priority: 'medium' });
                setMetrics(m => ({ ...m, pendingTasks: m.pendingTasks + 1 }));
            } else if (type === 'pin') {
                await api.post('/pins', { title: quickAddText, content: '' });
            }
            setQuickAddText('');
        } catch (error) {
            console.error('Failed to quick add', error);
        }
    };

    const level = Math.floor(metrics.habitScore / 10) + Math.floor(metrics.maxStreak / 5) + 1;
    const progressToNextLevel = (metrics.habitScore % 10) * 10; // Simple calc for demo

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
                                placeholder="What's on your mind? Type to quick add..." 
                                value={quickAddText}
                                onChange={(e) => setQuickAddText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd('todo')}
                            />
                            <div className="quick-add-actions">
                                <button onClick={() => handleQuickAdd('todo')} className="qa-btn qa-task"><CheckCircle2 size={16}/> Task</button>
                                <button onClick={() => handleQuickAdd('pin')} className="qa-btn qa-pin"><Pin size={16}/> Pin</button>
                            </div>
                        </div>

                        <div className="pane-header" style={{marginTop: '2rem'}}>
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
                        
                        {/* Weekly Activity Chart */}
                        <div className="chart-section" style={{marginTop: '3rem'}}>
                            <h3>Weekly Activity</h3>
                            <div className="chart-container" style={{height: 250, marginTop: '1rem'}}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={mockChartData}>
                                        <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip 
                                            cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                            contentStyle={{backgroundColor: '#1a1a24', border: 'none', borderRadius: '12px'}} 
                                        />
                                        <Bar dataKey="tasks" fill="#7AFFa1" radius={[4, 4, 0, 0]} name="Tasks" />
                                        <Bar dataKey="habits" fill="#FFF87C" radius={[4, 4, 0, 0]} name="Habits" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Right Side: Widgets */}
                <div className="db-pane-right">
                    
                    {/* Weather & Quote */}
                    <div className="widget-card weather-quote">
                        <div className="weather-row">
                            <Sun size={24} color="#FFF87C" />
                            <span>22°C, Perfect day to crush goals!</span>
                        </div>
                        <div className="quote-row">
                            <Quote size={16} opacity={0.5} />
                            <p>{quote}</p>
                        </div>
                    </div>

                    {/* Up Next */}
                    <div className="widget-card up-next">
                        <h3><Zap size={18}/> Today's Focus</h3>
                        {metrics.recentTodos.length > 0 && (
                            <div className="focus-item">
                                <div className="focus-icon"><CheckCircle2 size={16}/></div>
                                <div>
                                    <h5>{metrics.recentTodos[0].title}</h5>
                                    <p>Top Priority Task</p>
                                </div>
                            </div>
                        )}
                        {metrics.topHabit && (
                            <div className="focus-item">
                                <div className="focus-icon"><Flame size={16}/></div>
                                <div>
                                    <h5>{metrics.topHabit.title}</h5>
                                    <p>{metrics.topHabit.currentStreak} Day Streak!</p>
                                </div>
                            </div>
                        )}
                        <div className="focus-item">
                            <div className="focus-icon"><Dumbbell size={16}/></div>
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
                                {pomoActive ? <Pause size={20}/> : <Play size={20}/>}
                            </button>
                            <button className="pomo-btn reset" onClick={() => { setPomoActive(false); setPomoTime(25*60); }}>
                                <RotateCcw size={20}/>
                            </button>
                        </div>
                    </div>

                    {/* Mood Tracker */}
                    <div className="widget-card mood-tracker">
                        <h3>How are you feeling?</h3>
                        <div className="mood-emojis">
                            {[
                                {icon: <Frown size={28}/>, val: 1},
                                {icon: <Meh size={28}/>, val: 2},
                                {icon: <Smile size={28}/>, val: 3},
                                {icon: <Star size={28}/>, val: 4},
                                {icon: <Heart size={28}/>, val: 5}
                            ].map(m => (
                                <button 
                                    key={m.val}
                                    className={`mood-btn ${mood === m.val ? 'active' : ''}`}
                                    onClick={() => setMood(m.val)}
                                >
                                    {m.icon}
                                </button>
                            ))}
                        </div>
                    </div>

                </div>

            </section>
        </div>
    );
};

export default Dashboard;
