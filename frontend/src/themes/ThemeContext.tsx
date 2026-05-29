import { createContext, useContext, useEffect, useState } from 'react';
import { themes, defaultTheme, type Theme } from './themes';

interface ThemeContextValue {
  currentTheme: Theme;
  themeId: string;
  setTheme: (themeId: string) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_STORAGE_KEY = 'weather-app-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState<string>(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored && themes[stored] ? stored : defaultTheme;
  });

  const currentTheme = themes[themeId] || themes[defaultTheme];

  useEffect(() => {
    // Apply theme CSS variables to document root
    const root = document.documentElement;
    const theme = currentTheme;

    root.style.setProperty('--theme-bg', theme.colors.background);
    root.style.setProperty('--theme-text', theme.colors.text);
    root.style.setProperty('--theme-text-secondary', theme.colors.textSecondary);
    root.style.setProperty('--theme-text-tertiary', theme.colors.textTertiary);
    root.style.setProperty('--theme-card-bg', theme.colors.cardBg);
    root.style.setProperty('--theme-card-border', theme.colors.cardBorder);
    root.style.setProperty('--theme-button-bg', theme.colors.buttonBg);
    root.style.setProperty('--theme-button-hover', theme.colors.buttonHover);
    root.style.setProperty('--theme-button-text', theme.colors.buttonText);
    root.style.setProperty('--theme-accent', theme.colors.accent);
    root.style.setProperty('--theme-font-family', theme.typography.fontFamily);
    root.style.setProperty('--theme-heading-weight', theme.typography.headingWeight);
    root.style.setProperty('--theme-body-weight', theme.typography.bodyWeight);
    root.style.setProperty('--theme-card-radius', theme.effects.cardRadius);
    root.style.setProperty('--theme-card-blur', theme.effects.cardBlur);
    root.style.setProperty('--theme-card-shadow', theme.effects.cardShadow);
    root.style.setProperty('--theme-card-padding', theme.spacing.cardPadding);
    root.style.setProperty('--theme-section-gap', theme.spacing.sectionGap);
  }, [currentTheme]);

  const setTheme = (newThemeId: string) => {
    if (themes[newThemeId]) {
      setThemeId(newThemeId);
      localStorage.setItem(THEME_STORAGE_KEY, newThemeId);
    }
  };

  const value: ThemeContextValue = {
    currentTheme,
    themeId,
    setTheme,
    availableThemes: Object.values(themes),
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
