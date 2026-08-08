import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        const newToken = data.accessToken;
        localStorage.setItem('accessToken', newToken);
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  getMe: () => api.get('/auth/me'),
};

export const todoAPI = {
  getAll: (date) => api.get('/todos', { params: { date } }),
  create: (data) => api.post('/todos', data),
  update: (id, data) => api.put(`/todos/${id}`, data),
  delete: (id) => api.delete(`/todos/${id}`),
  reorder: (todos) => api.post('/todos/reorder', { todos }),
};

export const attendanceAPI = {
  submitEOD: () => api.post('/attendance/eod'),
  getMyAttendance: (range) => api.get('/attendance/me', { params: { range } }),
  getTeamAttendance: (date) => api.get('/attendance/team', { params: { date } }),
};

export const reportAPI = {
  getReport: (type) => api.get(`/reports/${type}`),
};

export const emailAPI = {
  connect: (provider, authCode) => api.post('/email/connect', { provider, authCode }),
  disconnect: (accountId) => api.post(`/email/disconnect/${accountId}`),
  listAccounts: () => api.get('/email/accounts'),
  sync: (accountId) => api.post(`/email/sync/${accountId}`),
  getEmails: (accountId, params) => api.get(`/email/${accountId}/messages`, { params }),
  getEmail: (accountId, emailId) => api.get(`/email/${accountId}/messages/${emailId}`),
  send: (accountId, data) => api.post(`/email/${accountId}/send`, data),
  reply: (accountId, emailId, data) => api.post(`/email/${accountId}/reply/${emailId}`, data),
  aiAnalyze: (accountId, emailId) => api.post(`/email/ai/analyze/${accountId}/${emailId}`),
  aiSummarize: (accountId, emailIds) => api.post(`/email/ai/summarize/${accountId}`, { emailIds }),
  aiSuggestReply: (accountId, emailId, tone) => api.post(`/email/ai/suggest-reply/${accountId}/${emailId}`, { tone }),
  aiGenerateTasks: (accountId, emailId) => api.post(`/email/ai/extract-tasks/${accountId}/${emailId}`),
  getBriefing: (accountId) => api.get(`/email/ai/briefing/${accountId}`),
  getAnalytics: (accountId) => api.get(`/email/analytics/${accountId}`),
};

export default api;
