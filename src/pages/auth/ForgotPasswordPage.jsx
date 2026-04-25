import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Key, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { forgotPassword, verifyOtp, resetPassword } from '../../api/auth';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error('Please enter your email');
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      toast.success('OTP sent to your email!');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next
    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) return toast.error('Please enter the 6-digit OTP');
    setLoading(true);
    try {
      await verifyOtp(email, code, 'PASSWORD_RESET');
      toast.success('OTP verified!');
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await resetPassword(email, newPassword);
      setStep(4);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      {/* Left decorative panel (Same as Login/Register for uniformity) */}
      <div className="auth-left">
        <div className="auth-left-inner">
          <Link to="/" className="auth-logo" style={{ textDecoration: 'none', color: 'inherit' }}>ConnectSphere</Link>
          <div className="auth-tagline">Secure Account Recovery</div>

          <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              ['🔒', 'Secure OTP verification'],
              ['📧', 'Email-based password reset'],
              ['🛡️', 'Account protection & safety'],
              ['⚡', 'Instant recovery process'],
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
          
          {step < 4 && (
            <Link to="/login" className="flex items-center gap-2 text-sm text-muted mb-6 hover:text-amber transition-colors" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
              <ArrowLeft size={16} /> Back to Login
            </Link>
          )}

          {step === 1 && (
            <>
              <h1 className="auth-title">Forgot Password?</h1>
              <p className="auth-subtitle">Enter your email and we'll send you an OTP to reset your password.</p>
              <form onSubmit={handleSendOtp} style={{ marginTop: '2rem' }}>
                <div className="input-group">
                  <label className="input-label">Email address</label>
                  <div className="input-icon-wrapper">
                    <Mail size={15} className="input-icon" />
                    <input
                      className="input"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: '1rem' }}>
                  {loading ? <Spinner size="sm" /> : 'Send OTP'}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="auth-title">Verify OTP</h1>
              <p className="auth-subtitle">We sent a verification code to <strong>{email}</strong></p>
              <form onSubmit={handleVerifyOtp} style={{ marginTop: '2rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '2rem' }}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={inputRefs[idx]}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="otp-input"
                      autoFocus={idx === 0}
                      style={{
                        width: '42px',
                        height: '52px',
                        textAlign: 'center',
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        borderRadius: 'var(--r-md)',
                        border: '2px solid var(--border)',
                        background: 'var(--white)',
                        outline: 'none',
                        transition: 'all 0.2s',
                        color: 'var(--text-primary)'
                      }}
                    />
                  ))}
                </div>
                <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: '1rem' }}>
                  {loading ? <Spinner size="sm" /> : 'Verify OTP'}
                </button>
                <button type="button" className="btn btn-link btn-full mt-4" onClick={() => setStep(1)} style={{ fontSize: '0.85rem' }}>
                  Use a different email
                </button>
              </form>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="auth-title">New Password</h1>
              <p className="auth-subtitle">Choose a strong password for your account.</p>
              <form onSubmit={handleResetPassword} style={{ marginTop: '2rem' }}>
                <div className="input-group">
                  <label className="input-label">New Password</label>
                  <div className="input-icon-wrapper">
                    <Lock size={15} className="input-icon" />
                    <input
                      className="input"
                      type="password"
                      placeholder="Min 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="input-group" style={{ marginTop: '1rem' }}>
                  <label className="input-label">Confirm Password</label>
                  <div className="input-icon-wrapper">
                    <Lock size={15} className="input-icon" />
                    <input
                      className="input"
                      type="password"
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: '1.5rem' }}>
                  {loading ? <Spinner size="sm" /> : 'Reset Password'}
                </button>
              </form>
            </>
          )}

          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <div style={{ width: '64px', height: '64px', background: 'var(--success-bg)', color: 'var(--success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={36} />
                </div>
              </div>
              <h1 className="auth-title">Password Reset!</h1>
              <p className="auth-subtitle">Your password has been successfully updated. You can now log in with your new password.</p>
              <button 
                className="btn btn-primary btn-full btn-lg" 
                style={{ marginTop: '2rem' }}
                onClick={() => navigate('/login')}
              >
                Back to Login
              </button>
            </div>
          )}

        </div>
      </div>
      <style>{`
        .otp-input:focus {
          border-color: var(--amber) !important;
          box-shadow: 0 0 0 4px var(--amber-glow);
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}
