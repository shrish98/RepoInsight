import { lazy, Suspense, useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Landing from './pages/Landing';

// The workspace pulls in markdown rendering and syntax highlighting; visitors to the landing page don't need it.
const Workspace = lazy(() => import('./pages/Workspace'));

export default function App() {
  const { token } = useContext(AuthContext);

  if (!token) return <Landing />;

  return (
    <Suspense fallback={<div className="h-dvh bg-page" />}>
      <Workspace />
    </Suspense>
  );
}
