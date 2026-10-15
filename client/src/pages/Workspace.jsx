import { useContext, useRef, useState } from 'react';
import { Menu } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useChatSession } from '../hooks/useChatSession';
import { useMediaQuery } from '../hooks/useMediaQuery';
import Sidebar from '../components/Sidebar';
import RepoBar from '../components/RepoBar';
import RepoReport from '../components/RepoReport';
import Transcript from '../components/Transcript';
import Composer from '../components/Composer';
import Wordmark from '../components/Wordmark';
import { repoName } from '../utils/repo';
import { layerForKey } from '../utils/layers';

const examples = [
  { url: 'https://github.com/expressjs/cors', note: 'CORS middleware for Express. Small, so it indexes quickly.' },
  { url: 'https://github.com/shrish98/dropalert', note: 'A price tracker built on Next.js, Supabase and Firecrawl.' },
  { url: 'https://github.com/shrish98/TaskForge', note: 'A job queue on BullMQ and Redis with a live dashboard.' },
];

function EmptyState({ onPick }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <p className="eyebrow">New analysis</p>
      <h1 className="mt-2 font-display text-[2rem] font-bold leading-tight">
        Which repository are we <span className="marker">reading?</span>
      </h1>
      <p className="mt-3 leading-7 text-ink-2">
        Paste a public GitHub URL above. Indexing reads every source file once, then you can ask as many questions as you
        like.
      </p>

      <p className="eyebrow mt-10">Or start with one of these</p>
      <ul className="mt-3 overflow-hidden rounded-xl border-[1.5px] border-line-strong bg-surface">
        {examples.map((ex) => (
          <li key={ex.url} className="border-line [&:not(:last-child)]:border-b-[1.5px]">
            <button type="button" onClick={() => onPick(ex.url)} className="group flex w-full items-center gap-3.5 px-4 py-3.5 text-left hover:bg-page">
              <span
                aria-hidden
                className={`tint-${layerForKey(repoName(ex.url))} grid h-8 w-8 shrink-0 place-items-center rounded-lg border-[1.5px] font-display font-bold uppercase`}
                style={{ background: 'var(--tint-fill)', borderColor: 'var(--tint-edge)', color: 'var(--tint-ink)' }}
              >
                {repoName(ex.url).split('/')[1].charAt(0)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-mono text-[14px] text-ink group-hover:text-accent">{repoName(ex.url)}</span>
                <span className="mt-0.5 block text-sm text-ink-3">{ex.note}</span>
              </span>
              <span className="shrink-0 text-sm font-semibold text-accent opacity-70 group-hover:opacity-100">Use →</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Tinted like the matching steps on the landing page.
const indexingSteps = [
  ['Reading the default branch through the GitHub API', 'services'],
  ['Skipping dependencies, build output and binary files', 'api'],
  ['Splitting files into overlapping chunks', 'api'],
  ['Embedding each chunk and storing it in the vector index', 'data'],
  ['Writing the overview, stack and architecture diagram', 'frontend'],
];

// Indexing is a single request, so there's no real per-step progress to show. Say what's happening instead.
function IndexingNote({ repoUrl }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <p className="eyebrow flex items-center gap-2">
        <span className="spinner" /> Indexing
      </p>
      <h1 className="mt-3 break-all font-mono text-xl font-semibold">{repoName(repoUrl)}</h1>
      <p className="mt-3 leading-7 text-ink-2">This page fills in when it’s done. Meanwhile, here’s what’s happening:</p>
      <ol className="mt-6 space-y-3">
        {indexingSteps.map(([step, layer], i) => (
          <li key={step} className="flex items-center gap-3 text-[15px] text-ink-2">
            <span
              className={`tint-${layer} grid h-[22px] min-w-[26px] shrink-0 place-items-center rounded-md border-[1.5px] font-mono text-xs font-semibold`}
              style={{ background: 'var(--tint-fill)', borderColor: 'var(--tint-edge)', color: 'var(--tint-ink)' }}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}

function CollapsibleReport({ repoUrl, summary, onSelectQuestion, startOpen }) {
  const [open, setOpen] = useState(startOpen);
  return (
    <div className="mb-10 rounded-xl border-[1.5px] border-line-strong bg-surface">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="min-w-0">
          <span className="eyebrow block">Report</span>
          <span className="mt-0.5 block truncate font-mono text-[14px] font-semibold">{repoName(repoUrl)}</span>
        </span>
        <span className="shrink-0 text-sm font-semibold text-accent">{open ? 'Hide' : 'Show'}</span>
      </button>
      {open && (
        <div className="border-t border-line px-4 pb-5 pt-4">
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

  const pickExample = (url) => {
    setRepoUrl(url);
    repoInputRef.current?.focus();
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
          repoInputRef.current?.focus();
        }}
        loadSession={loadSession}
        handleDeleteSession={handleDeleteSession}
        user={user}
        logout={logout}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-line bg-surface px-2 lg:hidden">
          <button type="button" onClick={() => setMenuOpen(true)} className="rounded p-2 text-ink-2 hover:bg-sunken" aria-label="Open menu">
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
                  <Transcript chatHistory={chatHistory} isAsking={isAsking} />
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
            <aside className="w-[390px] shrink-0 overflow-y-auto border-l border-line bg-surface px-6 py-6" aria-label="Repository report">
              <RepoReport repoUrl={repoUrl} summary={repoSummary} onSelectQuestion={ask} />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
