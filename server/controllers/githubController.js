import User from '../models/User.js';
import Repository from '../models/Repository.js';
import SearchHistory from '../models/SearchHistory.js';
import {
  fetchUserFromGithub,
  fetchReposFromGithub,
  fetchRepoDetailsFromGithub,
  fetchRepoReadme,
  fetchRepoLanguages,
  fetchRepoCommits,
} from '../services/githubService.js';

// Cache expiration: 24 hours in milliseconds
const CACHE_EXPIRATION_MS = 24 * 60 * 60 * 1000;

/**
 * Normalizes user data from GitHub API to MongoDB schema format
 */
const formatUserData = (githubUser) => {
  return {
    githubId: githubUser.id,
    username: githubUser.login.toLowerCase(),
    name: githubUser.name || githubUser.login,
    avatar: githubUser.avatar_url,
    bio: githubUser.bio || '',
    company: githubUser.company || '',
    location: githubUser.location || '',
    blog: githubUser.blog || '',
    twitter: githubUser.twitter_username || '',
    followers: githubUser.followers || 0,
    following: githubUser.following || 0,
    publicRepos: githubUser.public_repos || 0,
    publicGists: githubUser.public_gists || 0,
    profileUrl: githubUser.html_url,
    hireable: githubUser.hireable || false,
    createdAtGithub: new Date(githubUser.created_at),
    lastFetched: new Date(),
  };
};

/**
 * Normalizes repository list from GitHub API to MongoDB format
 */
const formatRepoData = (repo, ownerUsername) => {
  return {
    githubRepoId: repo.id,
    owner: ownerUsername.toLowerCase(),
    name: repo.name,
    description: repo.description || '',
    language: repo.language || '',
    stars: repo.stargazers_count || 0,
    forks: repo.forks_count || 0,
    issues: repo.open_issues_count || 0,
    visibility: repo.visibility || 'public',
    defaultBranch: repo.default_branch || 'main',
    repoUrl: repo.html_url,
    updatedAtGithub: new Date(repo.updated_at),
    lastFetched: new Date(),
  };
};

/**
 * Search user - returns cached data if fresh, otherwise fetches and updates cache.
 */
export const searchUser = async (req, res, next) => {
  const username = req.params.username.trim().toLowerCase();

  if (!username) {
    return res.status(400).json({ message: 'Username is required' });
  }

  try {
    // 1. Record search history
    await SearchHistory.create({ username });

    // 2. Look for cached user
    const cachedUser = await User.findOne({ username });

    if (cachedUser) {
      const timeSinceFetched = Date.now() - new Date(cachedUser.lastFetched).getTime();
      
      if (timeSinceFetched < CACHE_EXPIRATION_MS) {
        // Cache is fresh, load repos from DB
        const cachedRepos = await Repository.find({ owner: username });
        console.log(`Serving cached profile for user: ${username}`);
        return res.status(200).json({
          source: 'cache',
          user: cachedUser,
          repos: cachedRepos,
        });
      }
      console.log(`Cached profile for ${username} is stale. Refreshing...`);
    } else {
      console.log(`Profile for ${username} not cached. Fetching...`);
    }

    // 3. Cache missing or stale -> fetch from GitHub
    const githubUser = await fetchUserFromGithub(username);
    const githubRepos = await fetchReposFromGithub(username);

    // 4. Save to Database
    const formattedUser = formatUserData(githubUser);
    const updatedUser = await User.findOneAndUpdate(
      { username },
      formattedUser,
      { new: true, upsert: true }
    );

    // Sync Repositories: Delete old repos and insert new ones
    await Repository.deleteMany({ owner: username });
    const formattedRepos = githubRepos.map(repo => formatRepoData(repo, username));
    const updatedRepos = await Repository.insertMany(formattedRepos);

    return res.status(200).json({
      source: 'github',
      user: updatedUser,
      repos: updatedRepos,
    });
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ message: `GitHub user '${username}' not found` });
    }
    next(error);
  }
};

/**
 * Force Refresh - bypasses cache checks, pulls from GitHub, updates MongoDB, and returns data.
 */
export const refreshUser = async (req, res, next) => {
  const username = req.params.username.trim().toLowerCase();

  try {
    const githubUser = await fetchUserFromGithub(username);
    const githubRepos = await fetchReposFromGithub(username);

    const formattedUser = formatUserData(githubUser);
    const updatedUser = await User.findOneAndUpdate(
      { username },
      formattedUser,
      { new: true, upsert: true }
    );

    // Sync Repositories
    await Repository.deleteMany({ owner: username });
    const formattedRepos = githubRepos.map(repo => formatRepoData(repo, username));
    const updatedRepos = await Repository.insertMany(formattedRepos);

    console.log(`Forced refresh completed for user: ${username}`);
    return res.status(200).json({
      source: 'github_refresh',
      user: updatedUser,
      repos: updatedRepos,
    });
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ message: `GitHub user '${username}' not found` });
    }
    next(error);
  }
};

/**
 * Get Cached Users - list all stored user profiles
 */
export const getCachedUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ lastFetched: -1 });
    return res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Search History - list recently searched usernames
 */
export const getSearchHistory = async (req, res, next) => {
  try {
    // Return unique usernames from search history, sorted by newest search time
    const history = await SearchHistory.aggregate([
      { $sort: { searchedAt: -1 } },
      {
        $group: {
          _id: '$username',
          username: { $first: '$username' },
          searchedAt: { $first: '$searchedAt' },
        },
      },
      { $sort: { searchedAt: -1 } },
      { $limit: 12 },
    ]);
    return res.status(200).json(history);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Cached User - clear profile and repos from database cache
 */
export const deleteCachedUser = async (req, res, next) => {
  const { id } = req.params;

  try {
    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found in cache' });
    }

    const username = userToDelete.username;

    // Delete user and matching repository list
    await User.findByIdAndDelete(id);
    await Repository.deleteMany({ owner: username });
    // Also remove from search history to keep UI clean
    await SearchHistory.deleteMany({ username });

    console.log(`Deleted user ${username} and their repos from cache.`);
    return res.status(200).json({ message: `Cached profile for ${username} deleted successfully` });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Repository Details - fetches full repository details, README, languages, and commit activity
 */
export const getRepoDetails = async (req, res, next) => {
  const { owner, repo } = req.params;

  if (!owner || !repo) {
    return res.status(400).json({ message: 'Owner and repository parameters are required' });
  }

  try {
    const [details, readme, languages, commits] = await Promise.all([
      fetchRepoDetailsFromGithub(owner, repo),
      fetchRepoReadme(owner, repo),
      fetchRepoLanguages(owner, repo),
      fetchRepoCommits(owner, repo),
    ]);

    const formattedRepo = {
      githubRepoId: details.id,
      name: details.name,
      owner: details.owner.login,
      ownerAvatar: details.owner.avatar_url,
      description: details.description || '',
      stars: details.stargazers_count || 0,
      forks: details.forks_count || 0,
      subscribers: details.subscribers_count || 0,
      openIssues: details.open_issues_count || 0,
      license: details.license ? details.license.name : 'No License Specified',
      language: details.language || 'Unknown',
      visibility: details.visibility || (details.private ? 'private' : 'public'),
      defaultBranch: details.default_branch || 'main',
      createdAt: details.created_at,
      updatedAt: details.updated_at,
      pushedAt: details.pushed_at,
      repoUrl: details.html_url,
      topics: details.topics || [],
      sizeKb: details.size || 0,
      readme,
      languages,
      commits,
    };

    return res.status(200).json(formattedRepo);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ message: `Repository '${owner}/${repo}' not found on GitHub` });
    }
    next(error);
  }
};

