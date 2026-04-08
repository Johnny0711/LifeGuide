import React from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, Flame, Dumbbell, Pin, ShoppingCart } from 'lucide-react';
import './Dashboard.css';

const Dashboard: React.FC = () => {
    // No longer parsing full widgets, using quick launcher

    return (
        <div className="dashboard-container animate-fade-in">
            <header className="dashboard-header">
                <h1>LifeGuide Hub</h1>
                <p>Welcome to your personal operating system. Choose an app to begin.</p>
            </header>

            <div className="app-launcher-grid">
                <Link to="/todos" className="launcher-card">
                    <div className="launcher-icon-container" style={{ background: 'var(--accent-glow)', color: 'var(--accent-primary)' }}>
                        <CheckSquare size={32} />
                    </div>
                    <h2>Tasks</h2>
                    <p>Manage your daily to-dos and stay productive.</p>
                </Link>

                <Link to="/habits" className="launcher-card">
                    <div className="launcher-icon-container" style={{ background: 'rgba(245, 158, 11, 0.2)', color: 'var(--warning)' }}>
                        <Flame size={32} />
                    </div>
                    <h2>Habits</h2>
                    <p>Build and track your daily streaks.</p>
                </Link>

                <Link to="/workouts" className="launcher-card">
                    <div className="launcher-icon-container" style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)' }}>
                        <Dumbbell size={32} />
                    </div>
                    <h2>Fitness</h2>
                    <p>Track your workouts, BMI, and weight progress.</p>
                </Link>

                <Link to="/pins" className="launcher-card">
                    <div className="launcher-icon-container" style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)' }}>
                        <Pin size={32} />
                    </div>
                    <h2>Pins</h2>
                    <p>Save notes, ideas, and important links.</p>
                </Link>

                <Link to="/shopping-lists" className="launcher-card">
                    <div className="launcher-icon-container" style={{ background: 'rgba(139, 92, 246, 0.2)', color: 'var(--accent-secondary)' }}>
                        <ShoppingCart size={32} />
                    </div>
                    <h2>Shopping Lists</h2>
                    <p>Create and share shopping lists with friends.</p>
                </Link>
            </div>
        </div>
    );
};

export default Dashboard;
