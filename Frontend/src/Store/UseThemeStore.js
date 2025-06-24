import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("chat-theme") || "coffee",

// todo Default theme is "coffee", can be changed to any other theme
  setTheme: (theme) => {
    localStorage.setItem("chat-theme", theme);
    set({ theme: theme });
  },
}));
