export const backendUrl = import.meta.env.VITE_DOMA_BACKEND_URL || '';

export async function apiRequest(path, options = {}) {
  if (!backendUrl) {
    throw new Error('VITE_DOMA_BACKEND_URL is not configured. Add the existing backend URL in Vercel env variables.');
  }

  const response = await fetch(`${backendUrl}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Backend request failed: ${response.status}`);
  }

  return response.json();
}
