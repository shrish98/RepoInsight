import { createContext, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

// Cached copy of the profile so the sidebar can render before /api/auth/me answers.
const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
};

const fetchCurrentUser = async (token) => {
  const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
  if (res.status === 401) return { unauthorized: true };
  if (!res.ok) return {};
  const { user } = await res.json();
  return { user };
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => (localStorage.getItem('token') ? readStoredUser() : null));
  const navigate = useNavigate();

  const saveSession = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const clearSession = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  // Refresh the profile on load: picks up GitHub name or avatar changes, and drops a token
  // the server no longer accepts (expired, or the secret was rotated).
  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;
    fetchCurrentUser(token)
      .then(({ user: fresh, unauthorized }) => {
        if (cancelled) return;
        if (unauthorized) clearSession();
        else if (fresh) {
          localStorage.setItem('user', JSON.stringify(fresh));
          setUser(fresh);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [token, clearSession]);

  const authenticate = async (path, email, password) => {
    try {
      const res = await fetch(`/api/auth/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Something went wrong.' };

      saveSession(data.token, data.user);
      navigate('/');
      return { success: true };
    } catch {
      return { success: false, error: 'Couldn’t reach the server. Check your connection and try again.' };
    }
  };

  const login = (email, password) => authenticate('login', email, password);
  const register = (email, password) => authenticate('register', email, password);

  // Used by the GitHub OAuth callback, which hands over a token without a user object.
  const completeLogin = async (newToken) => {
    try {
      const { user: fresh } = await fetchCurrentUser(newToken);
      if (!fresh) return false;
      saveSession(newToken, fresh);
      navigate('/', { replace: true });
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    clearSession();
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, completeLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
