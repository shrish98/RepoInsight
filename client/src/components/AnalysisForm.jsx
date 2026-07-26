import { motion, AnimatePresence } from 'framer-motion'
import { Search, Database, Loader2, AlertCircle } from 'lucide-react'

export default function AnalysisForm({
  handleAnalyze,
  repoUrl,
  setRepoUrl,
  isAnalyzing,
  analysisStatus
}) {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-6 rounded-3xl relative overflow-hidden shrink-0"
    >
      <form onSubmit={handleAnalyze} className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
        <div className="relative flex items-center bg-slate-900/80 rounded-2xl p-2 border border-white/10 backdrop-blur-md">
          <Search className="w-5 h-5 text-slate-400 ml-4" />
          <input
            type="url"
            placeholder="https://github.com/facebook/react"
            required
            className="flex-1 bg-transparent border-none text-slate-100 px-4 py-3 focus:outline-none placeholder:text-slate-500 text-lg"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            disabled={isAnalyzing}
          />
          <button
            type="submit"
            disabled={isAnalyzing}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-400 text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center gap-2"
          >
            {isAnalyzing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Database className="w-5 h-5" />
            )}
            <span className="hidden sm:inline">{isAnalyzing ? 'Processing' : 'Analyze'}</span>
          </button>
        </div>
      </form>

      <AnimatePresence>
        {analysisStatus && (
          <motion.div 
            initial={{ opacity: 0, height: 0, mt: 0 }}
            animate={{ opacity: 1, height: 'auto', mt: 16 }}
            exit={{ opacity: 0, height: 0, mt: 0 }}
            className={`overflow-hidden rounded-xl border flex items-center gap-3 p-4 ${
              analysisStatus.type === 'loading' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300' :
              analysisStatus.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' :
              'bg-rose-500/10 border-rose-500/20 text-rose-300'
            }`}
          >
            {analysisStatus.type === 'loading' && <Loader2 className="w-5 h-5 animate-spin shrink-0" />}
            {analysisStatus.type === 'success' && <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/50">✓</div>}
            {analysisStatus.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0" />}
            <p className="text-sm font-medium">{analysisStatus.msg}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  )
}
