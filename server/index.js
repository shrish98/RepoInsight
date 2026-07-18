import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { processRepository } from './services/ragService.js';
import { runAgent } from './services/agentService.js';
import authRoutes from './routes/auth.js';
import historyRoutes from './routes/history.js';
import { authMiddleware } from './middleware/auth.js';
import { ChatSession } from './models/ChatSession.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/history', historyRoutes);

// Serve Static Frontend (React/Vite)
app.use(express.static(path.join(__dirname, '../public')));

// Health Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'RepoInsight API is running smoothly!' });
});

// Root Route for AWS Load Balancer Health Checks
app.get('/', (req, res) => {
  res.status(200).send('RepoInsight API is running!');
});

// Route 1: Trigger the RAG Pipeline (The Scout & Harvester)
app.post('/api/analyze', authMiddleware, async (req, res) => {
  const { repoUrl } = req.body;

  if (!repoUrl) {
    return res.status(400).json({ error: "Please provide a GitHub repoUrl." });
  }

  try {
    console.log(`Received request to analyze: ${repoUrl}`);
    // This triggers the RAG service which fetches, chunks, embeds, and saves to MongoDB
    await processRepository(repoUrl);
    res.json({ message: "Repository successfully analyzed and saved to the database!" });
  } catch (error) {
    console.error("Analysis Error:", error);
    res.status(500).json({ error: "Failed to analyze repository." });
  }
});

// Route 2: Chat with the Agent (The Brain)
app.post('/api/chat', authMiddleware, async (req, res) => {
  const { question, repoUrl } = req.body;

  if (!question || !repoUrl) {
    return res.status(400).json({ error: "Please provide a question and repoUrl." });
  }

  try {
    console.log(`Received question: ${question} for repo: ${repoUrl}`);
    // Trigger the LangGraph workflow
    const answer = await runAgent(question, repoUrl);

    // Save to ChatSession
    let session = await ChatSession.findOne({ userId: req.user.userId, repoUrl });
    if (!session) {
      session = new ChatSession({ userId: req.user.userId, repoUrl, messages: [] });
    }

    session.messages.push({ role: 'user', text: question });
    session.messages.push({ role: 'agent', text: answer });
    await session.save();

    res.json({ answer });
  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: "Failed to generate an answer. " + error.message });
  }
});

// Catch-all to serve React app for unknown routes (React Router support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Connect to Database
try {
  if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI).then(() => console.log('✅ Connected to MongoDB Atlas'));
  } else {
    console.log('⚠️ MONGODB_URI not found in .env. Skipping DB connection for now.');
  }
} catch (error) {
  console.error('❌ Failed to connect to MongoDB:', error.message);
}

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
