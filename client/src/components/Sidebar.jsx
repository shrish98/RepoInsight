import { motion } from 'framer-motion'
import { History, MessageSquare, Trash2, LogOut } from 'lucide-react'

export default function Sidebar({
  isSidebarOpen,
  savedSessions,
  repoUrl,
  loadSession,
  handleDeleteSession,
  user,
  logout
}) {
  return (
    <motion.aside 
      initial={{ x: -300 }}
      animate={{ x: isSidebarOpen ? 0 : -300 }}
      className={`fixed left-0 top-0 h-full w-72 glass-panel border-r border-white/10 z-30 flex flex-col transition-all`}
    >
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-400" />
          <h2 className="font-semibold text-white">Chat History</h2>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-white/10">
        {savedSessions.length === 0 ? (
          <p className="text-slate-500 text-sm text-center mt-4">No history yet.</p>
        ) : (
          savedSessions.map(session => (
            <div key={session._id} className={`w-full group flex items-center justify-between p-3 rounded-xl transition-all border ${repoUrl === session.repoUrl ? 'bg-indigo-500/20 border-indigo-500/30' : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
              <button 
                onClick={() => loadSession(session.repoUrl)}
                className="flex-1 text-left flex items-start gap-3 overflow-hidden"
              >
                <MessageSquare className="w-4 h-4 mt-1 text-slate-400 shrink-0" />
                <div className="overflow-hidden">
                  <p className="text-sm text-slate-200 truncate">{session.repoUrl.replace('https://github.com/', '')}</p>
                  <p className="text-xs text-slate-500 mt-1">{new Date(session.updatedAt).toLocaleDateString()}</p>
                </div>
              </button>
              <button 
                onClick={() => handleDeleteSession(session.repoUrl)}
                className="p-2 opacity-0 group-hover:opacity-100 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded-lg transition-all shrink-0"
                title="Delete Session"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-xl border border-white/5">
          <div className="truncate pr-2">
            <p className="text-sm font-medium text-slate-300 truncate">{user?.email}</p>
          </div>
          <button onClick={logout} className="p-2 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.aside>
  )
}
