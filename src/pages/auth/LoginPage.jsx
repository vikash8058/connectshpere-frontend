import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getGoogleOAuthUrl, getGithubOAuthUrl } from '../../api/auth';
import Spinner from '../../components/common/Spinner';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate           = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [errors, setErrors]     = useState({});
  const [oauthLoading, setOauthLoading] = useState(null); // 'google' or 'github'
  const [apiError, setApiError] = useState(() => {
    // Check if we were redirected back with an error (e.g. deactivated account)
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    if (error === 'ACCOUNT_SUSPENDED') return 'Your account has been suspended by an administrator.';
    if (error) return 'Authentication failed. Please try again.';
    return null;
  });

  const handleBrandClick = () => {
    navigate('/');
  };

  const validate = () => {
    const e = {};
    if (!email.trim())    e.email    = 'Email is required';
    if (!password)        e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setApiError(null);
    const res = await login(email.trim(), password);
    if (res.success) {
      navigate(res.role === 'ADMIN' ? '/admin' : '/feed');
    } else {
      setApiError(res.message || 'Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      {/* Left decorative panel */}
      <div className="auth-left">
        <div className="auth-left-inner">
          <Link to="/" className="auth-logo" style={{ textDecoration: 'none', color: 'inherit' }}>ConnectSphere</Link>
          <div className="auth-tagline">Share Moments · Build Connections</div>

          <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              ['✨', 'Share posts, photos & stories'],
              ['💬', 'Threaded comments & reactions'],
              ['🔔', 'Real-time notifications'],
              ['#️⃣', 'Trending hashtags & explore'],
            ].map(([icon, text]) => (
              <div key={text} className="auth-feature">
                <span style={{ fontSize: '1.2rem' }}>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>

          {/* Decorative circles */}
          <div style={{ position: 'absolute', bottom: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-right">
        <div className="auth-card">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your ConnectSphere account</p>

          {/* OAuth buttons */}
          <button 
            className="oauth-btn" 
            disabled={oauthLoading !== null}
            onClick={() => {
              setOauthLoading('google');
              window.location.href = getGoogleOAuthUrl();
            }}
          >
            {oauthLoading === 'google' ? (
              <Spinner size="sm" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
            )}
            {oauthLoading === 'google' ? 'Connecting...' : 'Continue with Google'}
          </button>
 
          <button 
            className="oauth-btn" 
            disabled={oauthLoading !== null}
            onClick={() => {
              setOauthLoading('github');
              window.location.href = getGithubOAuthUrl();
            }}
          >
            {oauthLoading === 'github' ? (
              <Spinner size="sm" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            )}
            {oauthLoading === 'github' ? 'Connecting...' : 'Continue with GitHub'}
          </button>

          <div className="divider-text">or sign in with email</div>

          {/* Email/password form */}
          <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
            <div className="input-group">
              <label className="input-label">Email address</label>
              <div className="input-icon-wrapper">
                <Mail size={15} className="input-icon" />
                <input
                  className={`input${errors.email ? ' error' : ''}`}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              {errors.email && <span style={{ fontSize: '0.78rem', color: 'var(--error)' }}>{errors.email}</span>}
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-icon-wrapper" style={{ position: 'relative' }}>
                <Lock size={15} className="input-icon" />
                <input
                  className={`input${errors.password ? ' error' : ''}`}
                  type={showPw ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <span style={{ fontSize: '0.78rem', color: 'var(--error)' }}>{errors.password}</span>}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                <Link to="/forgot-password" style={{ fontSize: '0.78rem', color: 'var(--amber)', fontWeight: 500, textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </div>
            </div>

            {apiError && (
              <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: '8px', color: '#c53030', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.1rem' }}>⚠️</span>
                {apiError}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: '0.5rem' }}>
              {loading ? <Spinner size="sm" /> : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--amber)', fontWeight: 600 }}>Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
