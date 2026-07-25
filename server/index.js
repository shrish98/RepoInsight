import './loadEnv.js';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import fs from 'fs';
import { processRepository } from './services/ragService.js';
import { runAgent } from './services/agentService.js';
import { getOrGenerateSummary } from './services/summaryService.js';
import { normalizeRepoUrl } from './utils/urlHelper.js';
import { RepoSummary } from './models/RepoSummary.js';
import authRoutes from './routes/auth.js';
import historyRoutes from './routes/history.js';
import { authMiddleware } from './middleware/auth.js';
import { ChatSession } from './models/ChatSession.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection check middleware
app.use((req, res, next) => {
  if (req.path.startsWith('/api') && req.path !== '/api/health' && process.env.MONGODB_URI && mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: "Database connection is not established. Please check server logs."
    });
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/history', historyRoutes);

// Serve Static Frontend (React/Vite) - checks client/dist first, fallback to public
const staticFolder = fs.existsSync(path.join(__dirname, '../client/dist/index.html'))
  ? path.join(__dirname, '../client/dist')
  : path.join(__dirname, '../public');

app.use(express.static(staticFolder));

// Health Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'RepoInsight API is running smoothly!' });
});

// Root Route for AWS Load Balancer Health Checks
app.get('/', (req, res) => {
  res.status(200).send('RepoInsight API is running!');
});

// Analyze repository and generate vector embeddings
app.post('/api/analyze', authMiddleware, async (req, res) => {
  const { repoUrl: rawRepoUrl } = req.body;
  const repoUrl = normalizeRepoUrl(rawRepoUrl);

  if (!repoUrl) {
    return res.status(400).json({ error: "Please provide a valid GitHub repoUrl." });
  }

  try {
    console.log(`Received request to analyze: ${repoUrl}`);
    await processRepository(repoUrl);

    let summary = null;
    try {
      await RepoSummary.deleteOne({ repoUrl });
      summary = await getOrGenerateSummary(repoUrl);
    } catch (summaryErr) {
      console.warn("Summary generation warning:", summaryErr.message);
    }

    res.json({ 
      message: "Repository successfully analyzed and saved to the database!", 
      repoUrl,
      summary 
    });
  } catch (error) {
    console.error("Analysis Error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze repository." });
  }
});

// Fetch architectural summary for repository
app.get('/api/summary', authMiddleware, async (req, res) => {
  const { repoUrl: rawRepoUrl } = req.query;
  const repoUrl = normalizeRepoUrl(rawRepoUrl);

  if (!repoUrl) {
    return res.status(400).json({ error: "repoUrl parameter is required." });
  }

  try {
    const summary = await getOrGenerateSummary(repoUrl);
    res.json({ summary });
  } catch (error) {
    console.error("Error fetching summary:", error);
    res.status(500).json({ error: "Failed to fetch summary." });
  }
});

// Chat endpoint with codebase agent
app.post('/api/chat', authMiddleware, async (req, res) => {
  const { question, repoUrl: rawRepoUrl } = req.body;
  const repoUrl = normalizeRepoUrl(rawRepoUrl);

  if (!question || !repoUrl) {
    return res.status(400).json({ error: "Please provide a question and repoUrl." });
  }

  try {
    console.log(`Received question: ${question} for repo: ${repoUrl}`);
    const answer = await runAgent(question, repoUrl);

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

app.get(/^(.*)$/, (req, res) => {
  const indexFile = fs.existsSync(path.join(__dirname, '../client/dist/index.html'))
    ? path.join(__dirname, '../client/dist/index.html')
    : path.join(__dirname, '../public/index.html');
  res.sendFile(indexFile);
});

try {
  if (process.env.MONGODB_URI) {
    mongoose.set('bufferCommands', false);
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to MongoDB Atlas');
  } else {
    console.log('MONGODB_URI not found in environment.');
  }
} catch (error) {
  console.error('MongoDB connection error:', error.message);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

