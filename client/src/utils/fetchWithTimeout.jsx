// Утилита для обработки запросов с таймаутом
export const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Превышено время ожидания ответа от сервера');
    }
    throw error;
  }
};

// Утилита для обработки разных методов
export const apiClient = {
  get: (url, timeout = 10000) => fetchWithTimeout(url, { method: 'GET' }, timeout),
  post: (url, data, timeout = 10000) => fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }, timeout),
  put: (url, data, timeout = 10000) => fetchWithTimeout(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }, timeout),
  delete: (url, timeout = 10000) => fetchWithTimeout(url, { method: 'DELETE' }, timeout),
};