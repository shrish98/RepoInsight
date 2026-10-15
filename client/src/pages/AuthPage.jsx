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
    <div className="flex min-h-screen flex-col bg-page">
      <header className="mx-auto flex h-14 w-full max-w-6xl items-center px-5">
        <Link to="/" aria-label="RepoInsight home">
          <Wordmark />
        </Link>
      </header>

      <main className="flex flex-1 items-start justify-center px-5 pb-16 pt-10 sm:pt-20">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold tracking-tight">{text.title}</h1>
          <p className="mt-2 text-ink-2">{text.intro}</p>

          {githubError && (
            <p role="alert" className="mt-6 rounded-md border border-danger/20 bg-danger-soft px-3 py-2 text-sm text-danger">
              {githubError}
            </p>
          )}

          {/* A plain link: the server starts the OAuth redirect, so no JavaScript is involved. */}
          <a href="/api/auth/github" className="btn-primary mt-8 w-full py-2.5">
            <GithubMark /> Continue with GitHub
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
              <p role="alert" className="rounded-md border border-danger/20 bg-danger-soft px-3 py-2 text-sm text-danger">
                {error}
              </p>
            )}

            <button type="submit" disabled={isLoading} className="btn-secondary w-full py-2.5">
              {isLoading && <span className="spinner" />}
              {isLoading ? text.busy : text.submit}
            </button>
          </form>

          <p className="mt-6 text-sm text-ink-2">
            {text.switchText}{' '}
            <Link to={text.switchTo} className="font-medium text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
              {text.switchLink}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
