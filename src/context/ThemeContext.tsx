import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeType } from '../types/calculator';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  availableThemes: { id: ThemeType; label: string; previewColor: string; bgClass: string }[];
}

const THEMES: { id: ThemeType; label: string; previewColor: string; bgClass: string }[] = [
  { id: 'modern-dark', label: 'Modern Dark', previewColor: '#6366f1', bgClass: 'bg-slate-950' },
  { id: 'clean-light', label: 'Clean Light', previewColor: '#0ea5e9', bgClass: 'bg-slate-50' },
  { id: 'cyberpunk-neon', label: 'Cyberpunk Neon', previewColor: '#00f3ff', bgClass: 'bg-black' },
  { id: 'oled-black', label: 'Minimal OLED', previewColor: '#eab308', bgClass: 'bg-black' },
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('omni_calc_theme') as ThemeType;
    if (saved && THEMES.some((t) => t.id === saved)) {
      return saved;
    }
    return 'modern-dark';
  });

  useEffect(() => {
    localStorage.setItem('omni_calc_theme', theme);
    const root = document.documentElement;
    root.classList.remove('theme-modern-dark', 'theme-clean-light', 'theme-cyberpunk-neon', 'theme-oled-black', 'dark');

    root.classList.add(`theme-${theme}`);
    if (theme !== 'clean-light') {
      root.classList.add('dark');
    }
  }, [theme]);

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, availableThemes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

