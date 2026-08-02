import axiosInstance from './axiosInstance';

/**
 * Searches for a GitHub user profile (checks cache first)
 * @param {string} username 
 */
export const searchProfile = async (username) => {
  const response = await axiosInstance.get(`/github/${username}`);
  return response.data;
};

/**
 * Forces a fresh fetch of a user profile from GitHub API
 * @param {string} username 
 */
export const refreshProfile = async (username) => {
  const response = await axiosInstance.post(`/github/refresh/${username}`);
  return response.data;
};

/**
 * Retrieves all stored user profiles in MongoDB cache
 */
export const getCachedUsers = async () => {
  const response = await axiosInstance.get('/users');
  return response.data;
};

/**
 * Retrieves recent search queries list
 */
export const getSearchHistory = async () => {
  const response = await axiosInstance.get('/history');
  return response.data;
};

/**
 * Deletes a cached profile and its repositories from the DB
 * @param {string} id 
 */
export const deleteCachedUser = async (id) => {
  const response = await axiosInstance.delete(`/users/${id}`);
  return response.data;
};

/**
 * Fetches repository details (metadata, README, languages, commits)
 * @param {string} owner 
 * @param {string} repo 
 */
export const getRepoDetails = async (owner, repo) => {
  const response = await axiosInstance.get(`/github/repo/${owner}/${repo}`);
  return response.data;
};

/**
 * Fetches all saved bookmarks for the current authenticated user
 */
export const fetchUserBookmarks = async () => {
  const response = await axiosInstance.get('/auth/bookmarks');
  return response.data;
};

/**
 * Saves a new bookmark to the user account
 * @param {object} bookmarkItem 
 */
export const createBookmark = async (bookmarkItem) => {
  const response = await axiosInstance.post('/auth/bookmarks', bookmarkItem);
  return response.data;
};

/**
 * Removes a bookmark from the user account by targetId
 * @param {string} targetId 
 */
export const deleteUserBookmark = async (targetId) => {
  const response = await axiosInstance.delete(`/auth/bookmarks/${encodeURIComponent(targetId)}`);
  return response.data;
};

/**
 * Fetches all saved favorite profiles for the current authenticated user
 */
export const fetchUserFavorites = async () => {
  const response = await axiosInstance.get('/auth/favorites');
  return response.data;
};

/**
 * Saves a new favorite profile to the user account
 * @param {object} favoriteItem 
 */
export const createFavorite = async (favoriteItem) => {
  const response = await axiosInstance.post('/auth/favorites', favoriteItem);
  return response.data;
};

/**
 * Removes a favorite profile from the user account by username
 * @param {string} username 
 */
export const deleteUserFavorite = async (username) => {
  const response = await axiosInstance.delete(`/auth/favorites/${encodeURIComponent(username)}`);
  return response.data;
};



