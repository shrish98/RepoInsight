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
    <form onSubmit={handleAskQuestion} className="shrink-0 border-t border-line bg-page px-4 pb-4 pt-3 sm:px-6">
      <div className="mx-auto max-w-3xl">
        {suggestions.length > 0 && chatHistory.length === 0 && (
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            {suggestions.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleAskQuestion(null, q)}
                disabled={disabled}
                className="shrink-0 rounded-full border-[1.5px] border-line-strong bg-surface px-3 py-1 text-[13.5px] text-ink-2 hover:border-accent hover:text-accent disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-end gap-1.5 rounded-xl border-[1.5px] border-line-strong bg-white p-1.5 shadow-[0_8px_20px_-16px_rgb(31_39_82/0.5)] focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/15">
          <label htmlFor="question" className="sr-only">
            Your question
          </label>
          <textarea
            ref={textareaRef}
            id="question"
            rows={1}
            placeholder={isReady ? 'Ask a question…' : 'Analyze a repository first'}
            className="max-h-40 min-h-[40px] flex-1 resize-none bg-transparent px-2.5 py-2 text-[15px] leading-6 placeholder:text-ink-3 focus:outline-none"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={disabled}
          />
          <VoiceChatControls
            setQuestion={setQuestion}
            isAsking={isAsking}
            isReady={isReady}
            latestAgentMessage={latest?.role === 'agent' && !latest.error ? latest.text : ''}
          />
          <button type="submit" disabled={disabled || !question.trim()} className="btn-primary h-10 shrink-0">
            Ask
          </button>
        </div>
        <p className="mt-1.5 hidden text-xs text-ink-3 sm:block">Enter to send · Shift + Enter for a new line</p>
      </div>
    </form>
  );
}
