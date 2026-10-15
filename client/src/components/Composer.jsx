import { useEffect, useRef } from 'react';
import VoiceChatControls from './VoiceChatControls';

export default function Composer({ handleAskQuestion, question, setQuestion, isAsking, isReady, chatHistory, suggestions = [] }) {
  const textareaRef = useRef(null);
  const latest = chatHistory[chatHistory.length - 1];

  // Grow with the text, up to the max-height set in CSS.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [question]);

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleAskQuestion(e);
    }
  };

  const disabled = isAsking || !isReady;

  return (
    <form onSubmit={handleAskQuestion} className="shrink-0 bg-white px-4 pb-4 pt-2 sm:px-6">
      <div className="mx-auto max-w-3xl">
        {suggestions.length > 0 && chatHistory.length === 0 && (
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            {suggestions.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleAskQuestion(null, q)}
                disabled={disabled}
                className="shrink-0 rounded-full border border-line bg-white px-3 py-1 text-[13px] text-ink-2 transition hover:border-accent hover:text-accent disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <div className="rounded-xl border border-line bg-white shadow-[0_1px_2px_rgb(31_35_40/0.06),0_8px_24px_-16px_rgb(31_35_40/0.3)] transition focus-within:border-accent focus-within:ring-[3px] focus-within:ring-accent/15">
          <label htmlFor="question" className="sr-only">
            Your question
          </label>
          <textarea
            ref={textareaRef}
            id="question"
            rows={1}
            placeholder={isReady ? 'Ask a question about this repository…' : 'Analyze a repository first'}
            className="block max-h-40 min-h-[48px] w-full resize-none bg-transparent px-3.5 pb-1 pt-3 text-[15px] leading-6 placeholder:text-ink-3 focus:outline-none"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={disabled}
          />
          <div className="flex items-center gap-1 px-2 pb-2">
            <VoiceChatControls
              setQuestion={setQuestion}
              isAsking={isAsking}
              isReady={isReady}
              latestAgentMessage={latest?.role === 'agent' && !latest.error ? latest.text : ''}
            />
            <span className="ml-auto mr-2 hidden text-xs text-ink-3 sm:inline">Enter to send · Shift + Enter for a new line</span>
            <button type="submit" disabled={disabled || !question.trim()} className="btn-primary ml-auto h-9 shrink-0 sm:ml-0">
              Ask
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
