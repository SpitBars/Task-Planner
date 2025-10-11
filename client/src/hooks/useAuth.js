import { useCallback, useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export function useAuth() {
  const [auth, setAuth] = useState({ authenticated: false });
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/status`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Unable to determine auth status');
      }
      const data = await response.json();
      setAuth(data);
    } catch (error) {
      console.error('Auth status error', error);
      setAuth({ authenticated: false });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return { auth, loading, refreshAuth: fetchStatus };
}
