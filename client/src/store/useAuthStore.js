import { create } from 'zustand';
import { authAPI } from '../api/api';

const DEMO_USERS = [
  { email: 'employee@workflow.com', password: 'demo123', name: 'Alex Rivera', role: 'employee', department: 'Engineering' },
  { email: 'manager@workflow.com', password: 'demo123', name: 'Sarah Chen', role: 'manager', department: 'Engineering' },
  { email: 'admin@workflow.com', password: 'demo123', name: 'Jordan Lee', role: 'admin', department: 'Management' },
  { email: 'demo@workflow.com', password: 'demo123', name: 'Demo User', role: 'employee', department: 'Design' },
];

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('accessToken') || null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authAPI.login({ email, password });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, token: data.accessToken, isAuthenticated: true, isLoading: false, error: null });
      return data;
    } catch (err) {
      const serverMsg = err.response?.data?.message;
      if (serverMsg && !serverMsg.includes('Failed to fetch') && !serverMsg.includes('Network Error')) {
        set({ isLoading: false, error: serverMsg });
        throw new Error(serverMsg);
      }
      // Demo mode fallback
      const demoUser = DEMO_USERS.find(u => u.email === email && u.password === password);
      if (demoUser) {
        const token = 'demo_token_' + Date.now();
        const userData = { ...demoUser, id: 'demo_' + Date.now() };
        localStorage.setItem('accessToken', token);
        localStorage.setItem('user', JSON.stringify(userData));
        set({ user: userData, token, isAuthenticated: true, isLoading: false, error: null });
        return { user: userData, accessToken: token };
      }
      const msg = 'Backend unavailable. Use demo accounts:\nemployee@workflow.com / demo123\nmanager@workflow.com / demo123\nadmin@workflow.com / demo123';
      set({ isLoading: false, error: msg });
      throw new Error(msg);
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authAPI.register(userData);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, token: data.accessToken, isAuthenticated: true, isLoading: false, error: null });
      return data;
    } catch (err) {
      const serverMsg = err.response?.data?.message;
      if (serverMsg && !serverMsg.includes('Failed to fetch') && !serverMsg.includes('Network Error')) {
        set({ isLoading: false, error: serverMsg });
        throw new Error(serverMsg);
      }
      const token = 'demo_token_' + Date.now();
      const newUser = { name: userData.name, email: userData.email, role: userData.role || 'employee', department: userData.department || 'General', id: 'demo_' + Date.now() };
      localStorage.setItem('accessToken', token);
      localStorage.setItem('user', JSON.stringify(newUser));
      set({ user: newUser, token, isAuthenticated: true, isLoading: false, error: null });
      return { user: newUser, accessToken: token };
    }
  },

  logout: async () => {
    try { await authAPI.logout(); } catch {}
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false, isLoading: false, error: null });
  },

  loadUser: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { set({ isAuthenticated: false, user: null }); return; }
    set({ isLoading: true });
    try {
      const { data } = await authAPI.getMe();
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch {
      const stored = localStorage.getItem('user');
      if (stored) {
        set({ user: JSON.parse(stored), isAuthenticated: true, isLoading: false });
      } else {
        set({ isAuthenticated: false, user: null, token: null, isLoading: false });
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      }
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
