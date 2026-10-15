import mongoose from 'mongoose';

const repoSummarySchema = new mongoose.Schema({
  repoUrl: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  overview: {
    type: String,
    default: ''
  },
  techStack: [
    {
      type: String
    }
  ],
  entryPoints: [
    {
      type: String
    }
  ],
  architectureDiagram: {
    type: String,
    default: ''
  },
  suggestedQuestions: [
    {
      type: String
    }
  ],
  // Bytes of code per language, straight from GitHub's languages API, e.g. { JavaScript: 130147 }.
  languages: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true, minimize: false });

export const RepoSummary = mongoose.model('RepoSummary', repoSummarySchema);
