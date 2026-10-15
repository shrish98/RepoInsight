import { lazy, Suspense } from 'react';
import { repoName } from '../utils/repo';
import { layerOf } from '../utils/layers';

// Mermaid is most of the bundle, so it's only fetched once a report has a diagram to draw.
const MermaidDiagram = lazy(() => import('./MermaidDiagram'));

function Section({ label, children }) {
  return (
    <section className="border-t-[1.5px] border-line pt-4">
      <h3 className="eyebrow">{label}</h3>
      <div className="mt-2.5">{children}</div>
    </section>
  );
}

export default function RepoReport({ repoUrl, summary, onSelectQuestion, showHeader = true }) {
  const { overview, techStack = [], entryPoints = [], architectureDiagram, suggestedQuestions = [] } = summary;

  return (
    <div className="space-y-5">
      {showHeader && (
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="min-w-0 break-all font-mono text-[15px] font-semibold">{repoName(repoUrl)}</h2>
          <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 text-sm font-semibold text-accent hover:underline">
            GitHub ↗
          </a>
        </div>
      )}

      {overview && (
        <Section label="Overview">
          <p className="text-[15px] leading-7 text-ink-2">{overview}</p>
        </Section>
      )}

      {techStack.length > 0 && (
        <Section label="Stack">
          <ul className="flex flex-wrap gap-1.5">
            {techStack.map((tech) => (
              <li key={tech} className={`chip tint-${layerOf(tech)}`}>
                {tech}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {entryPoints.length > 0 && (
        <Section label="Start reading at">
          <ul className="space-y-1">
            {entryPoints.map((file) => (
              <li key={file} className="flex items-baseline gap-2 break-all font-mono text-[13px] text-ink">
                <span aria-hidden className="h-1.5 w-1.5 shrink-0 -translate-y-px rounded-full bg-pen" />
                {file}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {architectureDiagram && (
        <Section label="Architecture">
          <Suspense fallback={<p className="text-sm text-ink-3">Drawing the diagram…</p>}>
            <MermaidDiagram chart={architectureDiagram} />
          </Suspense>
        </Section>
      )}

      {suggestedQuestions.length > 0 && onSelectQuestion && (
        <Section label="Questions to start with">
          <ul className="-mx-2">
            {suggestedQuestions.map((q) => (
              <li key={q}>
                <button
                  type="button"
                  onClick={() => onSelectQuestion(q)}
                  className="flex w-full gap-2 rounded-md px-2 py-1.5 text-left text-[14.5px] leading-6 text-ink-2 hover:bg-sunken hover:text-ink"
                >
                  <span aria-hidden className="font-bold text-pen">→</span>
                  {q}
                </button>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}
