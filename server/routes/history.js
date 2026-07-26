import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getAllHistory, getRepoHistory, deleteRepoHistory } from '../controllers/historyController.js';

const router = express.Router();

// Get all unique repositories analyzed by the user
router.get('/', authMiddleware, getAllHistory);

// Get chat history for a specific repository
router.get('/repo', authMiddleware, getRepoHistory);

// Delete chat history for a specific repository
router.delete('/repo', authMiddleware, deleteRepoHistory);

export default router;
