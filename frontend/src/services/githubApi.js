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

