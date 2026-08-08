import { create } from 'zustand';
import { emailAPI } from '../api/api';

const STORAGE_KEY = 'wf_email_accounts';
const EMAIL_CACHE_KEY = 'wf_email_cache';

const loadFromStorage = (key) => {
  try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
};

const saveToStorage = (key, data) => {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
};

const useEmailStore = create((set, get) => ({
  accounts: loadFromStorage(STORAGE_KEY) || [],
  emails: [],
  selectedEmail: null,
  briefing: null,
  analytics: null,
  aiSuggestions: [],
  searchResults: [],
  isConnecting: false,
  isSyncing: false,
  error: null,

  // ---- Backend-synced account management ----
  fetchAccounts: async () => {
    try {
      const { data } = await emailAPI.listAccounts();
      const accounts = data.accounts || [];
      saveToStorage(STORAGE_KEY, accounts);
      set({ accounts });
      return accounts;
    } catch {
      const cached = loadFromStorage(STORAGE_KEY);
      if (cached) set({ accounts: cached });
      return get().accounts;
    }
  },

  connectAccount: async (provider, email, displayName, accessToken, refreshToken) => {
    set({ isConnecting: true, error: null });
    try {
      const { data } = await emailAPI.connect(provider, { provider, email, displayName, accessToken, refreshToken });
      const accounts = [...get().accounts.filter(a => a.email !== email), data.account];
      saveToStorage(STORAGE_KEY, accounts);
      set({ accounts, isConnecting: false });
      return data.account;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to connect account.';
      const fallback = {
        id: crypto.randomUUID(), provider, email,
        displayName: displayName || email,
        isConnected: true, settings: {},
        connectedAt: new Date().toISOString(), lastSynced: null,
      };
      const accounts = [...get().accounts, fallback];
      saveToStorage(STORAGE_KEY, accounts);
      set({ accounts, isConnecting: false, error: msg });
      return fallback;
    }
  },

  removeAccount: async (accountId) => {
    try { await emailAPI.disconnect(accountId); } catch {}
    const accounts = get().accounts.filter(a => a.id !== accountId && a._id !== accountId);
    saveToStorage(STORAGE_KEY, accounts);
    set({ accounts });
  },

  updateAccount: (accountId, updates) => {
    const accounts = get().accounts.map(a =>
      (a.id === accountId || a._id === accountId) ? { ...a, ...updates } : a
    );
    saveToStorage(STORAGE_KEY, accounts);
    set({ accounts });
  },

  setConnecting: (v) => set({ isConnecting: v }),

  // ---- Email data with backend sync ----
  fetchEmails: async (accountId = null) => {
    const targetAccount = accountId || get().accounts[0]?._id || get().accounts[0]?.id;
    if (!targetAccount) return [];

    set({ isSyncing: true, error: null });
    try {
      const { data } = await emailAPI.getEmails(targetAccount, { limit: 200 });
      const emails = data.emails || [];
      set({ emails, isSyncing: false });
      return emails;
    } catch (err) {
      const cached = loadFromStorage(EMAIL_CACHE_KEY);
      if (cached) set({ emails: cached });
      set({ isSyncing: false, error: err.response?.data?.message });
      return get().emails;
    }
  },

  syncEmails: async (accountId = null) => {
    const targetAccount = accountId || get().accounts[0]?._id || get().accounts[0]?.id;
    if (!targetAccount) return [];

    set({ isSyncing: true, error: null });
    try {
      const { data } = await emailAPI.sync(targetAccount);
      await get().fetchEmails(targetAccount);
      set({ isSyncing: false });
      return data;
    } catch (err) {
      set({ isSyncing: false, error: err.response?.data?.message });
      return null;
    }
  },

  setEmails: (emails) => {
    saveToStorage(EMAIL_CACHE_KEY, emails);
    set({ emails });
  },

  setSelectedEmail: (email) => set({ selectedEmail: email }),
  setSyncing: (v) => set({ isSyncing: v }),

  updateEmail: (id, updates) => set((s) => {
    const emails = s.emails.map(e => e.id === id || e._id === id ? { ...e, ...updates } : e);
    saveToStorage(EMAIL_CACHE_KEY, emails);
    return { emails };
  }),

  getEmailById: (id) => {
    return get().emails.find(e => e.id === id || e._id === id);
  },

  // ---- AI features ----
  setBriefing: (briefing) => set({ briefing }),
  setAnalytics: (analytics) => set({ analytics }),
  setAiSuggestions: (suggestions) => set({ aiSuggestions: suggestions }),
  setSearchResults: (results) => set({ searchResults: results }),
  setError: (error) => set({ error }),

  fetchBriefing: async (accountId = null) => {
    const targetAccount = accountId || get().accounts[0]?._id || get().accounts[0]?.id;
    if (!targetAccount) return null;
    try {
      const { data } = await emailAPI.getBriefing(targetAccount);
      set({ briefing: data.briefing });
      return data.briefing;
    } catch { return get().briefing; }
  },

  fetchAnalytics: async (accountId = null) => {
    const targetAccount = accountId || get().accounts[0]?._id || get().accounts[0]?.id;
    if (!targetAccount) return null;
    try {
      const { data } = await emailAPI.getAnalytics(targetAccount);
      set({ analytics: data.analytics });
      return data.analytics;
    } catch { return get().analytics; }
  },

  // ---- Smart filter helpers ----
  getFilteredEmails: (filter) => {
    const emails = get().emails;
    const today = new Date().toDateString();
    switch (filter) {
      case 'today':
        return emails.filter(e => new Date(e.receivedAt).toDateString() === today);
      case 'unread':
        return emails.filter(e => e.status === 'unread');
      case 'important':
        return emails.filter(e => e.priority === 'critical' || e.priority === 'high');
      case 'action-required':
        return emails.filter(e => ['follow-up', 'needs-approval', 'waiting'].includes(e.status));
      case 'waiting':
        return emails.filter(e => e.status === 'waiting');
      case 'replied':
        return emails.filter(e => e.status === 'replied');
      case 'completed':
        return emails.filter(e => e.status === 'completed');
      case 'newsletters':
        return emails.filter(e => e.aiCategory === 'newsletter');
      case 'high-priority':
        return emails.filter(e => e.priority === 'critical' || e.priority === 'high');
      default: return emails;
    }
  },
}));

export default useEmailStore;
