import express from 'express';
import { registerUser, loginUser, getCurrentUser } from '../controllers/authController.js';
import { startGithubLogin, githubCallback } from '../controllers/githubAuthController.js';
import { authMiddleware } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = express.Router();

// Slows down password guessing: 10 attempts per IP every 15 minutes.
const passwordAttempts = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many attempts. Wait a few minutes and try again.',
});

router.post('/register', passwordAttempts, registerUser);
router.post('/login', passwordAttempts, loginUser);
router.get('/me', authMiddleware, getCurrentUser);

router.get('/github', startGithubLogin);
router.get('/github/callback', githubCallback);

export default router;
