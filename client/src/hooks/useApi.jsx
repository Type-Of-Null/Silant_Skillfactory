import { useState, useCallback } from 'react';
import { apiClient } from '../utils/fetchWithTimeout';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callApi = useCallback(async (apiCall, ...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall(...args);
      setLoading(false);
      return { success: true, data: result };
    } catch (error) {
      setError(error.message);
      setLoading(false);
      return { success: false, message: error.message };
    }
  }, []);

  // Методы для разных HTTP методов
  const get = useCallback((url, timeout) => callApi(apiClient.get, url, timeout), [callApi]);
  const post = useCallback((url, data, timeout) => callApi(apiClient.post, url, data, timeout), [callApi]);
  const put = useCallback((url, data, timeout) => callApi(apiClient.put, url, data, timeout), [callApi]);
  const del = useCallback((url, timeout) => callApi(apiClient.delete, url, timeout), [callApi]);

  return {
    loading,
    error,
    get,
    post,
    put,
    delete: del,
    callApi, // Универсальный метод
    clearError: () => setError(null),
  };
};