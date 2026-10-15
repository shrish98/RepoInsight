import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { useElapsed } from '../hooks/useElapsed';

// The model sometimes writes <br> inside markdown table cells. Raw HTML isn't rendered,
// so swap it for a separator instead of showing the tag.
const cleanAnswer = (text = '') => text.replace(/<br\s*\/?>/gi, ' · ');

// "server/lib/queue.js", "auth.js:42", "Dockerfile": inline code that names a file gets highlighted.
// The extension list keeps things like `resend.emails.send` from counting as files.
const FILE_REF =
  /^(?:[\w@.-]+\/)*[\w.-]*\.(?:[cm]?[jt]sx?|json|py|go|rs|java|kt|rb|php|cs|c|cpp|h|swift|vue|svelte|css|scss|html|md|mdx|ya?ml|toml|env|sh|sql|prisma|graphql|gql|xml|ini|txt|lock)(?::\d+(?:-\d+)?)?$|^(?:[\w@.-]+\/)*(?:Dockerfile|Makefile|Procfile)$/i;

const markdownComponents = {
  code({ className, children, ...props }) {
    const text = String(children);
    const isBlock = /language-/.test(className || '') || text.includes('\n');
    if (!isBlock && FILE_REF.test(text.trim())) {
      return (
        <code className="file-ref" {...props}>
          {children}
        </code>
      );
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
};

// The API stores a flat list of messages; pair each question with the answer that follows it.
const toPairs = (messages) =>
  messages.reduce((pairs, msg) => {
    if (msg.role === 'user') pairs.push({ question: msg.text, answer: null });
    else if (pairs.length && !pairs[pairs.length - 1].answer) pairs[pairs.length - 1].answer = msg;
    else pairs.push({ question: null, answer: msg });
    return pairs;
  }, []);

function Thinking() {
  const elapsed = useElapsed(true);
  return (
    <p className="flex items-center gap-2.5 text-[15px] text-ink-2" role="status">
      <span className="spinner" />
      Reading the code
      <span className="font-mono text-[13px] tabular-nums text-ink-3">{elapsed}</span>
    </p>
  );
}

export default function Transcript({ chatHistory, isAsking }) {
  const pairs = toPairs(chatHistory);

  if (pairs.length === 0) {
    return <p className="text-[15px] text-ink-3">No questions yet. Ask one below, or start with a suggested question.</p>;
  }

  return (
    <ol className="space-y-10">
      {pairs.map((pair, i) => {
        const isLast = i === pairs.length - 1;
        return (
          <li key={i} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-1">
            <span className="mt-1 h-fit w-fit rounded bg-accent px-1.5 font-mono text-[11px] font-semibold leading-5 text-white">
              Q{i + 1}
            </span>
            <p className="text-[16.5px] font-semibold leading-7">{pair.question ?? '—'}</p>

            <div className="col-start-2 mt-3">
              {pair.answer?.error ? (
                <p className="rounded-lg border border-danger/25 bg-danger-soft px-3 py-2 text-sm text-danger" role="alert">
                  Couldn’t get an answer: {pair.answer.text}
                </p>
              ) : pair.answer ? (
                <div className="prose-answer border-l-2 border-accent-soft pl-4 sm:pl-5">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={markdownComponents}>
                    {cleanAnswer(pair.answer.text)}
                  </ReactMarkdown>
                </div>
              ) : (
                isLast && isAsking && (
                  <div className="border-l-2 border-highlight pl-4 sm:pl-5">
                    <Thinking />
                  </div>
                )
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
