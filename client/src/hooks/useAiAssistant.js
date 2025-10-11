import { useCallback, useMemo, useState } from 'react';
import { fetchDailySuggestions, fetchRecap, fetchSmartSchedule } from '../services/aiService.js';

export function useAiAssistant({ userId = 'demo-user' } = {}) {
  const [responses, setResponses] = useState({
    dailySuggestions: null,
    smartSchedule: null,
    recap: null,
  });
  const [loading, setLoading] = useState({});
  const [error, setError] = useState(null);

  const updateLoading = useCallback((key, value) => {
    setLoading((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleRequest = useCallback(
    async (key, requestFn, payload) => {
      setError(null);
      updateLoading(key, true);
      try {
        const result = await requestFn({ userId, ...payload });
        setResponses((prev) => ({ ...prev, [key]: result.message }));
      } catch (err) {
        console.error(err);
        setError(err.message || 'Something went wrong');
      } finally {
        updateLoading(key, false);
      }
    },
    [updateLoading, userId]
  );

  const actions = useMemo(
    () => ({
      getDailySuggestions: (payload) => handleRequest('dailySuggestions', fetchDailySuggestions, payload),
      getSmartSchedule: (payload) => handleRequest('smartSchedule', fetchSmartSchedule, payload),
      getRecap: (payload) => handleRequest('recap', fetchRecap, payload),
    }),
    [handleRequest]
  );

  return {
    responses,
    loading,
    error,
    ...actions,
  };
}
