import { lazy, Suspense } from 'react';
import { githubFileUrl, repoName } from '../utils/repo';
import { languageShares } from '../utils/languages';
import LanguageBar from './LanguageBar';

// Mermaid is most of the bundle, so it's only fetched once a report has a diagram to draw.
const MermaidDiagram = lazy(() => import('./MermaidDiagram'));

function Section({ label, children }) {
  return (
    <section className="border-t border-line-soft py-4 first:border-t-0 first:pt-0">
      <h3 className="text-[13px] font-semibold text-ink-2">{label}</h3>
      <div className="mt-2">{children}</div>
    </section>
  );
}

export default function RepoReport({ repoUrl, summary, onSelectQuestion, showHeader = true }) {
  const { overview, techStack = [], entryPoints = [], architectureDiagram, suggestedQuestions = [], languages } = summary;
  const shares = languageShares(languages);

  return (
    <div>
      {showHeader && (
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 className="text-base font-bold">Report</h2>
          <span className="truncate font-mono text-xs text-ink-3">{repoName(repoUrl)}</span>
        </div>
      )}

      {overview && (
        <Section label="About">
          <p className="text-[14.5px] leading-6 text-[#3d444d]">{overview}</p>
        </Section>
      )}

      {shares.length > 0 && (
        <Section label="Languages">
          <LanguageBar shares={shares} />
        </Section>
      )}

      {techStack.length > 0 && (
        <Section label="Stack">
          <ul className="flex flex-wrap gap-1.5">
            {techStack.map((tech) => (
              <li key={tech} className="rounded-full border border-line px-2.5 py-0.5 text-[13px] font-medium">
                {tech}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {entryPoints.length > 0 && (
        <Section label="Start reading at">
          <ul className="space-y-0.5 font-mono text-[13px] leading-6">
            {entryPoints.map((file) => {
              const href = githubFileUrl(repoUrl, file);
              return (
                <li key={file} className="break-all">
                  {href ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-link hover:underline">
                      {file}
                    </a>
                  ) : (
                    file
                  )}
                </li>
              );
            })}
          </ul>
        </Section>
      )}

      {architectureDiagram && (
        <Section label="Architecture">
          <Suspense fallback={<div className="skeleton h-40 rounded-xl" />}>
            <MermaidDiagram chart={architectureDiagram} />
          </Suspense>
        </Section>
      )}

      {suggestedQuestions.length > 0 && onSelectQuestion && (
        <Section label="Suggested questions">
          <ul className="-mx-2">
            {suggestedQuestions.map((q) => (
              <li key={q}>
                <button
                  type="button"
                  onClick={() => onSelectQuestion(q)}
                  className="group flex w-full gap-2 rounded-md px-2 py-1.5 text-left text-[14px] font-medium leading-6 text-link hover:bg-subtle"
                >
                  <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
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
