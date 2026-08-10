import { useContext } from 'react'
import { motion } from 'framer-motion'
import { Code2 } from 'lucide-react'
import { AuthContext } from './context/AuthContext'
import { useChatSession } from './hooks/useChatSession'
import Landing from './pages/Landing'
import RepoSummaryCard from './components/RepoSummaryCard'
import Sidebar from './components/Sidebar'
import AnalysisForm from './components/AnalysisForm'
import ChatFeed from './components/ChatFeed'
import ChatInput from './components/ChatInput'

function App() {
  const { user, token, logout } = useContext(AuthContext);
  
  const {
    repoUrl, setRepoUrl,
    isAnalyzing,
    analysisStatus,
    isReady,
    repoSummary,
    question, setQuestion,
    chatHistory,
    isAsking,
    savedSessions,
    isSidebarOpen,
    chatContainerRef,
    loadSession,
    handleDeleteSession,
    handleAnalyze,
    handleAskQuestion
  } = useChatSession(token);

  if (!token) {
    return <Landing />
  }

  return (
    <div className="h-screen mesh-bg text-slate-100 flex relative overflow-hidden">
      
      <div className="absolute top-[-10%] left-[-10%] w-[35%] h-[35%] rounded-full bg-emerald-500/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[35%] rounded-full bg-slate-700/20 blur-[140px] pointer-events-none" />

      <Sidebar 
        isSidebarOpen={isSidebarOpen}
        savedSessions={savedSessions}
        repoUrl={repoUrl}
        loadSession={loadSession}
        handleDeleteSession={handleDeleteSession}
        user={user}
        logout={logout}
      />

      <div className={`flex-1 flex flex-col items-center h-screen overflow-y-auto pt-6 px-4 pb-12 relative z-10 transition-all ${isSidebarOpen ? 'ml-72' : 'ml-0'}`}>
        
        <header className="max-w-4xl w-full text-center space-y-2 mb-6 shrink-0">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center space-x-3"
          >
            <div className="p-2.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-lg shadow-emerald-950/20 backdrop-blur-md">
              <Code2 className="w-6 h-6 text-emerald-400" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-emerald-200 to-slate-100 pb-1">
              RepoInsight
            </h1>
          </motion.div>
        </header>


        <main className="w-full max-w-4xl flex flex-col gap-6 flex-1 pb-8">
          
          <AnalysisForm 
            handleAnalyze={handleAnalyze}
            repoUrl={repoUrl}
            setRepoUrl={setRepoUrl}
            isAnalyzing={isAnalyzing}
            analysisStatus={analysisStatus}
          />

          {repoSummary && (
            <RepoSummaryCard 
              summary={repoSummary} 
              onSelectQuestion={(q) => handleAskQuestion(null, q)} 
            />
          )}

          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-panel p-6 rounded-3xl flex flex-col flex-1 min-h-[450px] transition-opacity duration-500 ${!isReady && chatHistory.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <ChatFeed 
              chatContainerRef={chatContainerRef}
              chatHistory={chatHistory}
              isAsking={isAsking}
            />

            <ChatInput 
              handleAskQuestion={handleAskQuestion}
              question={question}
              setQuestion={setQuestion}
              isAsking={isAsking}
              isReady={isReady}
              chatHistory={chatHistory}
            />
          </motion.section>

        </main>
      </div>
    </div>
  )
}

export default App
