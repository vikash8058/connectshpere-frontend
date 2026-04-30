import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';

// Spring Boot sends ?token=xxx&userId=yyy&username=zzz after OAuth success
export default function OAuthCallback() {
  const [params]  = useSearchParams();
  const { saveSession } = useAuth();
  const navigate  = useNavigate();

  useEffect(() => {
    const token    = params.get('token');
    const userId   = params.get('userId');
    const username = params.get('username');
    const role     = params.get('role') || 'USER';
    const email    = params.get('email') || '';
    const isPasswordSet = params.get('isPasswordSet') === 'true';
    const profilePicUrl = params.get('profilePicUrl') || '';
    const isElite = params.get('isElite') === 'true';
    const fullName = params.get('fullName') || '';

    if (token) {
      const userData = { 
        userId: Number(userId), username, role, email, 
        isPasswordSet, profilePicUrl, fullName, isElite 
      };
      saveSession(userData, token);
      toast.success(`Welcome, ${username}!`, { id: 'oauth-success' });
      navigate(role === 'ADMIN' ? '/admin' : '/feed', { replace: true });
    } else {
      toast.error('OAuth login failed. Please try again.');
      navigate('/login', { replace: true });
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
      <Spinner size="lg" />
      <p style={{ color: 'var(--text-muted)' }}>Completing sign-in…</p>
    </div>
  );
}
