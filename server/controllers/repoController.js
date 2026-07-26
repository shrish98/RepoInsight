import { processRepository } from '../services/ragService.js';
import { getOrGenerateSummary } from '../services/summaryService.js';
import { normalizeRepoUrl } from '../utils/urlHelper.js';
import { RepoSummary } from '../models/RepoSummary.js';
import { runAgent } from '../services/agentService.js';
import { ChatSession } from '../models/ChatSession.js';

export const analyzeRepo = async (req, res) => {
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
};

export const getSummary = async (req, res) => {
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
};

export const chatRepo = async (req, res) => {
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
};
