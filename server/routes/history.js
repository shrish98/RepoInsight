import express from 'express';
import { ChatSession } from '../models/ChatSession.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all unique repositories analyzed by the user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const sessions = await ChatSession.find({ userId: req.user.userId })
                                      .sort({ updatedAt: -1 })
                                      .select('repoUrl updatedAt');
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// Get chat history for a specific repository
router.get('/repo', authMiddleware, async (req, res) => {
  const { repoUrl } = req.query;
  if (!repoUrl) return res.status(400).json({ error: 'repoUrl is required' });

  try {
    const session = await ChatSession.findOne({ userId: req.user.userId, repoUrl });
    if (!session) return res.json({ messages: [] });
    
    res.json(session);
  } catch (error) {
    console.error('Error fetching repo history:', error);
    res.status(500).json({ error: 'Failed to fetch repository history' });
  }
});

// Delete chat history for a specific repository
router.delete('/repo', authMiddleware, async (req, res) => {
  const { repoUrl } = req.query;
  if (!repoUrl) return res.status(400).json({ error: 'repoUrl is required' });

  try {
    await ChatSession.deleteOne({ userId: req.user.userId, repoUrl });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting repo history:', error);
    res.status(500).json({ error: 'Failed to delete repository history' });
  }
});

export default router;
