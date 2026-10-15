// Three lines of "code", the last one indented and highlighted: what the tool points you to.
export function Mark({ className = 'h-6 w-6' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="#17181b" />
      <rect x="8" y="9" width="16" height="2.4" rx="1.2" fill="#fff" />
      <rect x="8" y="14.8" width="10" height="2.4" rx="1.2" fill="#fff" />
      <rect x="11" y="20.6" width="13" height="2.4" rx="1.2" fill="#7c97f0" />
    </svg>
  );
}

export default function Wordmark({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 text-[15px] font-semibold tracking-tight text-ink ${className}`}>
      <Mark />
      RepoInsight
    </span>
  );
}
