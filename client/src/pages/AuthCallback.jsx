import { useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// GitHub sign-in lands here with the token in the URL fragment (#token=...).
export default function AuthCallback() {
  const { completeLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const handled = useRef(false);

  useEffect(() => {
    // StrictMode runs effects twice in development; the token can only be used once.
    if (handled.current) return;
    handled.current = true;

    const token = new URLSearchParams(window.location.hash.slice(1)).get('token');
    // Take the token out of the address bar and browser history straight away.
    window.history.replaceState(null, '', window.location.pathname);

    const failed = () => navigate('/login?error=github_failed', { replace: true });
    if (!token) return failed();
    completeLogin(token).then((ok) => ok || failed());
  }, [completeLogin, navigate]);

  return (
    <div className="flex h-dvh items-center justify-center gap-2.5 bg-page text-ink-2" role="status">
      <span className="spinner" />
      Signing you in…
    </div>
  );
}
