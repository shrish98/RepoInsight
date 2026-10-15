import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Wordmark from '../components/Wordmark';

const copy = {
  login: {
    title: 'Sign in',
    intro: 'Pick up where you left off.',
    submit: 'Sign in',
    busy: 'Signing in…',
    switchText: 'New here?',
    switchLink: 'Create an account',
    switchTo: '/register',
    passwordAutocomplete: 'current-password',
  },
  register: {
    title: 'Create an account',
    intro: 'An email and a password is all it takes.',
    submit: 'Create account',
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

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-2.5">
              {isLoading && <span className="spinner border-white/40 border-t-white" />}
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
