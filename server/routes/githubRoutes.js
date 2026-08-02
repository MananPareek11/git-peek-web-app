import express from 'express';
import {
  searchUser,
  refreshUser,
  getCachedUsers,
  getSearchHistory,
  deleteCachedUser,
  getRepoDetails,
} from '../controllers/githubController.js';

const router = express.Router();

// Route: Get repository details (metadata, README, languages, commits)
router.get('/github/repo/:owner/:repo', getRepoDetails);

// Route: Get profile details (cached or from Github)
router.get('/github/:username', searchUser);

// Route: Force refresh profile from Github
router.post('/github/refresh/:username', refreshUser);

// Route: Get list of cached user profiles
router.get('/users', getCachedUsers);

// Route: Get recent searches
router.get('/history', getSearchHistory);

// Route: Delete a cached user and their repos from DB
router.delete('/users/:id', deleteCachedUser);

export default router;

