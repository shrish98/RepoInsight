// A drawing sheet: title block along the bottom, a highlighted box, and a red-pen circle.
export function Mark({ className = 'h-6 w-6' }) {
  return (
    <svg viewBox="0 0 26 26" fill="none" className={className} aria-hidden="true">
      <rect x="1.5" y="1.5" width="23" height="23" rx="3" fill="#fffdf8" stroke="#3b4fa0" strokeWidth="2" />
      <path d="M1.5 17h23M17 17v7.5" stroke="#3b4fa0" strokeWidth="2" />
      <rect x="5" y="5" width="9" height="8" rx="1.5" fill="#f7dd4a" />
      <circle cx="20.5" cy="7.5" r="2.5" stroke="#c23b25" strokeWidth="2" />
    </svg>
  );
}

export default function Wordmark({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 font-display text-[19px] font-bold tracking-[0.005em] text-ink ${className}`}>
      <Mark />
      RepoInsight
    </span>
  );
}
