import './loadEnv.js';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import fs from 'fs';
import authRoutes from './routes/auth.js';
import historyRoutes from './routes/history.js';
import repoRoutes from './routes/repo.js';
import connectDB from './config/db.js';

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
app.use('/api', repoRoutes);

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



app.get(/^(.*)$/, (req, res) => {
  const indexFile = fs.existsSync(path.join(__dirname, '../client/dist/index.html'))
    ? path.join(__dirname, '../client/dist/index.html')
    : path.join(__dirname, '../public/index.html');
  res.sendFile(indexFile);
});

await connectDB();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

