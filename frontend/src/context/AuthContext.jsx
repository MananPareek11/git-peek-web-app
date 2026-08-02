import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../services/axiosInstance';
import { fetchUserBookmarks, createBookmark, deleteUserBookmark } from '../services/githubApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem('gitpeek_bookmarks');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch (e) {
      return [];
    }
  });

  const [loading, setLoading] = useState(true);

  // Sync bookmarks to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('gitpeek_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Configure axios auth header whenever token changes
  useEffect(() => {
    if (token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('gitpeek_token', token);
      if (!user) {
        fetchCurrentUser();
      } else {
        loadBookmarks();
      }
    } else {
      delete axiosInstance.defaults.headers.common['Authorization'];
      localStorage.removeItem('gitpeek_token');
      setUser(null);
      setLoading(false);
    }
  }, [token, user]);

  const loadBookmarks = async () => {
    try {
      const data = await fetchUserBookmarks();
      if (Array.isArray(data) && data.length > 0) {
        setBookmarks(data);
      }
    } catch (err) {
      console.error('Failed to load user bookmarks from server:', err);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/auth/me');
      setUser(res.data);
      // Load user bookmarks after fetching user
      const bmData = await fetchUserBookmarks();
      if (Array.isArray(bmData) && bmData.length > 0) {
        setBookmarks(bmData);
      }
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

  // Bookmark Management Methods (Instant local update + MongoDB backend sync)
  const isBookmarked = (targetId) => {
    if (!targetId) return false;
    return bookmarks.some((b) => b.targetId === targetId);
  };

  const toggleBookmark = async (item) => {
    if (!item || !item.targetId) return false;
    const existing = isBookmarked(item.targetId);
    if (existing) {
      return await removeBookmark(item.targetId);
    } else {
      setBookmarks((prev) => [item, ...prev]);
      if (token) {
        try {
          await createBookmark(item);
        } catch (err) {
          console.error('Failed to sync bookmark to server:', err);
        }
      }
      return true;
    }
  };

  const removeBookmark = async (targetId) => {
    if (!targetId) return false;
    setBookmarks((prev) => prev.filter((b) => b.targetId !== targetId));
    if (token) {
      try {
        await deleteUserBookmark(targetId);
      } catch (err) {
        console.error('Failed to delete bookmark on server:', err);
      }
    }
    return true;
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        bookmarks,
        isAuthenticated: !!user,
        login,
        register,
        loginWithGithubDirect,
        handleOAuthCallback,
        linkGithubAccount,
        logout,
        isBookmarked,
        toggleBookmark,
        removeBookmark,
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

