import React from 'react';
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
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div className="dashboard-container animate-fade-in">
            <header className="dashboard-hero">
                <div className="hero-content">
                    <span className="hero-badge">LifeGuide Hub</span>
                    <h1>{getGreeting()}, <span>{user?.name || 'Explorer'}</span></h1>
                    <p>Your personal ecosystem is ready. Where shall we focus today?</p>
                </div>
            </header>

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
