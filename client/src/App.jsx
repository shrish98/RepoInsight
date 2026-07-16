import { useState } from 'react'

function App() {
  const [repoUrl, setRepoUrl] = useState('')

  const handleAnalyze = (e) => {
    e.preventDefault()
    console.log("Analyzing:", repoUrl)
    // TODO: Connect to backend API
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center pt-20 px-4 font-sans">
      <header className="max-w-3xl w-full text-center space-y-6 mb-12">
        <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
          RepoInsight
        </h1>
        <p className="text-lg text-slate-400 max-w-xl mx-auto">
          Intelligent GitHub Repository Analysis. Paste a link below to instantly understand the architecture, codebase, and team velocity.
        </p>
      </header>

      <main className="w-full max-w-2xl">
        <form onSubmit={handleAnalyze} className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
          <div className="relative flex items-center bg-slate-900 rounded-xl p-2 ring-1 ring-white/10 shadow-2xl">
            <input
              type="url"
              placeholder="https://github.com/facebook/react"
              required
              className="flex-1 bg-transparent border-none text-slate-200 px-4 py-3 focus:outline-none placeholder:text-slate-500"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
            />
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors duration-200"
            >
              Analyze
            </button>
          </div>
        </form>

        {/* Placeholder for Analysis Status/Results */}
        <div className="mt-16 p-8 border border-white/5 rounded-2xl bg-white/[0.02] backdrop-blur-sm hidden">
          {/* We will render the Agent's thought process here */}
        </div>
      </main>
    </div>
  )
}

export default App
