import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Compass, Bell, User, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import RightPanel from './RightPanel';
import PostForm from '../post/PostForm';

export default function AppLayout() {
  const [showPostModal, setShowPostModal] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const mobileLinks = isAuthenticated ? [
    { to: '/feed',          label: 'Home',    Icon: Home },
    { to: '/explore',       label: 'Explore', Icon: Compass },
    { to: '/notifications', label: 'Alerts',  Icon: Bell },
    { to: `/profile/${user?.userId}`, label: 'Profile', Icon: User },
  ] : [
    { to: '/explore',       label: 'Explore', Icon: Compass },
  ];

  return (
    <>
      <Navbar onNewPost={() => setShowPostModal(true)} />
      <div className="app-shell">
        <Sidebar />
        <main className="app-main">
          <Outlet />
        </main>
        <RightPanel />
      </div>

      {/* Mobile bottom nav */}
      <nav className="mobile-nav">
        {mobileLinks.map(({ to, label, Icon }) => (
          <div
            key={to}
            className={`mobile-nav-item${location.pathname === to ? ' active' : ''}`}
            onClick={() => navigate(to)}
          >
            <Icon size={20} />
            <span>{label}</span>
          </div>
        ))}
        {/* Center new post button */}
        <div className="mobile-nav-item" onClick={() => isAuthenticated ? setShowPostModal(true) : navigate('/login')}>
          <Plus size={20} />
          <span>Post</span>
        </div>
      </nav>

      {/* New post modal */}
      {showPostModal && (
        <PostForm onClose={() => setShowPostModal(false)} onSuccess={() => setShowPostModal(false)} />
      )}
    </>
  );
}
