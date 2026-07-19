import { useState, useRef, useEffect, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/atom-one-dark.css' 
import { Search, Send, Code2, Bot, User, Loader2, Database, AlertCircle, LogOut, History, MessageSquare, Trash2 } from 'lucide-react'
import { AuthContext } from './context/AuthContext'
import { Navigate } from 'react-router-dom'
import Landing from './pages/Landing'

function App() {
  const { user, token, logout } = useContext(AuthContext);

  // State for Step 1: Analysis
  const [repoUrl, setRepoUrl] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisStatus, setAnalysisStatus] = useState(null)
  const [isReady, setIsReady] = useState(false)
  
  // State for Step 2: Chat
  const [question, setQuestion] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [isAsking, setIsAsking] = useState(false)

  // State for Sidebar History
  const [savedSessions, setSavedSessions] = useState([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const chatContainerRef = useRef(null)

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatHistory, isAsking])

  // Fetch History on mount
  useEffect(() => {
    if (token) {
      fetchHistory();
    }
  }, [token]);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSavedSessions(data);
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  };

  const loadSession = async (url) => {
    setRepoUrl(url);
    setIsReady(true);
    setAnalysisStatus({ type: 'success', msg: 'Loaded previous session.' });
    
    try {
      const res = await fetch(`/api/history/repo?repoUrl=${encodeURIComponent(url)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setChatHistory(data.messages || []);
      }
    } catch (e) {
      console.error("Failed to load session messages", e);
    }
  };

  const handleDeleteSession = async (url) => {
    try {
      const res = await fetch(`/api/history/repo?repoUrl=${encodeURIComponent(url)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        if (repoUrl === url) {
          setRepoUrl('');
          setIsReady(false);
          setChatHistory([]);
          setAnalysisStatus(null);
        }
        fetchHistory();
      }
    } catch (e) {
      console.error("Failed to delete session", e);
    }
  };

  // Trigger the RAG Pipeline
  const handleAnalyze = async (e) => {
    e.preventDefault()
    if (!repoUrl) return;

    setIsAnalyzing(true)
    setIsReady(false)
    setAnalysisStatus({ type: 'loading', msg: 'Cloning repository and embedding chunks... (This might take a minute)' })
    setChatHistory([])

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ repoUrl })
      })
      const data = await response.json()
      
      if (response.ok) {
        setAnalysisStatus({ type: 'success', msg: 'Repository analyzed and embedded successfully! You can now ask questions.' })
        setIsReady(true)
        fetchHistory() // Refresh sidebar
      } else {
        setAnalysisStatus({ type: 'error', msg: data.error })
      }
    } catch (error) {
      setAnalysisStatus({ type: 'error', msg: 'Failed to connect to backend server. Make sure the Express server is running!' })
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Trigger the LangGraph Agent
  const handleAskQuestion = async (e) => {
    e.preventDefault()
    if (!question || !isReady) return;

    const newChat = [...chatHistory, { role: 'user', text: question }]
    setChatHistory(newChat)
    setQuestion('')
    setIsAsking(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ question, repoUrl })
      })
      const data = await response.json()

      if (response.ok) {
        setChatHistory([...newChat, { role: 'agent', text: data.answer }])
        fetchHistory() // Refresh sidebar timestamp
      } else {
        setChatHistory([...newChat, { role: 'agent', text: `❌ Error: ${data.error}` }])
      }
    } catch (error) {
      setChatHistory([...newChat, { role: 'agent', text: '❌ Error connecting to backend.' }])
    } finally {
      setIsAsking(false)
    }
  }

  // If not authenticated, render the public landing page
  if (!token) {
    return <Landing />
  }

  return (
    <div className="min-h-screen mesh-bg text-slate-100 flex relative overflow-hidden">
      
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600/20 blur-[120px] pointer-events-none" />

      {/* Sidebar for History */}
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

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col items-center pt-10 px-4 pb-10 relative z-10 transition-all ${isSidebarOpen ? 'ml-72' : 'ml-0'}`}>
        
        <header className="max-w-4xl w-full text-center space-y-4 mb-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center space-x-3"
          >
            <div className="p-2 bg-white/5 rounded-xl border border-white/10 shadow-lg backdrop-blur-sm">
              <Code2 className="w-6 h-6 text-indigo-400" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-400 animate-gradient-x pb-1">
              RepoInsight
            </h1>
          </motion.div>
        </header>

        <main className="w-full max-w-4xl flex flex-col gap-6 h-full max-h-[800px]">
          
          {/* Step 1: Analyze Repository UI */}
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

          {/* Step 2: Chat with AI UI */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-panel p-6 rounded-3xl flex flex-col flex-1 min-h-0 transition-opacity duration-500 ${!isReady && chatHistory.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {/* Chat History Display */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto mb-6 pr-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {chatHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
                  <Bot className="w-16 h-16 mb-4 text-slate-500" />
                  <p className="text-lg text-center">Ask me anything about the architecture,<br/>components, or logic!</p>
                </div>
              ) : (
                chatHistory.map((msg, index) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    key={index} 
                    className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border shadow-md ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 border-indigo-400/30' 
                        : 'bg-gradient-to-br from-slate-700 to-slate-800 border-slate-600/50'
                    }`}>
                      {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-cyan-300" />}
                    </div>
                    
                    <div className={`max-w-[85%] p-5 rounded-2xl shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-sm' 
                        : 'bg-slate-800/80 text-slate-200 rounded-tl-sm border border-slate-700/50 backdrop-blur-md'
                    }`}>
                      {msg.role === 'user' ? (
                        <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                      ) : (
                        <div className="markdown-prose w-full">
                          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                            {msg.text}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
              
              {isAsking && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-4 flex-row"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border shadow-md bg-gradient-to-br from-slate-700 to-slate-800 border-slate-600/50">
                    <Bot className="w-5 h-5 text-cyan-300" />
                  </div>
                  <div className="max-w-[85%] p-5 rounded-2xl bg-slate-800/50 rounded-tl-sm border border-slate-700/30 backdrop-blur-md flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="w-2 h-2 bg-cyan-400 rounded-full" />
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="w-2 h-2 bg-cyan-400 rounded-full" />
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} className="w-2 h-2 bg-cyan-400 rounded-full" />
                    </div>
                    <span className="text-slate-400 text-sm font-medium">Analyzing codebase...</span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Chat Input Field */}
            <form onSubmit={handleAskQuestion} className="relative mt-auto shrink-0">
              <div className="relative flex items-center bg-slate-900/80 rounded-2xl p-2 border border-white/10 backdrop-blur-xl shadow-lg focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/50 transition-all">
                <input
                  type="text"
                  placeholder="Ask about authentication, database models, or architecture..."
                  required
                  className="flex-1 bg-transparent border-none text-slate-100 px-5 py-4 focus:outline-none placeholder:text-slate-500 text-lg"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  disabled={isAsking || !isReady}
                />
                <button
                  type="submit"
                  disabled={isAsking || !isReady || !question.trim()}
                  className="p-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl transition-all duration-300 shadow-md shadow-cyan-500/20 flex items-center justify-center mr-1"
                >
                  <Send className="w-5 h-5 ml-1" />
                </button>
              </div>
            </form>
          </motion.section>

        </main>
      </div>
    </div>
  )
}

export default App
