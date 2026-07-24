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
  ]
}, { timestamps: true });

export const RepoSummary = mongoose.model('RepoSummary', repoSummarySchema);
