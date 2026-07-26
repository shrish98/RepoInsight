import { motion } from 'framer-motion'
import { Bot, User } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

export default function ChatFeed({
  chatContainerRef,
  chatHistory,
  isAsking
}) {
  return (
    <div ref={chatContainerRef} className="flex-1 min-h-[200px] max-h-[500px] overflow-y-auto mb-6 pr-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
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
  )
}
