import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GITHUB_API_URL = process.env.GITHUB_API || 'https://api.github.com';

const getHeaders = () => {
  const headers = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
};

/**
 * Fetches user profile from GitHub API
 * @param {string} username 
 * @returns {Promise<object>} User data
 */
export const fetchUserFromGithub = async (username) => {
  try {
    const response = await axios.get(`${GITHUB_API_URL}/users/${username}`, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetches user repositories from GitHub API
 * Fetching up to 100 repositories per page to ensure a complete view of active projects.
 * @param {string} username 
 * @returns {Promise<Array>} List of repositories
 */
export const fetchReposFromGithub = async (username) => {
  try {
    const response = await axios.get(`${GITHUB_API_URL}/users/${username}/repos`, {
      headers: getHeaders(),
      params: {
        per_page: 100,
        sort: 'updated',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetches repository metadata from GitHub API
 * @param {string} owner 
 * @param {string} repo 
 */
export const fetchRepoDetailsFromGithub = async (owner, repo) => {
  const response = await axios.get(`${GITHUB_API_URL}/repos/${owner}/${repo}`, {
    headers: getHeaders(),
  });
  return response.data;
};

/**
 * Fetches README content for a repository
 * @param {string} owner 
 * @param {string} repo 
 */
export const fetchRepoReadme = async (owner, repo) => {
  try {
    const response = await axios.get(`${GITHUB_API_URL}/repos/${owner}/${repo}/readme`, {
      headers: getHeaders(),
    });
    if (response.data && response.data.content) {
      const decoded = Buffer.from(response.data.content, 'base64').toString('utf-8');
      return decoded;
    }
    return '';
  } catch (error) {
    return '';
  }
};

/**
 * Fetches language distribution bytes for a repository
 * @param {string} owner 
 * @param {string} repo 
 */
export const fetchRepoLanguages = async (owner, repo) => {
  try {
    const response = await axios.get(`${GITHUB_API_URL}/repos/${owner}/${repo}/languages`, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    return {};
  }
};

/**
 * Fetches recent commit history for a repository
 * @param {string} owner 
 * @param {string} repo 
 */
export const fetchRepoCommits = async (owner, repo) => {
  try {
    const response = await axios.get(`${GITHUB_API_URL}/repos/${owner}/${repo}/commits`, {
      headers: getHeaders(),
      params: { per_page: 10 },
    });
    return response.data.map((c) => ({
      sha: c.sha,
      message: c.commit.message,
      author: c.commit.author.name,
      avatar: c.author ? c.author.avatar_url : '',
      date: c.commit.author.date,
      url: c.html_url,
    }));
  } catch (error) {
    return [];
  }
};

