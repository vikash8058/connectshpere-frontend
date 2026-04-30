import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, UserCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { getGoogleOAuthUrl, getGithubOAuthUrl } from '../../api/auth';
import Spinner from '../../components/common/Spinner';

const Field = ({ name, label, icon: Icon, type = 'text', placeholder, value, onChange, error, extra }) => (
  <div className="input-group">
    <label className="input-label">{label}</label>
    <div className="input-icon-wrapper" style={{ position: 'relative' }}>
      <Icon size={15} className="input-icon" />
      <input
        className={`input${error ? ' error' : ''}`}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={extra ? { paddingRight: '2.5rem' } : {}}
      />
      {extra}
    </div>
    {error && <span style={{ fontSize: '0.78rem', color: 'var(--error)' }}>{error}</span>}
  </div>
);

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '', username: '', email: '', password: '', confirmPassword: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [oauthLoading, setOauthLoading] = useState(null); // 'google' or 'github' (tracks social login state)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setErrors({});
    
    try {
      const res = await register(form);
      if (res?.data?.success) {
        navigate(`/verify-otp?email=${encodeURIComponent(form.email.trim())}`);
      }
    } catch (err) {
      console.error("Registration error:", err);
      // Handle backend validation errors
      if (err.response?.status === 400) {
        // If backend returns field-specific errors
        if (err.response?.data?.data && typeof err.response.data.data === 'object') {
          setErrors(err.response.data.data);
        } else {
          // Otherwise show general message
          const msg = err.response?.data?.message || 'Registration failed. Please check your details.';
          toast.error(msg);
        }
      } else {
        // Network or other errors
        const msg = err.response?.data?.message || 'Registration failed. Please try again.';
        toast.error(msg);
      }
    }
  };

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-left">
        <div className="auth-left-inner">
          <div className="auth-logo">ConnectSphere</div>
          <div className="auth-tagline">Join millions sharing moments</div>
          <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: 280 }}>
            {[
              ['🌍', 'Post with public, followers-only, or private visibility'],
              ['📱', 'Upload stories that auto-expire in 24 hours'],
              ['🏷️', 'Discover trending hashtags and connect with people'],
              ['🔔', 'Get notified instantly for likes, comments & follows'],
            ].map(([icon, text]) => (
              <div key={text} className="auth-feature">
                <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{icon}</span>
                <span style={{ fontSize: '0.88rem' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="auth-right">
        <div className="auth-card">
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Free forever · No credit card needed</p>

          {/* OAuth */}
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
            {oauthLoading === 'google' ? 'Connecting...' : 'Sign up with Google'}
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
            {oauthLoading === 'github' ? 'Connecting...' : 'Sign up with GitHub'}
          </button>

          <div className="divider-text">or register with email</div>

          <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
            <Field 
              name="fullName"  
              label="Full Name"  
              icon={UserCircle} 
              placeholder="Enter your full name" 
              value={form.fullName}
              onChange={set('fullName')}
              error={errors.fullName}
            />
            <Field 
              name="username"  
              label="Username"   
              icon={User}       
              placeholder="Enter your username" 
              value={form.username}
              onChange={set('username')}
              error={errors.username}
            />
            <Field 
              name="email"     
              label="Email"      
              icon={Mail}       
              placeholder="you@example.com" 
              type="email" 
              value={form.email}
              onChange={set('email')}
              error={errors.email}
            />

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-icon-wrapper" style={{ position: 'relative' }}>
                <Lock size={15} className="input-icon" />
                <input
                  className={`input${errors.password ? ' error' : ''}`}
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={set('password')}
                  style={{ paddingRight: '2.5rem' }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <span style={{ fontSize: '0.78rem', color: 'var(--error)' }}>{errors.password}</span>}
            </div>

            <div className="input-group">
              <label className="input-label">Confirm Password</label>
              <div className="input-icon-wrapper">
                <Lock size={15} className="input-icon" />
                <input
                  className={`input${errors.confirmPassword ? ' error' : ''}`}
                  type="password"
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                />
              </div>
              {errors.confirmPassword && <span style={{ fontSize: '0.78rem', color: 'var(--error)' }}>{errors.confirmPassword}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: '0.5rem' }}>
              {loading ? <Spinner size="sm" /> : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            By signing up, you agree to our Terms of Service.
          </p>
          <p style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--amber)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
