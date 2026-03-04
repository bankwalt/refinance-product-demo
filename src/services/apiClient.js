const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export async function apiRequest(method, path, body = null) {
  const start = performance.now();
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const token = import.meta.env.VITE_API_TOKEN;
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${path}`, options);
  const duration = Math.round(performance.now() - start);

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  return {
    data,
    status: response.status,
    duration,
    method,
    path,
    requestBody: body,
    ok: response.ok,
  };
}
