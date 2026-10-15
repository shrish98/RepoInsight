import { Plus, Trash2, X } from 'lucide-react';
import Wordmark from './Wordmark';
import { repoName } from '../utils/repo';

const formatDate = (iso) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

export default function Sidebar({
  open,
  onClose,
  savedSessions,
  repoUrl,
  onNew,
  loadSession,
  handleDeleteSession,
  user,
  logout,
}) {
  const choose = (fn) => (...args) => {
    fn(...args);
    onClose();
  };

  const confirmDelete = (url) => {
    if (window.confirm(`Delete your questions about ${repoName(url)}?`)) handleDeleteSession(url);
  };

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-ink/25 lg:hidden" onClick={onClose} aria-hidden="true" />}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[264px] flex-col border-r border-line bg-surface transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Repositories"
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-4">
          <Wordmark />
          <button type="button" onClick={onClose} className="rounded p-1.5 text-ink-2 hover:bg-sunken lg:hidden" aria-label="Close menu">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-3">
          <button type="button" onClick={choose(onNew)} className="btn-secondary w-full justify-start px-3">
            <Plus className="h-4 w-4" /> New analysis
          </button>
        </div>

        <p className="eyebrow px-4 pb-1.5 pt-2">Repositories</p>
        <ul className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
          {savedSessions.length === 0 ? (
            <li className="px-2.5 py-2 text-sm leading-6 text-ink-3">Nothing yet. Repositories you ask about show up here.</li>
          ) : (
            savedSessions.map((session) => {
              const active = repoUrl === session.repoUrl;
              return (
                <li key={session._id} className="group relative">
                  <button
                    type="button"
                    onClick={choose(() => loadSession(session.repoUrl))}
                    aria-current={active ? 'true' : undefined}
                    className={`w-full rounded-md py-2 pl-2.5 pr-9 text-left ${active ? 'bg-sunken' : 'hover:bg-sunken/60'}`}
                  >
                    <span className="block truncate font-mono text-[13px]">{repoName(session.repoUrl)}</span>
                    <span className="block text-xs text-ink-3">{formatDate(session.updatedAt)}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => confirmDelete(session.repoUrl)}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1.5 text-ink-3 opacity-0 hover:bg-danger-soft hover:text-danger focus:opacity-100 group-hover:opacity-100"
                    aria-label={`Delete ${repoName(session.repoUrl)}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              );
            })
          )}
        </ul>

        <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
          <span className="truncate text-sm text-ink-2">{user?.email ?? 'Signed in'}</span>
          <button type="button" onClick={logout} className="shrink-0 text-sm text-ink-2 hover:text-ink">
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
