import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Globe, Users, Zap, Heart, MessageCircle, Search, Flame, Menu, X, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="landing-page">
      {/* Landing Header */}
      <header className="landing-header">
        <div className="landing-header-inner">
          <div className="navbar-brand" onClick={() => navigate('/explore')} style={{ cursor: 'pointer' }}>
            ConnectSphere
          </div>
          
          {/* Desktop Actions */}
          <div className="landing-nav-actions desktop-only">
            {isAuthenticated ? (
              <button className="btn btn-primary btn-sm" onClick={() => navigate(isAdmin ? '/admin' : '/feed')}>
                Go to {isAdmin ? 'Dashboard' : 'Feed'}
              </button>
            ) : (
              <>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/login')}>
                  Log In
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>
                  Join Now
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay">
          <div className="mobile-menu-content">
            <div className="mobile-menu-header">
              <div className="navbar-brand">ConnectSphere</div>
              <button className="close-menu" onClick={() => setIsMobileMenuOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="mobile-menu-links">
              {isAuthenticated ? (
                <button className="mobile-menu-btn primary" onClick={() => navigate(isAdmin ? '/admin' : '/feed')}>
                  Go to {isAdmin ? 'Dashboard' : 'Feed'}
                </button>
              ) : (
                <>
                  <button className="mobile-menu-btn primary" onClick={() => navigate('/login')}>
                    Log In
                  </button>
                  <button className="mobile-menu-btn primary" onClick={() => navigate('/register')}>
                    Sign Up Free
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={16} />
            <span>Social Networking Reimagined</span>
          </div>
          <h1 className="hero-title">Connect. Share. Inspire.</h1>
          <p className="hero-subtitle">
            Join a vibrant community where creativity meets connection. Share your moments, discover amazing content, and build meaningful relationships.
          </p>
          <div className="hero-buttons">
            <button className="btn btn-secondary" onClick={() => navigate('/explore')}>
              Explore First
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-card card-1">
            <Heart size={24} />
            <span>Authentic</span>
          </div>
          <div className="floating-card card-2">
            <Globe size={24} />
            <span>Global</span>
          </div>
          <div className="floating-card card-3">
            <Zap size={24} />
            <span>Fast</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Why Choose Us?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <Flame size={32} />
            </div>
            <h3>Trending Content</h3>
            <p>Discover what's hot right now. Real-time trending posts and hashtags keep you in the loop.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Users size={32} />
            </div>
            <h3>Build Community</h3>
            <p>Connect with like-minded people. Follow creators, engage authentically, and grow together.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <MessageCircle size={32} />
            </div>
            <h3>Real Conversations</h3>
            <p>Comment, reply, and discuss. Meaningful interactions that create lasting connections.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Search size={32} />
            </div>
            <h3>Smart Discovery</h3>
            <p>Explore by interests and hashtags. Find exactly what you're looking for instantly.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Heart size={32} />
            </div>
            <h3>Express Yourself</h3>
            <p>Share your thoughts, photos, and stories. Your voice matters in our community.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Zap size={32} />
            </div>
            <h3>Lightning Fast</h3>
            <p>Optimized for speed. Seamless experience on mobile, tablet, and desktop.</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stat-item">
          <h3>50K+</h3>
          <p>Active Users</p>
        </div>
        <div className="stat-item">
          <h3>500K+</h3>
          <p>Daily Posts</p>
        </div>
        <div className="stat-item">
          <h3>10M+</h3>
          <p>Interactions</p>
        </div>
      </section>

      {/* Simplified Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-logo">ConnectSphere</div>
          <p>© 2026 ConnectSphere. All rights reserved.</p>
          <div className="footer-links">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Help</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
