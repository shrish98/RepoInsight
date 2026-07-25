import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, GitBranch, Sparkles, ChevronDown, ChevronUp, Layers, HelpCircle, Code } from 'lucide-react';
import MermaidDiagram from './MermaidDiagram';

export default function RepoSummaryCard({ summary, onSelectQuestion }) {
  const [showDiagram, setShowDiagram] = useState(true);

  if (!summary) return null;

  const { overview, techStack, entryPoints, architectureDiagram, suggestedQuestions } = summary;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-6 rounded-3xl border border-white/10 relative overflow-hidden mb-6"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 rounded-2xl border border-indigo-500/30">
            <Cpu className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Repository Intelligence Overview
            </h2>
            <p className="text-xs text-slate-400">Auto-detected architecture and dependencies</p>
          </div>
        </div>

        {techStack && techStack.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {techStack.map((tech, idx) => (
              <span 
                key={idx}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 backdrop-blur-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>

      {overview && (
        <p className="text-sm text-slate-300 leading-relaxed mb-4 font-medium">
          {overview}
        </p>
      )}

      {entryPoints && entryPoints.length > 0 && (
        <div className="mb-4 flex items-center flex-wrap gap-2 text-xs">
          <span className="text-slate-400 flex items-center gap-1 font-semibold mr-1">
            <Code className="w-3.5 h-3.5 text-cyan-400" /> Key Files:
          </span>
          {entryPoints.map((file, idx) => (
            <span key={idx} className="font-mono px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/50 text-slate-300">
              {file}
            </span>
          ))}
        </div>
      )}

      {architectureDiagram && (
        <div className="mb-5">
          <button
            type="button"
            onClick={() => setShowDiagram(!showDiagram)}
            className="flex items-center justify-between w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-slate-300 font-semibold transition-all mb-3"
          >
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Visual Architecture Diagram (Mermaid.js)
            </span>
            {showDiagram ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          <AnimatePresence>
            {showDiagram && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <MermaidDiagram chart={architectureDiagram} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {suggestedQuestions && suggestedQuestions.length > 0 && (
        <div className="pt-4 border-t border-white/5">
          <p className="text-xs text-slate-400 font-medium mb-2.5 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" /> Suggested Architecture Questions:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => onSelectQuestion && onSelectQuestion(q)}
                className="text-xs px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 hover:text-white transition-all text-left flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                <span>{q}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
