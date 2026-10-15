import { createContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

// The JWT only carries a user id, so the email is stored next to it for display.
const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => (localStorage.getItem('token') ? readStoredUser() : null));
  const navigate = useNavigate();

  const authenticate = async (path, email, password) => {
    try {
      const res = await fetch(`/api/auth/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Something went wrong.' };

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      navigate('/');
      return { success: true };
    } catch {
      return { success: false, error: 'Couldn’t reach the server. Check your connection and try again.' };
    }
  };

  const login = (email, password) => authenticate('login', email, password);
  const register = (email, password) => authenticate('register', email, password);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
