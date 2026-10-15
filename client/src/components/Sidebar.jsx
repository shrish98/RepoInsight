import { useState } from 'react';
import { Plus, Search, Trash2, X } from 'lucide-react';
import Wordmark from './Wordmark';
import { RepoIcon } from './RepoIcon';
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
  const [filter, setFilter] = useState('');
  const choose = (fn) => (...args) => {
    fn(...args);
    onClose();
  };

  const confirmDelete = (url) => {
    if (window.confirm(`Delete your questions about ${repoName(url)}?`)) handleDeleteSession(url);
  };

  const shown = savedSessions.filter((s) => repoName(s.repoUrl).toLowerCase().includes(filter.trim().toLowerCase()));

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-ink/30 lg:hidden" onClick={onClose} aria-hidden="true" />}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[268px] flex-col border-r border-line bg-subtle transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Repositories"
      >
        <div className="flex h-14 shrink-0 items-center justify-between px-4">
          <Wordmark />
          <button type="button" onClick={onClose} className="rounded-md p-1.5 text-ink-2 hover:bg-sunken lg:hidden" aria-label="Close menu">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2.5 px-3 pb-2">
          <button type="button" onClick={choose(onNew)} className="btn-primary h-9 w-full text-sm">
            <Plus className="h-4 w-4" strokeWidth={2.5} /> New analysis
          </button>
          {savedSessions.length > 3 && (
            <label className="flex items-center gap-2 rounded-lg border border-line bg-white px-2.5 py-1.5 text-sm focus-within:border-accent focus-within:ring-[3px] focus-within:ring-accent/15">
              <Search className="h-3.5 w-3.5 text-ink-3" />
              <span className="sr-only">Filter repositories</span>
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter repositories"
                className="min-w-0 flex-1 bg-transparent placeholder:text-ink-3 focus:outline-none"
              />
            </label>
          )}
        </div>

        <p className="px-4 pb-1 pt-3 text-xs font-semibold text-ink-2">Recent</p>
        <ul className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-3 pb-3">
          {savedSessions.length === 0 ? (
            <li className="px-2 py-2 text-sm leading-6 text-ink-3">Nothing yet. Repositories you ask about show up here.</li>
          ) : shown.length === 0 ? (
            <li className="px-2 py-2 text-sm text-ink-3">No repositories match “{filter}”.</li>
          ) : (
            shown.map((session) => {
              const active = repoUrl === session.repoUrl;
              const [owner, name] = repoName(session.repoUrl).split('/');
              return (
                <li key={session._id} className="group relative">
                  {active && <span aria-hidden className="absolute -left-3 bottom-2 top-2 w-[3px] rounded-r bg-accent" />}
                  <button
                    type="button"
                    onClick={choose(() => loadSession(session.repoUrl))}
                    aria-current={active ? 'true' : undefined}
                    className={`flex w-full items-center gap-2.5 rounded-lg py-2 pl-2.5 pr-9 text-left text-[13.5px] transition ${
                      active ? 'bg-white shadow-[0_0_0_1px_var(--color-line),0_1px_2px_rgb(31_35_40/0.06)]' : 'hover:bg-sunken'
                    }`}
                  >
                    <RepoIcon className="h-4 w-4 shrink-0 text-ink-3" />
                    <span className="min-w-0 flex-1 truncate">
                      <span className="text-ink-2">{owner}/</span>
                      <span className="font-semibold text-ink">{name}</span>
                    </span>
                    <span className="shrink-0 text-xs text-ink-3 group-hover:invisible">{formatDate(session.updatedAt)}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => confirmDelete(session.repoUrl)}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-ink-3 opacity-0 hover:bg-danger-soft hover:text-danger focus:opacity-100 group-hover:opacity-100"
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
          <span className="flex min-w-0 items-center gap-2.5">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" width="28" height="28" className="h-7 w-7 shrink-0 rounded-full border border-line" />
            ) : (
              <span aria-hidden className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent-soft text-sm font-bold uppercase text-accent-strong">
                {(user?.githubLogin ?? user?.email ?? '?').charAt(0)}
              </span>
            )}
            <span className="truncate text-sm font-medium text-ink" title={user?.email}>
              {user?.githubLogin ?? user?.email ?? 'Signed in'}
            </span>
          </span>
          <button type="button" onClick={logout} className="shrink-0 text-sm text-ink-2 hover:text-ink">
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
