import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '../api/auth';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { 
      return JSON.parse(localStorage.getItem('user'));
     } catch { 
      return null; 
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  const saveSession = (userData, jwt) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', jwt);
    setUser(userData);
    setToken(jwt);
  };

  const clearSession = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await apiLogin(email, password);
      // Backend uses accessToken, userId, username, role
      // Handle both isPasswordSet and passwordSet due to Jackson naming conventions
      const { 
        accessToken, userId, username, role, fullName, profilePicUrl, 
        isPasswordSet, passwordSet, isElite, elite 
      } = res.data.data;
      
      const hasPassword = isPasswordSet !== undefined ? isPasswordSet : passwordSet;
      const eliteStatus = isElite !== undefined ? isElite : elite;
      
      const userData = { 
        userId, username, role, email, fullName, 
        profilePicUrl, isPasswordSet: !!hasPassword, isElite: !!eliteStatus 
      };
      saveSession(userData, accessToken);
      
      toast.success(`Welcome back, ${username || email}!`, { id: 'login-success' });
      return { success: true, role };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const res = await apiRegister(formData);
      toast.success('Account created! Please verify your email.');
      return res;
    } catch (err) {
      // Re-throw to let the caller handle validation errors
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try { 
      await apiLogout(token); 
    } catch {}
    clearSession();
    toast.success('Logged out successfully');
    window.location.href = '/login';
  };

  // Called after OAuth redirect with ?token=xxx in URL
  const handleOAuthSuccess = (jwt, userData) => {
    saveSession(userData, jwt);
  };

  const updateUser = (newData) => {
    const updatedUser = { ...user, ...newData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const isAdmin = user?.role === 'ADMIN';
  const isModerator = user?.role === 'MODERATOR';
  const isStaff = isAdmin || isModerator;
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{
      user, token, loading, isAdmin, isModerator, isStaff, isAuthenticated,
      login, register, logout, handleOAuthSuccess, saveSession, updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
