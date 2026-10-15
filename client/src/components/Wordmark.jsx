// A magnifying glass over a dot of code: looking into a repository.
export function Mark({ className = 'h-7 w-7' }) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true">
      <rect width="28" height="28" rx="7" fill="#5b4cf5" />
      <circle cx="12" cy="12" r="5.5" fill="none" stroke="#fff" strokeWidth="2.4" />
      <path d="M16 16l5.5 5.5" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1.8" fill="#7fe3f5" />
    </svg>
  );
}

export default function Wordmark({ className = '', light = false }) {
  return (
    <span
      className={`inline-flex items-center gap-2.5 text-[17px] font-bold tracking-[-0.01em] ${light ? 'text-white' : 'text-ink'} ${className}`}
      style={{ fontStretch: '108%' }}
    >
      <Mark />
      RepoInsight
    </span>
  );
}
