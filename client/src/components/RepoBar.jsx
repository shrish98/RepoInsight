import { useElapsed } from '../hooks/useElapsed';
import { repoName } from '../utils/repo';

export default function RepoBar({ repoUrl, setRepoUrl, handleAnalyze, isAnalyzing, analysisStatus, inputRef }) {
  const elapsed = useElapsed(isAnalyzing);

  return (
    <div className="shrink-0 border-b border-line bg-surface px-4 py-3 sm:px-6">
      <form onSubmit={handleAnalyze} className="mx-auto flex max-w-3xl gap-2">
        <label htmlFor="repo-url" className="sr-only">
          GitHub repository URL
        </label>
        <input
          ref={inputRef}
          id="repo-url"
          type="url"
          required
          spellCheck={false}
          placeholder="https://github.com/owner/repo"
          className="field min-w-0 flex-1 font-mono text-[14px]"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          disabled={isAnalyzing}
        />
        <button type="submit" disabled={isAnalyzing || !repoUrl} className="btn-primary shrink-0">
          {isAnalyzing && <span className="spinner border-white/40 border-t-white" />}
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
