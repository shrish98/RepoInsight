import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { analyzeRepo, getSummary, chatRepo } from '../controllers/repoController.js';

const router = express.Router();

// Analyze repository and generate vector embeddings
router.post('/analyze', authMiddleware, analyzeRepo);

// Fetch architectural summary for repository
router.get('/summary', authMiddleware, getSummary);

// Chat endpoint with codebase agent
router.post('/chat', authMiddleware, chatRepo);

export default router;
