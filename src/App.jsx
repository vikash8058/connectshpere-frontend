import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import LoginPage      from './pages/auth/LoginPage';
import RegisterPage   from './pages/auth/RegisterPage';
import VerifyOTPPage  from './pages/auth/VerifyOTPPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import OAuthCallback  from './pages/auth/OAuthCallback';
import AppLayout      from './components/layout/AppLayout';
import GuestLayout   from './components/layout/GuestLayout';
import FeedPage          from './pages/FeedPage';
import ExplorePage       from './pages/ExplorePage';
import ProfilePage       from './pages/ProfilePage';
import TrendingPage      from './pages/TrendingPage';
import { PostDetailPage } from './pages/PostDetailPage';
import NotificationsPage from './pages/NotificationsPage';
import HashtagPage       from './pages/HashtagPage';
import SettingsPage      from './pages/SettingsPage';
import FollowersPage     from './pages/FollowersPage';
import MutualFriendsPage from './pages/MutualFriendsPage';
import AdminLayout   from './pages/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import UsersPage     from './pages/admin/UsersPage';
import PostsPage     from './pages/admin/PostsPage';
import ReportsPage   from './pages/admin/ReportsPage';
import BroadcastPage from './pages/admin/BroadcastPage';
import LandingPage    from './pages/LandingPage';
import ElitePage      from './pages/ElitePage';

function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function RequireStaff({ children }) {
  const { isAuthenticated, isStaff } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isStaff)         return <Navigate to="/feed" replace />;
  return children;
}

function GuestOnly({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();
  if (isAuthenticated) return <Navigate to={isAdmin ? "/admin" : "/feed"} replace />;
  return children;
}

function AppRoutes() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      {/* AUTH ROUTES (Guest only) */}
      <Route path="/login"    element={<GuestOnly><LoginPage /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />
      <Route path="/verify-otp" element={<GuestOnly><VerifyOTPPage /></GuestOnly>} />
      <Route path="/forgot-password" element={<GuestOnly><ForgotPasswordPage /></GuestOnly>} />
      <Route path="/oauth/callback"  element={<OAuthCallback />} />
      <Route path="/oauth2/callback" element={<OAuthCallback />} />

      {/* SIDEBAR-ENABLED ROUTES */}
      <Route element={<AppLayout />}>
        <Route path="/feed"                      element={<RequireAuth><FeedPage /></RequireAuth>} />
        <Route path="/explore"                   element={<ExplorePage />} />
        <Route path="/trending"                  element={<TrendingPage />} />
        <Route path="/notifications"             element={<RequireAuth><NotificationsPage /></RequireAuth>} />
        <Route path="/settings"                  element={<RequireAuth><SettingsPage /></RequireAuth>} />
        <Route path="/profile/:userId"           element={<ProfilePage />} />
        <Route path="/profile/:userId/followers" element={<FollowersPage />} />
        <Route path="/profile/:userId/following" element={<FollowersPage />} />
        <Route path="/profile/:userId/mutual"    element={<RequireAuth><MutualFriendsPage /></RequireAuth>} />
        <Route path="/hashtag/:tag"              element={<HashtagPage />} />
        <Route path="/post/:postId"              element={<PostDetailPage />} />
        <Route path="/elite"                     element={<RequireAuth><ElitePage /></RequireAuth>} />
      </Route>

      {/* ADMIN/STAFF ROUTES */}
      <Route path="/admin" element={<RequireStaff><AdminLayout /></RequireStaff>}>
        <Route index            element={<DashboardPage />} />
        <Route path="users"     element={<UsersPage />} />
        <Route path="posts"     element={<PostsPage />} />
        <Route path="reports"   element={<ReportsPage />} />
        <Route path="broadcast" element={<BroadcastPage />} />
      </Route>

      <Route path="*" element={
        <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'1rem' }}>
          <div style={{ fontSize:'4rem' }}>🔍</div>
          <h2 style={{ fontFamily:'var(--font-display)' }}>Page Not Found</h2>
          <a href="/feed" style={{ background:'var(--amber)', color:'#fff', padding:'0.6rem 1.5rem', borderRadius:'var(--r-full)', fontWeight:600 }}>Go Home</a>
        </div>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'var(--font-body)',
              fontSize: '0.88rem',
              background: '#fff',
              color: '#2d1f0f',
              border: '1px solid #e8d5b8',
              boxShadow: '0 4px 20px rgba(92,61,30,0.12)',
              borderRadius: '12px',
            },
            success: { iconTheme: { primary: '#c47b1e', secondary: 'white' } },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
