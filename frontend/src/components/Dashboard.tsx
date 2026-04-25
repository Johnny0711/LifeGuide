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
    Grid,
    List,
    MoreHorizontal,
    FileText,
    User,
    Hash,
    Loader2,
    Calendar,
    Phone,
    Mail,
    Plus
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

                const totalHabits = habits.length;
                const completedToday = habits.filter((h: any) =>
                    h.completedDates && h.completedDates.includes(todayStr)
                ).length;
                const habitScore = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

                const maxStreak = habits.reduce((max: number, h: any) =>
                    Math.max(max, h.currentStreak || 0), 0);

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

    return (
        <div className="db-container animate-fade-in">
            {/* Top Navbar specifically styled for the dashboard */}
            <header className="db-header">
                <div className="db-header-left">
                    <div className="db-logo">sf.</div>
                    <div className="db-title-group">
                        <button className="db-icon-btn"><Grid size={16} /></button>
                        <button className="db-icon-btn">←</button>
                        <h2>Dashboard</h2>
                    </div>
                </div>
                <div className="db-header-right">
                    <button className="db-pill-btn"><FileText size={14} /> Issue Credit</button>
                    <button className="db-pill-btn"><CheckCircle2 size={14} /> Edit</button>
                    <button className="db-pill-btn"><Pin size={14} /> Delete</button>
                    <div className="db-avatar">
                        <User size={18} />
                    </div>
                    <button className="db-icon-btn search-btn"><Search size={16} /></button>
                </div>
            </header>

            {/* The Huge Hero Section */}
            <section className="db-hero">
                <div className="db-hero-top">
                    <div className="db-score-main">
                        <div className="db-receipt-icon"><FileText size={28} /></div>
                        <div className="db-big-number">
                            <span className="currency">%</span>
                            {metrics.isLoading ? '0' : metrics.habitScore}
                            <span className="decimals">.00</span>
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
                            <div className="meta-icon"><Hash size={14}/></div>
                            <div className="meta-text">
                                <span className="label">Invoice Number</span>
                                <strong>INV-4905</strong>
                            </div>
                        </div>
                        <div className="db-meta-item">
                            <div className="meta-icon"><Loader2 size={14}/></div>
                            <div className="meta-text">
                                <span className="label">Status</span>
                                <strong>Posted</strong>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="db-hero-bottom">
                    <div className="db-pills-row">
                        <div className="db-pill green-pill">
                            <div className="pill-header">Paid</div>
                            <div className="pill-body">
                                <CheckCircle2 size={16}/> {metrics.pendingTasks} Tasks
                            </div>
                        </div>
                        <div className="db-pill yellow-pill">
                            <div className="pill-header">Credits</div>
                            <div className="pill-body">
                                <Flame size={16}/> {metrics.maxStreak} Streak
                            </div>
                        </div>
                        
                        <div className="db-progress-wrapper">
                            <div className="prog-header">Balance</div>
                            <div className="prog-track">
                                <div className="prog-fill" style={{width: `${metrics.habitScore}%`}}></div>
                            </div>
                            <button className="pay-btn">Pay Invoice</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bottom Split Area */}
            <section className="db-split-area">
                
                {/* Left Side: Modules (Invoice Lines equivalent) */}
                <div className="db-pane-left">
                    {/* The unique integrated tabs */}
                    <div className="db-pane-tabs">
                        <div className="tab active">Details</div>
                        <div className="tab">Docs</div>
                        <div className="tab">Notes</div>
                    </div>
                    
                    <div className="db-pane-content">
                        <div className="pane-header">
                            <div className="pane-title">
                                <h3>App modules</h3>
                                <span className="item-count">6 Items</span>
                            </div>
                            <div className="pane-search">
                                <Search size={14} /> <input type="text" placeholder="Search items" />
                            </div>
                            <div className="pane-actions">
                                <button className="act-btn"><Grid size={14}/></button>
                                <button className="act-btn"><List size={14}/></button>
                                <button className="act-btn"><MoreHorizontal size={14}/></button>
                            </div>
                        </div>

                        <div className="db-modules-grid">
                            <Link to="/todos" className="module-card">
                                <div className="mod-icon task-icon"><CheckCircle2 size={24}/></div>
                                <div className="mod-info">
                                    <h4>Tasks</h4>
                                    <p>$ 850</p>
                                </div>
                                <div className="mod-footer">
                                    <span className="qty">20 <small>Qty</small></span>
                                    <span className="store">Store 2</span>
                                    <button className="dot-btn">...</button>
                                </div>
                            </Link>

                            <Link to="/habits" className="module-card">
                                <div className="mod-icon habit-icon"><Flame size={24}/></div>
                                <div className="mod-info">
                                    <h4>Habits</h4>
                                    <p>$ 700</p>
                                </div>
                                <div className="mod-footer">
                                    <span className="qty">20 <small>Qty</small></span>
                                    <span className="store">Store 2</span>
                                    <button className="dot-btn">...</button>
                                </div>
                            </Link>

                            <Link to="/workouts" className="module-card">
                                <div className="mod-icon fit-icon"><Dumbbell size={24}/></div>
                                <div className="mod-info">
                                    <h4>Fitness</h4>
                                    <p>$ 1,600</p>
                                </div>
                                <div className="mod-footer">
                                    <span className="qty">10 <small>Qty</small></span>
                                    <span className="store">Warehouse 1</span>
                                    <button className="dot-btn">...</button>
                                </div>
                            </Link>
                            
                            <Link to="/pins" className="module-card">
                                <div className="mod-icon pin-icon"><Pin size={24}/></div>
                                <div className="mod-info">
                                    <h4>Pins</h4>
                                    <p>$ 1,100</p>
                                </div>
                                <div className="mod-footer">
                                    <span className="qty">12 <small>Qty</small></span>
                                    <span className="store">Store 1</span>
                                    <button className="dot-btn">...</button>
                                </div>
                            </Link>
                            
                            <Link to="/shopping-lists" className="module-card">
                                <div className="mod-icon shop-icon"><ShoppingBag size={24}/></div>
                                <div className="mod-info">
                                    <h4>Shopping</h4>
                                    <p>$ 1,300</p>
                                </div>
                                <div className="mod-footer">
                                    <span className="qty">5 <small>Qty</small></span>
                                    <span className="store">Store 3</span>
                                    <button className="dot-btn">...</button>
                                </div>
                            </Link>
                            
                            <Link to="/messages" className="module-card">
                                <div className="mod-icon mail-icon"><MessageSquare size={24}/></div>
                                <div className="mod-info">
                                    <h4>Inbox</h4>
                                    <p>$ 800</p>
                                </div>
                                <div className="mod-footer">
                                    <span className="qty">2 <small>Qty</small></span>
                                    <span className="store">Store 2</span>
                                    <button className="dot-btn">...</button>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Right Side: Activity */}
                <div className="db-pane-right">
                    <div className="activity-tab">Activity</div>
                    
                    <div className="activity-content">
                        <div className="act-toolbar">
                            <button><Calendar size={14}/></button>
                            <button><Plus size={14}/></button>
                            <button><Phone size={14}/></button>
                            <button><Mail size={14}/></button>
                            <button><Plus size={14}/></button>
                        </div>
                        
                        <div className="act-title-row">
                            <h3>Upcoming</h3>
                            <span className="count">12 <small>Activities</small></span>
                        </div>
                        
                        <div className="act-stack">
                            {/* Purple Card */}
                            <div className="act-card act-purple">
                                <div className="act-card-date">
                                    <div className="date-icon"><Calendar size={16}/></div>
                                    <div className="date-text">12 Feb<br/>at 11 pm</div>
                                </div>
                                <div className="act-card-info">
                                    <h4>Send Payment Reminder</h4>
                                    <div className="act-user">
                                        <div className="mini-avatar"><User size={10}/></div>
                                        <span><strong>Jessi Johnson</strong> sent a payment reminder</span>
                                    </div>
                                </div>
                                <button className="act-go">↗</button>
                            </div>
                            
                            {/* Yellow Card overlapping */}
                            <div className="act-card act-yellow">
                                <div className="act-card-date">
                                    <div className="date-icon"><Phone size={16}/></div>
                                    <div className="date-text">13 Feb<br/>at 12 pm</div>
                                </div>
                                <div className="act-card-info">
                                    <h4>Call about the contract</h4>
                                    <div className="act-user">
                                        <div className="mini-avatar"><User size={10}/></div>
                                        <span><strong>Brian Carpenter</strong> Google meets</span>
                                    </div>
                                </div>
                                <button className="act-go">↗</button>
                            </div>
                        </div>
                    </div>
                </div>

            </section>
        </div>
    );
};

export default Dashboard;
