import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { useElapsed } from '../hooks/useElapsed';

// The model sometimes writes <br> inside markdown table cells. Raw HTML isn't rendered,
// so swap it for a separator instead of showing the tag.
const cleanAnswer = (text = '') => text.replace(/<br\s*\/?>/gi, ' · ');

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
    <p className="flex items-center gap-2.5 text-sm text-ink-2" role="status">
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
          <li key={i} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-2">
            <span className="pt-0.5 font-mono text-xs text-ink-3">Q{i + 1}</span>
            <p className="font-medium leading-7">{pair.question ?? '—'}</p>

            <div className="col-start-2 mt-3">
              {pair.answer?.error ? (
                <p className="rounded-md border border-danger/20 bg-danger-soft px-3 py-2 text-sm text-danger" role="alert">
                  Couldn’t get an answer: {pair.answer.text}
                </p>
              ) : pair.answer ? (
                <div className="prose-answer border-l-2 border-line pl-4">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                    {cleanAnswer(pair.answer.text)}
                  </ReactMarkdown>
                </div>
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
