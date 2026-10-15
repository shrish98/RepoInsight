import { useElapsed } from '../hooks/useElapsed';
import { repoName } from '../utils/repo';
import { RepoIcon } from './RepoIcon';

export default function RepoBar({ repoUrl, setRepoUrl, handleAnalyze, isAnalyzing, analysisStatus, isReady, hasRepo, inputRef }) {
  const elapsed = useElapsed(isAnalyzing);
  const showRepo = repoUrl && (isReady || hasRepo) && !isAnalyzing && !analysisStatus;

  // Once a repository is loaded, the bar shows which one, like a GitHub page header.
  if (showRepo) {
    const [owner, name] = repoName(repoUrl).split('/');
    return (
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-white px-4 sm:px-6">
        <RepoIcon className="h-4 w-4 shrink-0 text-ink-2" />
        <h1 className="min-w-0 truncate text-[15px]">
          <span className="text-ink-2">{owner} / </span>
          <span className="font-semibold">{name}</span>
        </h1>
        {isReady && (
          <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-ok-soft px-2.5 py-0.5 text-xs font-semibold text-ok sm:inline-flex">
            <span aria-hidden className="live-dot h-1.5 w-1.5 rounded-full bg-[#2da44e]" />
            Indexed
          </span>
        )}
        <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary ml-auto h-8 shrink-0 px-3 text-[13px]">
          View on GitHub ↗
        </a>
      </div>
    );
  }

  return (
    <div className="shrink-0 border-b border-line bg-white px-4 py-3 sm:px-6">
      <form onSubmit={handleAnalyze} className="mx-auto flex max-w-3xl gap-2">
        <label htmlFor="repo-url" className="sr-only">
          GitHub repository URL
        </label>
        <div className="relative min-w-0 flex-1">
          <RepoIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
          <input
            ref={inputRef}
            id="repo-url"
            type="url"
            required
            spellCheck={false}
            placeholder="https://github.com/owner/repo"
            className="field pl-9 font-mono text-[14px]"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            disabled={isAnalyzing}
          />
        </div>
        <button type="submit" disabled={isAnalyzing || !repoUrl} className="btn-primary shrink-0">
          {isAnalyzing && <span className="spinner border-white/30 border-t-white" />}
          {isAnalyzing ? 'Indexing' : 'Analyze'}
        </button>
      </form>

      {analysisStatus?.type === 'loading' && (
        <p className="mx-auto mt-2 max-w-3xl text-sm text-ink-2" role="status">
          <span className="font-mono text-[13px] text-ink">{repoName(repoUrl)}</span>
          <span className="mx-1.5 text-ink-3">·</span>
          <span className="font-mono text-[13px] tabular-nums">{elapsed}</span>
          <span className="mx-1.5 text-ink-3">·</span>
          {analysisStatus.msg} Bigger repositories take longer.
        </p>
      )}
      {analysisStatus?.type === 'error' && (
        <p className="mx-auto mt-2 max-w-3xl text-sm text-danger" role="alert">
          {analysisStatus.msg}
        </p>
      )}
    </div>
  );
}
