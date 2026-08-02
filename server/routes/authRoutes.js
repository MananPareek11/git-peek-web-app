import express from 'express';
import {
  registerUser,
  loginUser,
  getGithubAuthUrl,
  githubCallback,
  getMe,
  linkGithub,
  getBookmarks,
  addBookmark,
  deleteBookmark,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/github/url', getGithubAuthUrl);
router.post('/github/callback', githubCallback);

router.get('/me', protect, getMe);
router.post('/link-github', protect, linkGithub);

// Protected Bookmark Routes
router.get('/bookmarks', protect, getBookmarks);
router.post('/bookmarks', protect, addBookmark);
router.delete('/bookmarks/:targetId', protect, deleteBookmark);

export default router;

