// GitHub's Octicons "repo" and "file" marks.
export function RepoIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
      <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.71 1.71.75.75 0 0 1-1.06 1.06A2.49 2.49 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.71A2.49 2.49 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.09a.25.25 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z" />
    </svg>
  );
}

export function FileIcon({ className = 'h-3 w-3' }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
      <path d="M2 1.75C2 .78 2.78 0 3.75 0h6.59c.46 0 .9.18 1.23.51l2.92 2.92c.33.33.51.77.51 1.23v9.59A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .14.11.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Z" />
    </svg>
  );
}

// A file reference that opens on GitHub when the path is specific enough to link.
export function FilePill({ href, children }) {
  const content = (
    <>
      <FileIcon />
      {children}
    </>
  );
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="file-pill" title="Open on GitHub">
      {content}
    </a>
  ) : (
    <code className="file-pill">{content}</code>
  );
}
