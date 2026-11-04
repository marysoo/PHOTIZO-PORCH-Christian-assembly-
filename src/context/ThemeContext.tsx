import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ColorTheme {
  id: 'white-green-gold' | 'black-white' | 'purple-white';
  name: string;
  subtitle: string;
  biblicalMeaning: string;
  mode: 'light' | 'dark' | 'purple';
  bgPrimary: string;
  bgSecondary: string;
  bgCard: string;
  bgNav: string;
  primary: string;
  secondary: string;
  light: string;
  dark: string;
  goldFont: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  glow: string;
  glowSoft: string;
  swatchGradient: string;
  accentTextColor: string;
}

export const SACRED_THEMES: ColorTheme[] = [
  {
    id: 'white-green-gold',
    name: 'White & Green (Gold Fonts)',
    subtitle: 'Luminous White Background, Emerald Accents & Gold Fonts',
    biblicalMeaning: 'Living Water, Purity of White & Sovereign Gold Glory',
    mode: 'light',
    bgPrimary: '#FFFFFF',
    bgSecondary: '#F4FAF4',
    bgCard: '#FFFFFF',
    bgNav: 'rgba(255, 255, 255, 0.95)',
    primary: '#15803D',       // Lush emerald/forest green
    secondary: '#16A34A',     // Vibrant green
    light: '#86EFAC',         // Mint highlight
    dark: '#14532D',          // Deep forest green
    goldFont: '#B45309',      // Radiant Amber-Gold font for headers & titles
    textPrimary: '#1F2937',   // Dark readable charcoal for body
    textSecondary: '#15803D', // Green subtext
    textMuted: '#4B5563',     // Accessible gray
    border: '#E2E8F0',        // Subtle border
    glow: 'rgba(212, 175, 55, 0.45)',
    glowSoft: 'rgba(22, 163, 74, 0.15)',
    swatchGradient: 'linear-gradient(135deg, #FFFFFF 0%, #16A34A 50%, #D4AF37 100%)',
    accentTextColor: '#FFFFFF'
  },
  {
    id: 'black-white',
    name: 'Black & White',
    subtitle: 'Classic Onyx Black Background with Crisp White Typography',
    biblicalMeaning: 'Light Piercing the Darkness, Pure Holiness & Righteousness',
    mode: 'dark',
    bgPrimary: '#09090B',
    bgSecondary: '#121215',
    bgCard: '#18181B',
    bgNav: 'rgba(9, 9, 11, 0.95)',
    primary: '#FFFFFF',       // Pure white accent
    secondary: '#E4E4E7',     // Silver zinc
    light: '#FFFFFF',         // Bright white
    dark: '#27272A',          // Deep charcoal
    goldFont: '#FFFFFF',      // Fitting crisp white font
    textPrimary: '#FAFAFA',   // Pure white for headers & text
    textSecondary: '#E4E4E7', // Silver white
    textMuted: '#A1A1AA',     // Cool silver gray
    border: '#27272A',        // Dark graphite border
    glow: 'rgba(255, 255, 255, 0.35)',
    glowSoft: 'rgba(255, 255, 255, 0.12)',
    swatchGradient: 'linear-gradient(135deg, #000000 0%, #27272A 50%, #FFFFFF 100%)',
    accentTextColor: '#09090B'
  },
  {
    id: 'purple-white',
    name: 'Purple & White',
    subtitle: 'Regal Royal Purple with White Harmony & Suitable Typography',
    biblicalMeaning: 'Royal Priesthood, Apostolic Majesty & Pristine Radiance',
    mode: 'purple',
    bgPrimary: '#1E0A38',     // Deep imperial purple
    bgSecondary: '#290D4D',   // Rich violet purple
    bgCard: '#2E1055',        // Elevated royal card purple
    bgNav: 'rgba(30, 10, 56, 0.95)',
    primary: '#A855F7',       // Luminous purple
    secondary: '#C084FC',     // Light lavender
    light: '#FAF5FF',         // Pure white-lavender
    dark: '#4C1D95',          // Deep royal purple
    goldFont: '#FACC15',      // Royal gold accents
    textPrimary: '#FAF5FF',   // Crisp white/lavender
    textSecondary: '#E9D5FF', // Soft lilac
    textMuted: '#C4B5FD',     // Muted violet
    border: '#4C1D95',        // Royal purple border
    glow: 'rgba(168, 85, 247, 0.5)',
    glowSoft: 'rgba(168, 85, 247, 0.18)',
    swatchGradient: 'linear-gradient(135deg, #1E0A38 0%, #9333EA 50%, #FAF5FF 100%)',
    accentTextColor: '#FFFFFF'
  }
];

interface ThemeContextType {
  currentTheme: ColorTheme;
  setThemeById: (id: ColorTheme['id']) => void;
  themes: ColorTheme[];
  resetToDefault: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'photizo_ministry_three_color_theme';

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
    // Default to the first requested combination: White background and green with gold fonts
    return SACRED_THEMES[0];
  });

  const applyThemeToDOM = (theme: ColorTheme) => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme.id);
    root.setAttribute('data-theme-mode', theme.mode);

    // Dynamic CSS theme variables
    root.style.setProperty('--theme-id', theme.id);
    root.style.setProperty('--theme-primary', theme.primary);
    root.style.setProperty('--theme-secondary', theme.secondary);
    root.style.setProperty('--theme-light', theme.light);
    root.style.setProperty('--theme-dark', theme.dark);
    root.style.setProperty('--theme-glow', theme.glow);
    root.style.setProperty('--theme-glow-soft', theme.glowSoft);
    root.style.setProperty('--theme-text-contrast', theme.accentTextColor);

    // Theme Font & Background Tokens
    root.style.setProperty('--color-gold', theme.goldFont);
    root.style.setProperty('--color-gold-light', theme.light);
    root.style.setProperty('--color-gold-dark', theme.dark);
    root.style.setProperty('--color-gold-secondary', theme.secondary);

    root.style.setProperty('--theme-bg-primary', theme.bgPrimary);
    root.style.setProperty('--theme-bg-secondary', theme.bgSecondary);
    root.style.setProperty('--theme-bg-card', theme.bgCard);
    root.style.setProperty('--theme-bg-nav', theme.bgNav);
    root.style.setProperty('--theme-text-primary', theme.textPrimary);
    root.style.setProperty('--theme-text-secondary', theme.textSecondary);
    root.style.setProperty('--theme-text-muted', theme.textMuted);
    root.style.setProperty('--theme-border', theme.border);
  };

  useEffect(() => {
    applyThemeToDOM(currentTheme);
    try {
      localStorage.setItem(STORAGE_KEY, currentTheme.id);
    } catch {
      // ignore
    }
  }, [currentTheme]);

  const setThemeById = (id: ColorTheme['id']) => {
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
