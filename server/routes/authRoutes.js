import express from 'express';
import {
  registerUser,
  loginUser,
  getGithubAuthUrl,
  githubCallback,
  getMe,
  linkGithub,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/github/url', getGithubAuthUrl);
router.post('/github/callback', githubCallback);

router.get('/me', protect, getMe);
router.post('/link-github', protect, linkGithub);

export default router;
