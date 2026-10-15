import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Check, Copy } from 'lucide-react';
import { useElapsed } from '../hooks/useElapsed';
import { FILE_REF, githubFileUrl } from '../utils/repo';
import { FilePill } from './RepoIcon';

// The model sometimes writes <br> inside markdown table cells. Raw HTML isn't rendered,
// so swap it for a separator instead of showing the tag.
const cleanAnswer = (text = '') => text.replace(/<br\s*\/?>/gi, ' · ');

// Files the answer mentions in `backticks`, in order, without duplicates.
const citedFiles = (text = '') => [
  ...new Set([...text.matchAll(/`([^`\n]+)`/g)].map((m) => m[1].trim()).filter((ref) => FILE_REF.test(ref))),
];

// The API stores a flat list of messages; pair each question with the answer that follows it.
const toPairs = (messages) =>
  messages.reduce((pairs, msg) => {
    if (msg.role === 'user') pairs.push({ question: msg.text, answer: null });
    else if (pairs.length && !pairs[pairs.length - 1].answer) pairs[pairs.length - 1].answer = msg;
    else pairs.push({ question: null, answer: msg });
    return pairs;
  }, []);

function CopyButton({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* Clipboard can be blocked; nothing useful to show. */
    }
  };
  return (
    <button type="button" onClick={copy} className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium text-ink-2 hover:bg-sunken hover:text-ink">
      {copied ? <Check className="h-3.5 w-3.5 text-ok" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copied' : label}
    </button>
  );
}

const nodeText = (node) =>
  typeof node === 'string' ? node : Array.isArray(node) ? node.map(nodeText).join('') : node?.props ? nodeText(node.props.children) : '';

function markdownComponents(repoUrl) {
  return {
    code({ className, children, ...props }) {
      const text = String(children);
      const isBlock = /language-/.test(className || '') || text.includes('\n');
      if (!isBlock && FILE_REF.test(text.trim())) {
        return <FilePill href={githubFileUrl(repoUrl, text)}>{text.trim()}</FilePill>;
      }
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    // Code blocks get a GitHub-style header with the language and a copy button.
    pre({ children }) {
      const child = Array.isArray(children) ? children[0] : children;
      const language = /language-([\w-]+)/.exec(child?.props?.className || '')?.[1];
      return (
        <div className="not-prose overflow-hidden rounded-xl border border-line bg-white">
          <div className="flex items-center justify-between border-b border-line bg-subtle py-1 pl-3.5 pr-1.5 text-xs text-ink-2">
            <span className="font-mono">{language || 'code'}</span>
            <CopyButton text={nodeText(child).replace(/\n$/, '')} />
          </div>
          <pre>{children}</pre>
        </div>
      );
    },
  };
}

function Thinking() {
  const elapsed = useElapsed(true);
  return (
    <div className="rise overflow-hidden rounded-xl border border-line" role="status">
      <div className="flex items-center gap-2.5 border-b border-line bg-subtle px-4 py-2.5 text-[13px] text-ink-2">
        <span className="spinner" />
        <span className="font-semibold text-ink">Reading the code</span>
        <span className="font-mono text-xs tabular-nums text-ink-3">{elapsed}</span>
      </div>
      <div className="space-y-2.5 px-4 py-4" aria-hidden>
        <div className="skeleton h-3 w-11/12 rounded" />
        <div className="skeleton h-3 w-4/5 rounded" />
        <div className="skeleton h-3 w-2/3 rounded" />
      </div>
    </div>
  );
}

export default function Transcript({ chatHistory, isAsking, repoUrl }) {
  const pairs = toPairs(chatHistory);

  if (pairs.length === 0) {
    return <p className="text-[15px] text-ink-3">No questions yet. Ask one below, or start with a suggested question.</p>;
  }

  return (
    <ol className="space-y-9">
      {pairs.map((pair, i) => {
        const isLast = i === pairs.length - 1;
        const answerText = pair.answer && !pair.answer.error ? cleanAnswer(pair.answer.text) : '';
        const sources = citedFiles(answerText);
        return (
          <li key={i} className={isLast ? 'rise' : undefined}>
            <p className="flex items-start gap-3 text-[17px] font-semibold leading-7 tracking-[-0.005em]">
              <span aria-hidden className="mt-0.5 h-6 w-6 shrink-0 rounded-full bg-[conic-gradient(#5b4cf5_0_30%,#22c7e8_0_60%,#ff6a55_0)]" />
              {pair.question ?? '—'}
            </p>

            <div className="mt-3.5">
              {pair.answer?.error ? (
                <p className="rounded-xl border border-danger/25 bg-danger-soft px-4 py-3 text-sm text-danger" role="alert">
                  Couldn’t get an answer: {pair.answer.text}
                </p>
              ) : pair.answer ? (
                <article className="overflow-hidden rounded-xl border border-line bg-white">
                  <header className="flex items-center gap-2 border-b border-line bg-subtle py-1.5 pl-4 pr-2 text-[13px] text-ink-2">
                    <span className="font-semibold text-ink">RepoInsight</span>
                    {sources.length > 0 && <span>· cited {sources.length} {sources.length === 1 ? 'file' : 'files'}</span>}
                    <span className="ml-auto">
                      <CopyButton text={answerText} />
                    </span>
                  </header>
                  <div className="prose-answer px-4 py-4 sm:px-5">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={markdownComponents(repoUrl)}>
                      {answerText}
                    </ReactMarkdown>
                  </div>
                  {sources.length > 0 && (
                    <footer className="flex flex-wrap items-center gap-1.5 border-t border-line px-4 py-2.5 text-xs font-semibold text-ink-2 sm:px-5">
                      Sources
                      {sources.map((ref) => (
                        <FilePill key={ref} href={githubFileUrl(repoUrl, ref)}>
                          {ref}
                        </FilePill>
                      ))}
                    </footer>
                  )}
                </article>
              ) : (
                isLast && isAsking && <Thinking />
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
