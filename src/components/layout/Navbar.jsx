import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Bell, LogOut, User, Settings, Shield, Menu, X, PlusSquare, ArrowLeft, Crown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { searchUsers } from '../../api/auth';
import Avatar from '../common/Avatar';
import NotificationBell from '../notification/NotificationBell';

export default function Navbar({ onNewPost }) {
  const { user, logout, isAdmin, isStaff, isAuthenticated } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const searchTimer = useRef(null);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setShowResults(false);
      navigate(`/explore?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    
    if (searchTimer.current) clearTimeout(searchTimer.current);

    if (val.trim().length > 0) {
      setShowResults(true);
      setIsSearching(true);
      searchTimer.current = setTimeout(async () => {
        try {
          const res = await searchUsers(val.trim());
          setResults(res.data?.data || []);
        } catch (err) {
          console.error("Search error:", err);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      setResults([]);
      setShowResults(false);
    }
  };

  const handleBrandClick = () => {
    navigate('/');
  };

  return (
    <nav className="navbar">
      {/* Column 1: Brand & Back Button */}
      <div className="navbar-left" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button 
          className="navbar-mobile-only" 
          onClick={() => navigate(-1)}
          style={{ 
            background: 'none', 
            border: 'none', 
            padding: '0.4rem', 
            color: 'var(--text-primary)', 
            cursor: 'pointer',
            marginLeft: '-0.5rem'
          }}
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="navbar-brand" onClick={handleBrandClick} style={{ cursor: 'pointer' }}>
          ConnectSphere
        </div>
      </div>

      {/* Column 2: Search bar */}
      <div className="navbar-search navbar-desktop-only" style={{ position: 'relative' }}>
        <form onSubmit={handleSearch} style={{ width: '100%' }}>
          <div className="input-icon-wrapper" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Search size={16} className="input-icon" style={{ left: '1.2rem' }} />
            <input
              className="input"
              style={{ 
                padding: '0.65rem 3.5rem 0.65rem 3rem', 
                borderRadius: 'var(--r-full)', 
                fontSize: '0.9rem',
                width: '100%',
                background: 'var(--cream-100)',
                border: '1px solid var(--border)'
              }}
              placeholder="Search people by name or username…"
              value={query}
              onChange={handleInputChange}
              onFocus={() => query.trim() && setShowResults(true)}
            />
            <button type="submit" className="search-submit-btn" style={{ position: 'absolute', right: '6px', background: 'var(--amber)', color: '#fff', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
              <Search size={16} />
            </button>
          </div>
        </form>

        {/* Search Results Dropdown */}
        {showResults && (
          <>
            <div 
              style={{ position: 'fixed', inset: 0, zIndex: 90 }} 
              onClick={() => setShowResults(false)} 
            />
            <div className="dropdown-menu" style={{ 
              position: 'absolute', 
              top: '100%', 
              left: 0, 
              right: 0, 
              marginTop: '0.5rem', 
              zIndex: 100, 
              maxHeight: '400px', 
              overflowY: 'auto',
              padding: '0.5rem 0'
            }}>
              {isSearching ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Searching...
                </div>
              ) : results.length > 0 ? (
                results.map(u => (
                  <div 
                    key={u.userId} 
                    className="dropdown-item" 
                    onClick={() => {
                      setShowResults(false);
                      setQuery('');
                      navigate(`/profile/${u.userId}`);
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1rem' }}
                  >
                    <Avatar src={u.profilePicUrl} name={u.username} size="sm" />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{u.fullName || u.username}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{u.username}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No users found for "{query}"
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Column 3: Right side */}
      <div className="navbar-right" style={{ paddingRight: '1.5rem', justifyContent: 'flex-end' }}>
        {isAuthenticated ? (
          <>
            {/* Authenticated user: show notification bell and avatar - desktop only */}
            <div className="navbar-desktop-only flex items-center gap-3">
              <button 
                className="btn btn-primary" 
                style={{ 
                  borderRadius: 'var(--r-full)', 
                  padding: '0.5rem 1.25rem', 
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)'
                }}
                onClick={onNewPost}
              >
                <PlusSquare size={18} />
                <span>Post</span>
              </button>

              <NotificationBell />

              {/* User avatar dropdown */}
              <div className="dropdown">
                <div onClick={() => setShowMenu(!showMenu)} style={{ cursor: 'pointer' }}>
                  <Avatar src={user?.profilePicUrl} name={user?.username || user?.fullName} size="sm" />
                </div>

                {showMenu && (
                  <>
                    {/* Backdrop */}
                    <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={() => setShowMenu(false)} />
                    <div className="dropdown-menu" style={{ zIndex: 200 }}>
                      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)' }}>
                        <div className="font-medium text-sm">{user?.username}</div>
                        <div className="text-xs text-muted">{user?.email}</div>
                      </div>
                      <Link to={`/profile/${user?.userId}`} className="dropdown-item" onClick={() => setShowMenu(false)}>
                        <User size={15} /> My Profile
                      </Link>
                      <Link to="/settings" className="dropdown-item" onClick={() => setShowMenu(false)}>
                        <Settings size={15} /> Settings
                      </Link>
                      <Link to="/elite" className="dropdown-item" style={{ color: 'var(--amber)' }} onClick={() => setShowMenu(false)}>
                        <Crown size={15} /> Elite Status
                      </Link>
                      {isStaff && (
                        <Link to="/admin" className="dropdown-item" onClick={() => setShowMenu(false)}>
                          <Shield size={15} /> Staff Panel
                        </Link>
                      )}
                      <div className="dropdown-item danger" onClick={() => { logout(); setShowMenu(false); }}>
                        <LogOut size={15} /> Logout
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Mobile hamburger menu - only show on mobile */}
            <div className="navbar-mobile-only">
              <button 
                className="navbar-hamburger"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
              </button>

              {showMobileMenu && (
                <>
                  <div className="navbar-mobile-backdrop" onClick={() => setShowMobileMenu(false)} />
                  <div className="navbar-mobile-menu">
                    <div className="navbar-mobile-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Avatar src={user?.profilePicUrl} name={user?.username} size="sm" />
                        <div style={{ minWidth: 0 }}>
                          <div className="font-bold text-sm flex items-center gap-1">
                            <span className="truncate">{user?.username}</span> 
                            {user?.isElite && <Crown size={14} className="text-amber" fill="currentColor" />}
                          </div>
                          <div className="text-xs text-muted truncate">{user?.email}</div>
                        </div>
                      </div>
                      <button 
                        className="navbar-close-btn"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <X size={24} />
                      </button>
                    </div>
                    <Link to={`/profile/${user?.userId}`} className="navbar-mobile-item" onClick={() => setShowMobileMenu(false)}>
                      <User size={18} /> My Profile
                    </Link>
                    <Link to="/elite" className="navbar-mobile-item" style={{ color: 'var(--amber)' }} onClick={() => setShowMobileMenu(false)}>
                      <Crown size={18} /> Elite Status
                    </Link>
                    <Link to="/settings" className="navbar-mobile-item" onClick={() => setShowMobileMenu(false)}>
                      <Settings size={18} /> Settings
                    </Link>
                    {isStaff && (
                      <Link to="/admin" className="navbar-mobile-item" onClick={() => setShowMobileMenu(false)}>
                        <Shield size={18} /> Staff Panel
                      </Link>
                    )}
                    <div className="navbar-mobile-item danger" onClick={() => { logout(); setShowMobileMenu(false); }}>
                      <LogOut size={18} /> Logout
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Guest user: show Login and Sign Up buttons - desktop only */}
            <div className="navbar-desktop-only flex items-center gap-3">
              <button
                className="btn btn-secondary"
                onClick={() => navigate('/login')}
                style={{ fontSize: '0.9rem' }}
              >
                Log In
              </button>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/register')}
                style={{ fontSize: '0.9rem' }}
              >
                Sign Up
              </button>
            </div>

            {/* Mobile hamburger menu - only show on mobile */}
            <div className="navbar-mobile-only">
              <button 
                className="navbar-hamburger"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
              </button>

              {showMobileMenu && (
                <>
                  <div className="navbar-mobile-backdrop" onClick={() => setShowMobileMenu(false)} />
                  <div className="navbar-mobile-menu">
                    <div className="navbar-mobile-header">
                      <button 
                        className="navbar-close-btn"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <X size={24} />
                      </button>
                    </div>
                    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <button
                        className="btn btn-primary"
                        style={{ width: '100%', borderRadius: 'var(--r-full)' }}
                        onClick={() => { navigate('/login'); setShowMobileMenu(false); }}
                      >
                        Log In
                      </button>
                      <button
                        className="btn btn-secondary"
                        style={{ width: '100%', borderRadius: 'var(--r-full)' }}
                        onClick={() => { navigate('/register'); setShowMobileMenu(false); }}
                      >
                        Sign Up
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
