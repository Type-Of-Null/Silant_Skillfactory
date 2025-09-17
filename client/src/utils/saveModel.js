// Функция для сохранения изменений в модели
export async function saveModel({ url, data, method = 'PUT', headers = {}, timeout = 10000 }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const resp = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(data ?? {}),
      signal: controller.signal,
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.detail || 'Ошибка сохранения');
    }
    return await resp.json();
  } catch (e) {
    if (e.name === 'AbortError') {
      throw new Error('Превышено время ожидания запроса');
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
