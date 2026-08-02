import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../services/axiosInstance';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('gitpeek_token') || null);
  const [loading, setLoading] = useState(true);

  // Configure axios auth header whenever token changes
  useEffect(() => {
    if (token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('gitpeek_token', token);
      if (!user) {
        fetchCurrentUser();
      }
    } else {
      delete axiosInstance.defaults.headers.common['Authorization'];
      localStorage.removeItem('gitpeek_token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);


  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/auth/me');
      setUser(res.data);
    } catch (err) {
      console.error('Failed to fetch user session:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const applyToken = (newToken) => {
    if (newToken) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      localStorage.setItem('gitpeek_token', newToken);
    } else {
      delete axiosInstance.defaults.headers.common['Authorization'];
      localStorage.removeItem('gitpeek_token');
    }
    setToken(newToken);
  };

  const login = async (email, password) => {
    const res = await axiosInstance.post('/auth/login', { email, password });
    const { token: newToken, ...userData } = res.data;
    applyToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password, githubUsername) => {
    const res = await axiosInstance.post('/auth/register', {
      name,
      email,
      password,
      githubUsername,
    });
    const { token: newToken, ...userData } = res.data;
    applyToken(newToken);
    setUser(userData);
    return userData;
  };

  const loginWithGithubDirect = async (githubUsername) => {
    const res = await axiosInstance.post('/auth/github/callback', { githubUsername });
    const { token: newToken, ...userData } = res.data;
    applyToken(newToken);
    setUser(userData);
    return userData;
  };

  const handleOAuthCallback = async (code) => {
    const res = await axiosInstance.post('/auth/github/callback', { code });
    const { token: newToken, ...userData } = res.data;
    applyToken(newToken);
    setUser(userData);
    return userData;
  };


  const linkGithubAccount = async (githubUsername) => {
    const res = await axiosInstance.post('/auth/link-github', { githubUsername });
    setUser(res.data);
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('gitpeek_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        loginWithGithubDirect,
        handleOAuthCallback,
        linkGithubAccount,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
