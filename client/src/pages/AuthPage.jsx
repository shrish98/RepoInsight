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
    <div className="grid min-h-screen bg-white lg:grid-cols-[1fr_1.05fr]">
      <div className="flex flex-col">
      <header className="flex h-16 w-full items-center px-5 sm:px-10">
        <Link to="/" aria-label="RepoInsight home">
          <Wordmark />
        </Link>
      </header>

      <main className="flex flex-1 items-start justify-center px-5 pb-16 pt-8 sm:px-10 sm:pt-16 lg:justify-start">
        <div className="w-full max-w-sm">
          <h1 className="rise text-[2rem] font-[760] leading-tight tracking-[-0.025em]" style={{ fontStretch: '108%' }}>
            {text.title}
          </h1>
          <p className="mt-2 text-ink-2">{text.intro}</p>

          {githubError && (
            <p role="alert" className="mt-6 rounded-lg border border-danger/25 bg-danger-soft px-3 py-2 text-sm text-danger">
              {githubError}
            </p>
          )}

          {/* A plain link: the server starts the OAuth redirect, so no JavaScript is involved. */}
          <a href="/api/auth/github" className="btn-primary mt-8 h-11 w-full bg-ink shadow-none hover:bg-[#32383f]">
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

            <button type="submit" disabled={isLoading} className="btn-secondary h-11 w-full">
              {isLoading && <span className="spinner" />}
              {isLoading ? text.busy : text.submit}
            </button>
          </form>

          <p className="mt-6 text-sm text-ink-2">
            {text.switchText}{' '}
            <Link to={text.switchTo} className="font-semibold text-link hover:underline">
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

// Wide screens only: the same dark hero as the landing page, with a glimpse of an answer.
function SidePanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-night lg:block" aria-hidden="true">
      <div className="gradient-band absolute inset-0 opacity-90" style={{ clipPath: 'polygon(58% 0, 100% 0, 100% 100%, 30% 100%)' }} />
      <div className="relative flex h-full flex-col justify-center gap-8 px-14">
        <p className="max-w-md text-[2rem] font-[760] leading-[1.1] tracking-[-0.03em] text-white" style={{ fontStretch: '110%' }}>
          Answers with the exact files and lines they came from.
        </p>
        <div className="pop max-w-md rounded-xl bg-white p-4 text-sm text-ink shadow-[0_40px_80px_-30px_rgb(3_10_30/0.7)]" style={{ '--d': '0.2s' }}>
          <p className="flex items-center gap-2.5 font-semibold">
            <span className="h-5 w-5 shrink-0 rounded-full bg-[conic-gradient(#5b4cf5_0_30%,#22c7e8_0_60%,#ff6a55_0)]" />
            Which model answers questions?
          </p>
          <p className="mt-2.5 leading-6 text-[#2f363d]">
            <code className="rounded bg-[rgb(175_184_193/0.2)] px-1 font-mono text-[12px]">openai/gpt-oss-120b</code> on Groq,
            unless <code className="rounded bg-[rgb(175_184_193/0.2)] px-1 font-mono text-[12px]">GROQ_MODEL</code> is set.
          </p>
          <p className="mt-2.5">
            <span className="file-pill">server/config/llm.js#L5</span>
          </p>
        </div>
      </div>
    </aside>
  );
}
