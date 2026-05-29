export interface Theme {
  id: string;
  name: string;
  colors: {
    background: string;
    text: string;
    textSecondary: string;
    textTertiary: string;
    cardBg: string;
    cardBorder: string;
    buttonBg: string;
    buttonHover: string;
    buttonText: string;
    accent: string;
  };
  typography: {
    fontFamily: string;
    headingWeight: string;
    bodyWeight: string;
  };
  effects: {
    cardRadius: string;
    cardBlur: string;
    cardShadow: string;
  };
  spacing: {
    cardPadding: string;
    sectionGap: string;
  };
}

export const themes: Record<string, Theme> = {
  apple: {
    id: 'apple',
    name: 'Apple',
    colors: {
      background: 'radial-gradient(120% 80% at 70% 0%, rgba(255, 255, 255, 0.18) 0%, transparent 55%), radial-gradient(90% 70% at 10% 100%, rgba(80, 110, 150, 0.55) 0%, transparent 60%), linear-gradient(170deg, #6f8aa8 0%, #5a7591 35%, #4a627c 65%, #3c5066 100%)',
      text: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.9)',
      textTertiary: 'rgba(255, 255, 255, 0.7)',
      cardBg: 'rgba(255, 255, 255, 0.08)',
      cardBorder: 'rgba(255, 255, 255, 0.15)',
      buttonBg: 'rgba(255, 255, 255, 0.08)',
      buttonHover: 'rgba(255, 255, 255, 0.14)',
      buttonText: 'rgba(255, 255, 255, 0.85)',
      accent: '#0ea5e9',
    },
    typography: {
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      headingWeight: '300',
      bodyWeight: '400',
    },
    effects: {
      cardRadius: '16px',
      cardBlur: '40px',
      cardShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    },
    spacing: {
      cardPadding: '20px',
      sectionGap: '12px',
    },
  },
};

export const defaultTheme = 'apple';
