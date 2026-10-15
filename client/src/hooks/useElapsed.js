import { useEffect, useState } from 'react';

// Seconds since `running` became true, formatted as m:ss. Indexing a large repo can take minutes,
// so showing honest elapsed time beats an indeterminate progress bar.
export function useElapsed(running) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!running) return undefined;
    setSeconds(0);
    const startedAt = Date.now();
    const id = setInterval(() => setSeconds(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => clearInterval(id);
  }, [running]);

  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
