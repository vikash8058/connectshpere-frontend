import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';
import { verifyOtp, resendOtp } from '../../api/auth';
import toast from 'react-hot-toast';
import Spinner from '../../components/common/Spinner';

export default function VerifyOTPPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = new URLSearchParams(location.search).get('email');

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(30);
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    if (!email) {
      toast.error('Invalid session');
      navigate('/register');
    }
  }, [email, navigate]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next
    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      toast.error('Please enter full 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtp(email, code, 'EMAIL_VERIFICATION');
      toast.success('Email verified successfully! You can now log in.');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification failed. Please check the code.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setResending(true);
    try {
      await resendOtp(email);
      toast.success('New code sent to your email');
      setTimer(30);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-inner">
          <ShieldCheck size={80} color="white" strokeWidth={1.5} />
          <h2 className="auth-logo" style={{ marginTop: '1.5rem' }}>Security First</h2>
          <p className="auth-tagline">Verification protects your privacy and keeps ConnectSphere safe for everyone.</p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ width: '64px', height: '64px', background: 'var(--amber-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--amber)' }}>
              <ShieldCheck size={32} />
            </div>
            <h1 className="auth-title">Verify your email</h1>
            <p className="auth-subtitle">We've sent a 6-digit code to <br /><strong>{email}</strong></p>
          </div>

          <form onSubmit={handleVerify}>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginBottom: '2.5rem' }}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={inputRefs[idx]}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  style={{
                    width: '45px',
                    height: '55px',
                    textAlign: 'center',
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    borderRadius: 'var(--r-md)',
                    border: '2px solid var(--border)',
                    background: 'var(--white)',
                    outline: 'none',
                    transition: 'all 0.2s',
                    color: 'var(--text-primary)'
                  }}
                  className="otp-input"
                  autoFocus={idx === 0}
                />
              ))}
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <Spinner size="sm" /> : 'Verify Account'}
            </button>
          </form>

          <div style={{ marginTop: '2rem' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Didn't receive the code?
            </p>
            <button 
              onClick={handleResend}
              disabled={timer > 0 || resending}
              style={{ 
                marginTop: '0.5rem',
                color: timer > 0 ? 'var(--text-light)' : 'var(--amber)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                margin: '0.5rem auto 0'
              }}
            >
              {resending ? <Spinner size="sm" /> : <RefreshCw size={16} />}
              {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
            </button>
          </div>

          <button 
            onClick={() => navigate('/register')}
            style={{ 
              marginTop: '2.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--text-secondary)',
              fontSize: '0.88rem',
              margin: '2.5rem auto 0'
            }}
          >
            <ArrowLeft size={16} /> Use a different email
          </button>
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
