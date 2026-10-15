import { useContext, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Wordmark from '../components/Wordmark';
import GithubMark from '../components/GithubMark';

// Reasons the server's OAuth callback can send back in ?error=
const githubErrors = {
  github_denied: 'GitHub sign-in was cancelled.',
  github_state: 'That sign-in attempt expired. Please try again.',
  github_failed: 'GitHub sign-in didn’t work. Try again, or use your email below.',
  github_unavailable: 'GitHub sign-in isn’t set up on this server yet. Use your email for now.',
};

const copy = {
  login: {
    title: 'Sign in',
    intro: 'Pick up where you left off.',
    submit: 'Sign in with email',
    busy: 'Signing in…',
    switchText: 'New here?',
    switchLink: 'Create an account',
    switchTo: '/register',
    passwordAutocomplete: 'current-password',
  },
  register: {
    title: 'Create an account',
    intro: 'One click with GitHub, or an email and a password.',
    submit: 'Create account with email',
    busy: 'Creating account…',
    switchText: 'Already have an account?',
    switchLink: 'Sign in',
    switchTo: '/login',
    passwordAutocomplete: 'new-password',
  },
};

export default function AuthPage({ mode }) {
  const text = copy[mode];
  const auth = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const githubError = githubErrors[searchParams.get('error')];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const res = await auth[mode](email, password);
    if (!res.success) {
      setError(res.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-page lg:grid-cols-2">
      <div className="flex flex-col">
      <header className="flex h-16 w-full items-center px-5 sm:px-10">
        <Link to="/" aria-label="RepoInsight home">
          <Wordmark />
        </Link>
      </header>

      <main className="flex flex-1 items-start justify-center px-5 pb-16 pt-8 sm:px-10 sm:pt-16 lg:justify-start">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-[2.1rem] font-bold leading-tight">{text.title}</h1>
          <p className="mt-2 text-ink-2">{text.intro}</p>

          {githubError && (
            <p role="alert" className="mt-6 rounded-lg border border-danger/25 bg-danger-soft px-3 py-2 text-sm text-danger">
              {githubError}
            </p>
          )}

          {/* A plain link: the server starts the OAuth redirect, so no JavaScript is involved. */}
          <a href="/api/auth/github" className="btn-dark mt-8 w-full py-2.5">
            <GithubMark className="h-[18px] w-[18px]" /> Continue with GitHub
          </a>

          <div className="my-7 flex items-center gap-3 text-xs text-ink-3" aria-hidden="true">
            <span className="h-px flex-1 bg-line" />
            or use email
            <span className="h-px flex-1 bg-line" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                className="field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={mode === 'register' ? 8 : undefined}
                maxLength={72}
                autoComplete={text.passwordAutocomplete}
                aria-describedby={mode === 'register' ? 'password-hint' : undefined}
                className="field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {mode === 'register' && (
                <p id="password-hint" className="mt-1.5 text-sm text-ink-3">
                  At least 8 characters.
                </p>
              )}
            </div>

            {error && (
              <p role="alert" className="rounded-lg border border-danger/25 bg-danger-soft px-3 py-2 text-sm text-danger">
                {error}
              </p>
            )}

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-2.5">
              {isLoading && <span className="spinner border-white/40 border-t-white" />}
              {isLoading ? text.busy : text.submit}
            </button>
          </form>

          <p className="mt-6 text-sm text-ink-2">
            {text.switchText}{' '}
            <Link to={text.switchTo} className="font-semibold text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent">
              {text.switchLink}
            </Link>
          </p>
        </div>
      </main>
      </div>

      <SidePanel />
    </div>
  );
}

const panelNodes = [
  { x: 6, w: 120, label: 'Client', layer: 'frontend' },
  { x: 164, w: 122, label: 'API', layer: 'api' },
  { x: 324, w: 90, label: 'Jobs', layer: 'jobs' },
];

// Wide screens only: a reminder of what's on the other side of the sign-in.
function SidePanel() {
  return (
    <aside className="gridpaper hidden flex-col justify-center gap-6 border-l-[1.5px] border-accent px-12 lg:flex" aria-hidden="true">
      <p className="max-w-md font-display text-[1.9rem] font-bold leading-tight">Paste a repo, get the drawing, ask anything.</p>
      <svg viewBox="0 0 420 150" className="w-full max-w-[420px]">
        <g fill="none" stroke="#3b4fa0" strokeWidth="1.5">
          <path d="M126 34 H158 M286 34 H318 M225 58 V90" />
          <path d="M152 29 l7 5 -7 5 M312 29 l7 5 -7 5 M220 84 l5 7 5 -7" />
        </g>
        {panelNodes.map((n) => (
          <g key={n.label} className={`tint-${n.layer}`}>
            <rect x={n.x} y="12" width={n.w} height="44" rx="8" strokeWidth="1.5" style={{ fill: 'var(--tint-fill)', stroke: 'var(--tint-line)' }} />
            <text x={n.x + n.w / 2} y="35" textAnchor="middle" dominantBaseline="middle" fontFamily="Barlow" fontSize="14" fontWeight="600" style={{ fill: 'var(--tint-ink)' }}>
              {n.label}
            </text>
          </g>
        ))}
        <g className="tint-data">
          <path d="M164 98 h122 v30 a61 9 0 0 1 -122 0 z" strokeWidth="1.5" style={{ fill: 'var(--tint-fill)', stroke: 'var(--tint-line)' }} />
          <ellipse cx="225" cy="98" rx="61" ry="9" strokeWidth="1.5" style={{ fill: 'var(--tint-fill)', stroke: 'var(--tint-line)' }} />
          <text x="225" y="120" textAnchor="middle" dominantBaseline="middle" fontFamily="Barlow" fontSize="14" fontWeight="600" style={{ fill: 'var(--tint-ink)' }}>
            Data
          </text>
        </g>
        <g fontFamily="Barlow Semi Condensed" fontWeight="700" fontSize="12" textAnchor="middle">
          <circle cx="142" cy="18" r="9" fill="#fffdf8" stroke="#c23b25" strokeWidth="1.8" />
          <text x="142" y="19" dominantBaseline="middle" fill="#c23b25">1</text>
          <circle cx="302" cy="18" r="9" fill="#fffdf8" stroke="#c23b25" strokeWidth="1.8" />
          <text x="302" y="19" dominantBaseline="middle" fill="#c23b25">2</text>
        </g>
      </svg>
      <p className="max-w-md text-[15px] leading-7 text-ink-2">
        Each answer cites the files it was written from, <span className="marker">marked</span>, so you can open them and check.
      </p>
    </aside>
  );
}
