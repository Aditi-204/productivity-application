import { create } from 'zustand';

const useThemeStore = create((set) => ({
  isDark: localStorage.getItem('theme') === 'dark',
  isTechMode: localStorage.getItem('techMode') === 'true',

  setTheme: (value) => {
    const next = !!value;
    localStorage.setItem('theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', next);
    set({ isDark: next });
  },

  toggleTheme: () =>
    set((state) => {
      const nextDark = !state.isDark;
      localStorage.setItem('theme', nextDark ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', nextDark);
      return { isDark: nextDark };
    }),

  setTechMode: (value) => {
    const next = !!value;
    localStorage.setItem('techMode', String(next));
    document.documentElement.dataset.tech = next ? 'true' : 'false';
    set({ isTechMode: next });
  },

  toggleTechMode: () =>
    set((state) => {
      const next = !state.isTechMode;
      localStorage.setItem('techMode', String(next));
      document.documentElement.dataset.tech = next ? 'true' : 'false';
      return { isTechMode: next };
    }),

  initTheme: () => {
    const savedTheme = localStorage.getItem('theme') === 'dark';
    const savedTech = localStorage.getItem('techMode') === 'true';

    document.documentElement.classList.toggle('dark', savedTheme);
    document.documentElement.dataset.tech = savedTech ? 'true' : 'false';

    set({ isDark: savedTheme, isTechMode: savedTech });
  },
}));

export default useThemeStore;
