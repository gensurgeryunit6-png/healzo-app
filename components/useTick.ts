import { useEffect, useState } from 'react';

/** Re-render periodically so running timers stay current. */
export function useTick(ms = 15000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}
