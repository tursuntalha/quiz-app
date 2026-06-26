import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

export const quizAPI = {
  start: (topic, mode = 'new') => api.post('/quiz/start', { topic, mode }),
  answer: (data) => api.post('/quiz/answer', data),
  complete: (sessionId) => api.post('/quiz/complete', { sessionId }),
  sessions: () => api.get('/quiz/sessions'),
};

export const questionAPI = {
  list: (topic) => api.get(`/questions?topic=${topic}`),
  topics: () => api.get('/questions/topics'),
  seed: () => api.post('/questions/seed'),
  generate: (topic, difficulty, count) => api.post('/questions/generate', { topic, difficulty, count }),
};

export const analyticsAPI = {
  profile: () => api.get('/analytics/profile'),
  sessions: (topic) => api.get(`/analytics/sessions${topic ? `?topic=${topic}` : ''}`),
  leaderboard: (topic) => api.get(`/analytics/leaderboard${topic ? `?topic=${topic}` : ''}`),
  retention: (topic) => api.get(`/analytics/retention/${topic}`),
};

export default api;
