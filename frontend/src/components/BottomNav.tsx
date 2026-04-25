import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckCircle2, Dumbbell, ShoppingBag, User } from 'lucide-react';
import './BottomNav.css';

const BottomNav: React.FC = () => {
  return (
    <nav className="bottom-nav hide-desktop">
      <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <LayoutDashboard size={24} />
        <span>Home</span>
      </NavLink>
      <NavLink to="/todos" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <CheckCircle2 size={24} />
        <span>Tasks</span>
      </NavLink>
      <NavLink to="/workouts" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Dumbbell size={24} />
        <span>Fitness</span>
      </NavLink>
      <NavLink to="/shopping-lists" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <ShoppingBag size={24} />
        <span>Shopping</span>
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <User size={24} />
        <span>Me</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
