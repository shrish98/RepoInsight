import { Send } from 'lucide-react'
import VoiceChatControls from './VoiceChatControls'

export default function ChatInput({
  handleAskQuestion,
  question,
  setQuestion,
  isAsking,
  isReady,
  chatHistory
}) {
  return (
    <form onSubmit={handleAskQuestion} className="relative mt-auto shrink-0 sticky bottom-0 z-20">
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

        <VoiceChatControls 
          question={question}
          setQuestion={setQuestion}
          onSendMessage={handleAskQuestion}
          isAsking={isAsking}
          isReady={isReady}
          latestAgentMessage={
            chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === 'agent' 
              ? chatHistory[chatHistory.length - 1].text 
              : ''
          }
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
  )
}
