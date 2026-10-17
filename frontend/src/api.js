const API_BASE_URL = 'https://stream-sphere-ott-4yl3.vercel.app/api';
function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('streamsphere_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {})
    }
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);
  const json = await response.json().catch(() => ({
    success: false,
    message: `Server returned ${response.status} ${response.statusText}`
  }));

  if (!response.ok) {
    throw new Error(json.message || `Request failed with status ${response.status}`);
  }

  return json;
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
  register: (data) => request('/auth/register', { method: 'POST', body: data }),
  getMe: () => request('/auth/me'),

  // Dashboard
  getStats: () => request('/dashboard/stats'),

  // Users
  getUsers: (params = '') => request(`/users${params}`),
  getUserById: (id) => request(`/users/${id}`),
  createUser: (data) => request('/users', { method: 'POST', body: data }),
  updateUser: (id, data) => request(`/users/${id}`, { method: 'PUT', body: data }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),

  // Genres
  getGenres: () => request('/genres'),
  createGenre: (data) => request('/genres', { method: 'POST', body: data }),
  updateGenre: (id, data) => request(`/genres/${id}`, { method: 'PUT', body: data }),
  deleteGenre: (id) => request(`/genres/${id}`, { method: 'DELETE' }),

  // Content
  getContent: (params = '') => request(`/content${params}`),
  getContentById: (id) => request(`/content/${id}`),
  createContent: (data) => request('/content', { method: 'POST', body: data }),
  updateContent: (id, data) => request(`/content/${id}`, { method: 'PUT', body: data }),
  deleteContent: (id) => request(`/content/${id}`, { method: 'DELETE' }),

  // Plans
  getPlans: () => request('/plans'),
  createPlan: (data) => request('/plans', { method: 'POST', body: data }),
  updatePlan: (id, data) => request(`/plans/${id}`, { method: 'PUT', body: data }),
  deletePlan: (id) => request(`/plans/${id}`, { method: 'DELETE' }),

  // Subscriptions (Calls Stored Procedure on POST)
  getSubscriptions: (params = '') => request(`/subscriptions${params}`),
  createSubscription: (data) => request('/subscriptions', { method: 'POST', body: data }),
  updateSubscription: (id, data) => request(`/subscriptions/${id}`, { method: 'PUT', body: data }),
  deleteSubscription: (id) => request(`/subscriptions/${id}`, { method: 'DELETE' }),

  // Watch History
  getWatchHistory: (params = '') => request(`/watch-history${params}`),
  createWatchHistory: (data) => request('/watch-history', { method: 'POST', body: data }),
  deleteWatchHistory: (id) => request(`/watch-history/${id}`, { method: 'DELETE' }),

  // Ratings
  getRatings: (params = '') => request(`/ratings${params}`),
  createRating: (data) => request('/ratings', { method: 'POST', body: data }),
  updateRating: (id, data) => request(`/ratings/${id}`, { method: 'PUT', body: data }),
  deleteRating: (id) => request(`/ratings/${id}`, { method: 'DELETE' }),

  // Reports & DBMS Lab Demonstrations
  getContentByGenre: () => request('/reports/content-by-genre'),
  getSubscribersByPlan: () => request('/reports/subscribers-by-plan'),
  getRevenueByPlan: () => request('/reports/revenue-by-plan'),
  getTopContent: () => request('/reports/top-content'),
  getAverageRatings: () => request('/reports/average-ratings'),
  getViewPerformance: () => request('/reports/view-performance'),
  getActiveSubscriptionsView: () => request('/reports/active-subscriptions-view'),
  demoTrigger: () => request('/reports/demo-trigger', { method: 'POST' })
};
