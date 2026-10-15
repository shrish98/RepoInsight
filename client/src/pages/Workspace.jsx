import { useContext, useRef, useState } from 'react';
import { ChevronDown, Menu } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useChatSession } from '../hooks/useChatSession';
import { useMediaQuery } from '../hooks/useMediaQuery';
import Sidebar from '../components/Sidebar';
import RepoBar from '../components/RepoBar';
import RepoReport from '../components/RepoReport';
import Transcript from '../components/Transcript';
import Composer from '../components/Composer';
import Wordmark from '../components/Wordmark';
import { RepoIcon } from '../components/RepoIcon';
import { repoName } from '../utils/repo';

const examples = [
  { url: 'https://github.com/expressjs/cors', note: 'CORS middleware for Express. Small, so it indexes quickly.' },
  { url: 'https://github.com/shrish98/dropalert', note: 'A price tracker built on Next.js, Supabase and Firecrawl.' },
  { url: 'https://github.com/shrish98/TaskForge', note: 'A job queue on BullMQ and Redis with a live dashboard.' },
];

function EmptyState({ onPick }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <h1 className="rise text-[1.9rem] font-[760] leading-tight tracking-[-0.025em]" style={{ fontStretch: '108%' }}>
        Which repository should we read?
      </h1>
      <p className="rise mt-3 leading-7 text-ink-2" style={{ '--d': '0.06s' }}>
        Paste a public GitHub URL above. Indexing reads every source file once, then you can ask as many questions as you
        like.
      </p>

      <p className="rise mt-10 text-[13px] font-semibold text-ink-2" style={{ '--d': '0.12s' }}>
        Or start with one of these
      </p>
      <ul className="mt-3 space-y-2">
        {examples.map((ex, i) => {
          const [owner, name] = repoName(ex.url).split('/');
          return (
            <li key={ex.url} className="rise" style={{ '--d': `${0.16 + i * 0.06}s` }}>
              <button
                type="button"
                onClick={() => onPick(ex.url)}
                className="group card flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition hover:-translate-y-px hover:border-accent/40 hover:shadow-[0_10px_24px_-16px_rgb(31_35_40/0.35)]"
              >
                <RepoIcon className="h-5 w-5 shrink-0 text-ink-3" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px]">
                    <span className="text-ink-2">{owner} / </span>
                    <span className="font-semibold text-link group-hover:underline">{name}</span>
                  </span>
                  <span className="mt-0.5 block text-sm text-ink-3">{ex.note}</span>
                </span>
                <span className="shrink-0 text-sm font-semibold text-accent opacity-0 transition group-hover:opacity-100">Use →</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const indexingSteps = [
  'Reading the default branch through the GitHub API',
  'Skipping dependencies, build output and binary files',
  'Splitting files into overlapping chunks',
  'Embedding each chunk and storing it in the vector index',
  'Writing the overview, stack and architecture diagram',
];

// Indexing is a single request, so there's no real per-step progress to show. Say what's happening instead.
function IndexingNote({ repoUrl }) {
  const [owner, name] = repoName(repoUrl).split('/');
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <div className="rise card overflow-hidden">
        <div className="flex items-center gap-2.5 border-b border-line bg-subtle px-4 py-3">
          <span className="spinner" />
          <span className="min-w-0 truncate text-[15px]">
            Indexing <span className="text-ink-2">{owner} / </span>
            <span className="font-semibold">{name}</span>
          </span>
        </div>
        <div className="relative h-1 overflow-hidden bg-subtle">
          <div className="indeterminate absolute inset-y-0 w-1/3 rounded-full bg-gradient-to-r from-transparent via-accent to-transparent" />
        </div>
        <div className="px-4 py-5">
          <p className="text-[15px] text-ink-2">This page fills in when it’s done. Meanwhile, here’s what’s happening:</p>
          <ol className="mt-4 space-y-3">
            {indexingSteps.map((step, i) => (
              <li key={step} className="rise flex items-center gap-3 text-[15px] text-[#3d444d]" style={{ '--d': `${0.1 + i * 0.08}s` }}>
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line bg-white text-xs font-bold text-ink-2">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

function CollapsibleReport({ repoUrl, summary, onSelectQuestion, startOpen }) {
  const [open, setOpen] = useState(startOpen);
  return (
    <div className="card mb-9">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="min-w-0">
          <span className="block text-[15px] font-semibold">Report</span>
          <span className="mt-0.5 block truncate text-[13px] text-ink-3">Overview, languages, stack and architecture</span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-ink-2 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="border-t border-line px-4 pb-4 pt-4">
          <RepoReport repoUrl={repoUrl} summary={summary} onSelectQuestion={onSelectQuestion} showHeader={false} />
        </div>
      )}
    </div>
  );
}

export default function Workspace() {
  const { user, token, logout } = useContext(AuthContext);
  const session = useChatSession(token, logout);
  const [menuOpen, setMenuOpen] = useState(false);
  const repoInputRef = useRef(null);
  // Wide screens get the report in a side panel; narrower ones get it inline above the transcript.
  const isWide = useMediaQuery('(min-width: 1280px)');

  const {
    repoUrl, setRepoUrl, isAnalyzing, analysisStatus, isReady, repoSummary,
    question, setQuestion, chatHistory, isAsking, savedSessions, chatContainerRef,
    startNew, loadSession, handleDeleteSession, handleAnalyze, handleAskQuestion,
  } = session;

  const hasRepo = isReady || chatHistory.length > 0 || Boolean(repoSummary);
  const ask = (q) => handleAskQuestion(null, q);
  // The URL field only exists once the bar switches back to its form, so focus after that render.
  const focusRepoInput = () => setTimeout(() => repoInputRef.current?.focus(), 0);

  const pickExample = (url) => {
    setRepoUrl(url);
    focusRepoInput();
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-page">
      <Sidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        savedSessions={savedSessions}
        repoUrl={repoUrl}
        onNew={() => {
          startNew();
          focusRepoInput();
        }}
        loadSession={loadSession}
        handleDeleteSession={handleDeleteSession}
        user={user}
        logout={logout}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-line bg-white px-2 lg:hidden">
          <button type="button" onClick={() => setMenuOpen(true)} className="rounded-md p-2 text-ink-2 hover:bg-sunken" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <Wordmark />
        </header>

        <div className="flex min-h-0 flex-1">
          <main className="flex min-w-0 flex-1 flex-col">
            <RepoBar
              inputRef={repoInputRef}
              repoUrl={repoUrl}
              setRepoUrl={setRepoUrl}
              handleAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
              analysisStatus={analysisStatus}
              isReady={isReady}
              hasRepo={hasRepo}
            />

            <div ref={chatContainerRef} className="min-h-0 flex-1 overflow-y-auto">
              {hasRepo ? (
                <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
                  {repoSummary && !isWide && (
                    <CollapsibleReport
                      key={repoUrl}
                      repoUrl={repoUrl}
                      summary={repoSummary}
                      onSelectQuestion={ask}
                      startOpen={chatHistory.length === 0}
                    />
                  )}
                  <Transcript chatHistory={chatHistory} isAsking={isAsking} repoUrl={repoUrl} />
                </div>
              ) : isAnalyzing ? (
                <IndexingNote repoUrl={repoUrl} />
              ) : (
                <EmptyState onPick={pickExample} />
              )}
            </div>

            {hasRepo && (
              <Composer
                handleAskQuestion={handleAskQuestion}
                question={question}
                setQuestion={setQuestion}
                isAsking={isAsking}
                isReady={isReady}
                chatHistory={chatHistory}
                suggestions={repoSummary?.suggestedQuestions}
              />
            )}
          </main>

          {repoSummary && isWide && (
            <aside className="w-[392px] shrink-0 overflow-y-auto border-l border-line bg-white px-6 py-5" aria-label="Repository report">
              <RepoReport repoUrl={repoUrl} summary={repoSummary} onSelectQuestion={ask} />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
