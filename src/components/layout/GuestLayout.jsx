import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import RightPanel from './RightPanel';
import Sidebar from './Sidebar';

export default function GuestLayout() {
  const { isAuthenticated, user } = useAuth();

  return (
    <>
      <Navbar />
      <div className="app-shell">
        {/* Sidebar - only for authenticated users */}
        {isAuthenticated && <Sidebar />}

        {/* Main content */}
        <main className="app-main">
          <Outlet />
        </main>

        {/* Right panel - only for authenticated users */}
        {isAuthenticated && <RightPanel />}
      </div>

      {/* Mobile bottom nav - only for authenticated users */}
      {isAuthenticated && (
        <nav className="mobile-nav">
          {/* Navigation will be handled by parent AppLayout if authenticated */}
        </nav>
      )}
    </>
  );
}
