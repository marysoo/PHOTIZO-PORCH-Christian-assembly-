import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ColorTheme {
  id: string;
  name: string;
  biblicalMeaning: string;
  primary: string;
  secondary: string;
  light: string;
  dark: string;
  glow: string;
  glowSoft: string;
  swatchGradient: string;
  accentTextColor: string;
}

export const SACRED_THEMES: ColorTheme[] = [
  {
    id: 'gold',
    name: 'Sanctuary Gold',
    biblicalMeaning: 'Divine Glory & Ark of Covenant',
    primary: '#D4AF37',
    secondary: '#F59E0B',
    light: '#FEF08A',
    dark: '#854D0E',
    glow: 'rgba(212, 175, 55, 0.45)',
    glowSoft: 'rgba(212, 175, 55, 0.15)',
    swatchGradient: 'linear-gradient(135deg, #F59E0B 0%, #D4AF37 50%, #FEF08A 100%)',
    accentTextColor: '#09090b'
  },
  {
    id: 'sapphire',
    name: 'Celestial Sapphire',
    biblicalMeaning: 'Throne Room & Living Water',
    primary: '#2563EB',
    secondary: '#0EA5E9',
    light: '#7DD3FC',
    dark: '#1E3A8A',
    glow: 'rgba(37, 99, 235, 0.45)',
    glowSoft: 'rgba(37, 99, 235, 0.15)',
    swatchGradient: 'linear-gradient(135deg, #1D4ED8 0%, #0EA5E9 50%, #7DD3FC 100%)',
    accentTextColor: '#FFFFFF'
  },
  {
    id: 'crimson',
    name: 'Apostolic Crimson',
    biblicalMeaning: 'Holy Fire & Covenant Blood',
    primary: '#E11D48',
    secondary: '#DC2626',
    light: '#FDA4AF',
    dark: '#881337',
    glow: 'rgba(225, 29, 72, 0.45)',
    glowSoft: 'rgba(225, 29, 72, 0.15)',
    swatchGradient: 'linear-gradient(135deg, #DC2626 0%, #E11D48 50%, #FDA4AF 100%)',
    accentTextColor: '#FFFFFF'
  },
  {
    id: 'emerald',
    name: 'Emerald Revival',
    biblicalMeaning: 'Living Hope & Supernatural Abundance',
    primary: '#059669',
    secondary: '#10B981',
    light: '#6EE7B7',
    dark: '#064E3B',
    glow: 'rgba(5, 150, 105, 0.45)',
    glowSoft: 'rgba(5, 150, 105, 0.15)',
    swatchGradient: 'linear-gradient(135deg, #047857 0%, #10B981 50%, #6EE7B7 100%)',
    accentTextColor: '#FFFFFF'
  },
  {
    id: 'amethyst',
    name: 'Amethyst Majesty',
    biblicalMeaning: 'Royal Priesthood & Prophetic Revelation',
    primary: '#7C3AED',
    secondary: '#9333EA',
    light: '#C084FC',
    dark: '#4C1D95',
    glow: 'rgba(124, 58, 237, 0.45)',
    glowSoft: 'rgba(124, 58, 237, 0.15)',
    swatchGradient: 'linear-gradient(135deg, #6D28D9 0%, #9333EA 50%, #C084FC 100%)',
    accentTextColor: '#FFFFFF'
  },
  {
    id: 'copper',
    name: 'Solomon\'s Copper',
    biblicalMeaning: 'Bronze Altar & Refined Fire',
    primary: '#EA580C',
    secondary: '#D97706',
    light: '#FDBA74',
    dark: '#7C2D12',
    glow: 'rgba(234, 88, 12, 0.45)',
    glowSoft: 'rgba(234, 88, 12, 0.15)',
    swatchGradient: 'linear-gradient(135deg, #C2410C 0%, #EA580C 50%, #FDBA74 100%)',
    accentTextColor: '#FFFFFF'
  },
  {
    id: 'platinum',
    name: 'Luminous Platinum',
    biblicalMeaning: 'Robes of Righteousness & Pure Light',
    primary: '#E2E8F0',
    secondary: '#94A3B8',
    light: '#FFFFFF',
    dark: '#334155',
    glow: 'rgba(255, 255, 255, 0.5)',
    glowSoft: 'rgba(255, 255, 255, 0.15)',
    swatchGradient: 'linear-gradient(135deg, #64748B 0%, #CBD5E1 50%, #FFFFFF 100%)',
    accentTextColor: '#09090b'
  }
];

interface ThemeContextType {
  currentTheme: ColorTheme;
  setThemeById: (id: string) => void;
  themes: ColorTheme[];
  resetToDefault: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'photizo_ministry_color_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ColorTheme>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const found = SACRED_THEMES.find(t => t.id === saved);
        if (found) return found;
      }
    } catch {
      // ignore
    }
    return SACRED_THEMES[0]; // Sanctuary Gold by default
  });

  const applyThemeToDOM = (theme: ColorTheme) => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme.id);
    root.style.setProperty('--theme-primary', theme.primary);
    root.style.setProperty('--theme-secondary', theme.secondary);
    root.style.setProperty('--theme-light', theme.light);
    root.style.setProperty('--theme-dark', theme.dark);
    root.style.setProperty('--theme-glow', theme.glow);
    root.style.setProperty('--theme-glow-soft', theme.glowSoft);
    root.style.setProperty('--theme-text-contrast', theme.accentTextColor);

    // Also update --color-gold and amber shades so all Tailwind utilities dynamically respond
    root.style.setProperty('--color-gold', theme.primary);
    root.style.setProperty('--color-gold-light', theme.light);
    root.style.setProperty('--color-gold-dark', theme.dark);
    root.style.setProperty('--color-gold-secondary', theme.secondary);
  };

  useEffect(() => {
    applyThemeToDOM(currentTheme);
    try {
      localStorage.setItem(STORAGE_KEY, currentTheme.id);
    } catch {
      // ignore
    }
  }, [currentTheme]);

  const setThemeById = (id: string) => {
    const theme = SACRED_THEMES.find(t => t.id === id);
    if (theme) {
      setCurrentTheme(theme);
    }
  };

  const resetToDefault = () => {
    setCurrentTheme(SACRED_THEMES[0]);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setThemeById, themes: SACRED_THEMES, resetToDefault }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
