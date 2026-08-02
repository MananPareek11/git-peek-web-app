import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSearchHistory, getCachedUsers, deleteCachedUser, fetchUserFavorites, createFavorite, deleteUserFavorite } from '../services/githubApi';
import { useAuth } from './AuthContext';

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [recentSearches, setRecentSearches] = useState([]);
  const [cachedUsers, setCachedUsers] = useState([]);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorite_users');
    return saved ? JSON.parse(saved) : [];
  });
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingCached, setLoadingCached] = useState(false);

  // Sync favorites to local storage
  useEffect(() => {
    localStorage.setItem('favorite_users', JSON.stringify(favorites));
  }, [favorites]);

  // Sync favorites from MongoDB backend when user is logged in
  useEffect(() => {
    if (token && user) {
      fetchUserFavorites()
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setFavorites(data);
          }
        })
        .catch((err) => console.error('Failed to load server favorites:', err));
    }
  }, [token, user]);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const data = await getSearchHistory();
      setRecentSearches(data || []);
    } catch (error) {
      console.error('Failed to load search history:', error);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  const fetchCached = useCallback(async () => {
    setLoadingCached(true);
    try {
      const data = await getCachedUsers();
      setCachedUsers(data || []);
    } catch (error) {
      console.error('Failed to load cached users:', error);
    } finally {
      setLoadingCached(false);
    }
  }, []);

  const isFavorite = useCallback(
    (username) => {
      if (!username) return false;
      return favorites.some((fav) => fav.username.toLowerCase() === username.toLowerCase());
    },
    [favorites]
  );

  const removeFavorite = useCallback(
    async (username) => {
      if (!username) return;
      const nameLower = username.toLowerCase();
      setFavorites((prev) => prev.filter((fav) => fav.username.toLowerCase() !== nameLower));
      if (token) {
        try {
          await deleteUserFavorite(nameLower);
        } catch (err) {
          console.error('Failed to delete favorite on server:', err);
        }
      }
    },
    [token]
  );

  const toggleFavorite = useCallback(
    async (username, avatar, name) => {
      if (!username) return;
      const nameLower = username.toLowerCase();
      const exists = isFavorite(username);

      if (exists) {
        await removeFavorite(username);
      } else {
        const newFav = { username, avatar: avatar || '', name: name || username };
        setFavorites((prev) => [newFav, ...prev]);
        if (token) {
          try {
            await createFavorite(newFav);
          } catch (err) {
            console.error('Failed to save favorite to server:', err);
          }
        }
      }
    },
    [isFavorite, removeFavorite, token]
  );


  const removeUserFromCache = useCallback(async (id, username) => {
    try {
      await deleteCachedUser(id);
      // Update local states
      setCachedUsers(prev => prev.filter(user => user._id !== id));
      setRecentSearches(prev => prev.filter(item => item.username.toLowerCase() !== username.toLowerCase()));
      // Also remove from favorites if they want, but let's keep favorites separate or check
    } catch (error) {
      console.error('Failed to delete cached user:', error);
      throw error;
    }
  }, []);

  return (
    <SearchContext.Provider
      value={{
        recentSearches,
        cachedUsers,
        favorites,
        loadingHistory,
        loadingCached,
        fetchHistory,
        fetchCached,
        toggleFavorite,
        isFavorite,
        removeUserFromCache,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
