import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Code2, 
  Search, 
  Bot, 
  Database, 
  History, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Shield, 
  FileText,
  User,
  MessageSquare
} from 'lucide-react';

export default function Landing() {
  // Features Data
  const features = [
    {
      icon: <Search className="w-6 h-6 text-indigo-400" />,
      title: "Smart Repository Scout",
      description: "Clone and index any public or private GitHub repository in one click. We chunk, parse, and analyze your source tree automatically."
    },
    {
      icon: <Database className="w-6 h-6 text-cyan-400" />,
      title: "MongoDB Vector Indexing",
      description: "Leverage high-dimensional vector search to semantic-match queries against your code snippets, classes, structures, and logic."
    },
    {
      icon: <Bot className="w-6 h-6 text-violet-400" />,
      title: "LangGraph Cognitive Agent",
      description: "Ask questions and get precise answers backed by sources. Our AI traverses code dependencies and search logs to resolve architecture queries."
    },
    {
      icon: <History className="w-6 h-6 text-teal-400" />,
      title: "Saved Session History",
      description: "Keep track of all your analyzed repositories. Re-open past chats, view discussion history, or delete old sessions in a clean sidebar."
    }
  ];

  // Steps / How It Works
  const steps = [
    {
      num: "01",
      title: "Submit GitHub Link",
      description: "Enter your repository URL. RepoInsight connects and pulls your code branch securely."
    },
    {
      num: "02",
      title: "Semantic Embedding",
      description: "We use Google Gemini AI to generate vector embeddings of all code blocks, storing them in MongoDB Atlas."
    },
    {
      num: "03",
      title: "Chat & Explore",
      description: "Ask questions in plain English. Get complete markdown responses with code highlights, file links, and files context."
    }
  ];

  return (
    <div className="min-h-screen mesh-bg text-slate-100 flex flex-col relative overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[45%] h-[45%] rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[10%] w-[40%] h-[40%] rounded-full bg-violet-600/10 blur-[140px] pointer-events-none" />

      {/* Floating Header */}
      <header className="sticky top-0 z-50 w-full px-6 py-4 backdrop-blur-md border-b border-white/5 bg-slate-950/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 shadow-lg backdrop-blur-sm">
              <Code2 className="w-6 h-6 text-indigo-400" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">
              RepoInsight
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="px-5 py-2.5 text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all shadow-md shadow-black/10 text-white"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-16 text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-4 h-4 text-indigo-400" /> Powered by LangGraph & Gemini AI
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight text-white">
            Understand Any Codebase{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-400">
              in Seconds
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Stop digging through folders and reading files one by one. Clone, index, and chat with your repository directly to resolve bugs and explore architecture instantly.
          </p>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/register" 
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold rounded-2xl transition-all duration-300 shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 group"
            >
              Start Analyzing Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a 
              href="#features" 
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white font-semibold rounded-2xl transition-all"
            >
              Explore Features
            </a>
          </div>
        </motion.div>

        {/* Mock Product Dashboard Visual */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-5xl mt-16 rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl relative"
        >
          {/* Header Bar */}
          <div className="px-5 py-4 border-b border-white/5 bg-slate-950/40 flex items-center justify-between">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/40" />
              <div className="w-3 h-3 rounded-full bg-amber-500/40" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/40" />
            </div>
            <div className="px-4 py-1.5 bg-slate-900/60 rounded-xl border border-white/5 text-xs text-slate-400 flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>https://github.com/example/my-project</span>
            </div>
            <div className="w-8" />
          </div>

          {/* Body Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 min-h-[420px] text-left">
            {/* Mock Sidebar */}
            <div className="hidden md:flex flex-col border-r border-white/5 bg-slate-950/20 p-4 space-y-3">
              <div className="text-xs font-semibold text-slate-500 px-2 uppercase tracking-wider">Histories</div>
              <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-medium text-slate-200 truncate">example/my-project</span>
              </div>
              <div className="p-2.5 bg-transparent rounded-xl flex items-center gap-2.5 opacity-40">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-medium text-slate-300 truncate">facebook/react</span>
              </div>
            </div>

            {/* Mock Chat Area */}
            <div className="col-span-3 p-6 flex flex-col justify-between bg-slate-900/40">
              <div className="space-y-4">
                {/* User Message */}
                <div className="flex gap-3 flex-row-reverse">
                  <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white shrink-0">
                    <User className="w-4.5 h-4.5" />
                  </div>
                  <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm max-w-[80%] font-medium">
                    Where is the user authentication middleware defined?
                  </div>
                </div>

                {/* Agent Message */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 shrink-0">
                    <Bot className="w-4.5 h-4.5 text-cyan-300" />
                  </div>
                  <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl rounded-tl-sm p-4 text-sm max-w-[80%] space-y-2.5 text-slate-300">
                    <p>The authentication middleware is defined in [auth.js](file:///server/middleware/auth.js). It extracts the JWT token from headers:</p>
                    <pre className="bg-slate-950/80 p-3 rounded-lg border border-white/5 text-xs font-mono text-cyan-300 overflow-x-auto">
{`const auth = jwt.verify(token, JWT_SECRET);
req.user = auth;`}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Mock Chat Input */}
              <div className="mt-6 p-2 bg-slate-950/80 border border-white/5 rounded-xl flex items-center justify-between">
                <span className="text-sm text-slate-500 pl-3">Ask about authentication, modules, or variables...</span>
                <div className="p-2.5 bg-cyan-600 text-white rounded-lg"><ArrowRight className="w-4.5 h-4.5" /></div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            Designed for Developers Who Value Speed
          </h2>
          <p className="text-slate-400 leading-relaxed text-lg">
            Built using advanced LLM abstractions to read and compile semantic dependencies across your repositories.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -6, borderColor: "rgba(99, 102, 241, 0.3)" }}
              className="glass-panel p-8 rounded-3xl border border-white/5 bg-slate-900/10 transition-all flex items-start gap-6 hover:shadow-xl hover:shadow-indigo-500/5"
            >
              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 shadow-md shrink-0">
                {feat.icon}
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">{feat.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{feat.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-white/5 bg-indigo-950/5">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-20">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">How RepoInsight Works</h2>
          <p className="text-slate-400">Get up and running in less than a minute.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
          {/* Connector Line for Desktop */}
          <div className="hidden md:block absolute top-[40px] left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-indigo-500/20 via-cyan-500/30 to-indigo-500/20 z-0" />
          
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center text-center relative z-10 space-y-5">
              <div className="w-16 h-16 rounded-full bg-slate-900 border border-white/10 text-white font-extrabold flex items-center justify-center text-xl shadow-lg relative group-hover:border-cyan-500">
                <span className="text-indigo-400">{step.num}</span>
              </div>
              <h3 className="text-xl font-bold text-white">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
        <div className="glass-panel p-10 md:p-16 rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/20 via-slate-900/40 to-cyan-950/25 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-indigo-500/5 blur-[80px] pointer-events-none" />
          <div className="space-y-6 relative z-10 max-w-2xl mx-auto">
            <Zap className="w-10 h-10 text-cyan-400 mx-auto animate-pulse" />
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Ready to explore your code?
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              Sign up today and start chatting with your codebase in real-time. No configuration or API keys needed to get started.
            </p>
            <div className="pt-4">
              <Link 
                to="/register" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-semibold rounded-2xl transition-all shadow-xl shadow-cyan-500/20 group"
              >
                Create Your Account
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 mt-auto border-t border-white/5 py-12 px-6 bg-slate-950/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <Code2 className="w-5 h-5 text-indigo-400" />
            <span className="text-base font-bold text-white">RepoInsight</span>
          </div>

          <div className="flex items-center gap-4">
            <a href="mailto:shrishtitomar300@gmail.com" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-slate-400 hover:text-white transition-colors" title="Email">
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
            </a>
            <a href="https://github.com/shrish98" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-slate-400 hover:text-white transition-colors" title="GitHub">
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
            </a>
            <a href="https://www.linkedin.com/in/shrishti-tomar-a924a1274/" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-slate-400 hover:text-white transition-colors" title="LinkedIn">
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
            </a>
          </div>

          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} RepoInsight. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
