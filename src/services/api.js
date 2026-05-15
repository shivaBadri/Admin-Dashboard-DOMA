const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export function getToken() {
  return localStorage.getItem('doma_admin_token');
}

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.message || data?.error || 'Request failed');
  return data;
}

export const api = {
  login: (payload) => request('/admin/login', { method: 'POST', body: JSON.stringify(payload) }),
  stats: () => request('/admin/stats'),
  projects: () => request('/projects'),
  createProject: (payload) => request('/projects', { method: 'POST', body: JSON.stringify(payload) }),
  updateProject: (id, payload) => request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),
  enquiries: () => request('/enquiries'),
  updateEnquiry: (id, payload) => request(`/enquiries/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteEnquiry: (id) => request(`/enquiries/${id}`, { method: 'DELETE' }),
  content: () => request('/content'),
  saveContent: (payload) => request('/content', { method: 'PUT', body: JSON.stringify(payload) }),
  health: () => request('/health')
};
