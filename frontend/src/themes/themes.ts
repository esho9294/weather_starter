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
      background:
        'radial-gradient(120% 80% at 70% 0%, rgba(255, 255, 255, 0.18) 0%, transparent 55%), radial-gradient(90% 70% at 10% 100%, rgba(80, 110, 150, 0.55) 0%, transparent 60%), linear-gradient(170deg, #6f8aa8 0%, #5a7591 35%, #4a627c 65%, #3c5066 100%)',
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
  arcticFrost: {
    id: 'arcticFrost',
    name: 'Arctic Frost',
    colors: {
      background:
        'radial-gradient(circle at 20% 50%, rgba(224, 242, 254, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(186, 230, 253, 0.3) 0%, transparent 50%), linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)',
      text: '#000000',
      textSecondary: '#1e293b',
      textTertiary: '#475569',
      cardBg: 'rgba(255, 255, 255, 0.7)',
      cardBorder: 'rgba(6, 182, 212, 0.2)',
      buttonBg: 'rgba(255, 255, 255, 0.8)',
      buttonHover: 'rgba(224, 242, 254, 0.9)',
      buttonText: '#000000',
      accent: '#06b6d4',
    },
    typography: {
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      headingWeight: '300',
      bodyWeight: '400',
    },
    effects: {
      cardRadius: '20px',
      cardBlur: '60px',
      cardShadow: '0 4px 24px rgba(6, 182, 212, 0.08), 0 0 0 1px rgba(6, 182, 212, 0.1)',
    },
    spacing: {
      cardPadding: '28px',
      sectionGap: '16px',
    },
  },
  sunsetGradient: {
    id: 'sunsetGradient',
    name: 'Sunset Gradient',
    colors: {
      background:
        'radial-gradient(circle at 30% 20%, rgba(251, 146, 60, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(236, 72, 153, 0.25) 0%, transparent 50%), linear-gradient(135deg, #fb923c 0%, #f97316 25%, #ec4899 60%, #a855f7 100%)',
      text: '#fef3c7',
      textSecondary: '#fde68a',
      textTertiary: '#fcd34d',
      cardBg: 'rgba(255, 255, 255, 0.12)',
      cardBorder: 'rgba(251, 146, 60, 0.3)',
      buttonBg: 'rgba(255, 255, 255, 0.15)',
      buttonHover: 'rgba(255, 255, 255, 0.25)',
      buttonText: '#fef3c7',
      accent: '#fbbf24',
    },
    typography: {
      fontFamily: 'Outfit, Poppins, system-ui, sans-serif',
      headingWeight: '500',
      bodyWeight: '400',
    },
    effects: {
      cardRadius: '12px',
      cardBlur: '40px',
      cardShadow: '0 8px 32px rgba(236, 72, 153, 0.2), 0 0 0 1px rgba(251, 146, 60, 0.2)',
    },
    spacing: {
      cardPadding: '20px',
      sectionGap: '12px',
    },
  },
  darkStorm: {
    id: 'darkStorm',
    name: 'Dark Storm',
    colors: {
      background:
        'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 100%, rgba(251, 191, 36, 0.1) 0%, transparent 50%), linear-gradient(180deg, #000000 0%, #18181b 50%, #27272a 100%)',
      text: '#ffffff',
      textSecondary: '#e4e4e7',
      textTertiary: '#a1a1aa',
      cardBg: 'rgba(255, 255, 255, 0.05)',
      cardBorder: 'rgba(59, 130, 246, 0.3)',
      buttonBg: 'rgba(59, 130, 246, 0.15)',
      buttonHover: 'rgba(59, 130, 246, 0.25)',
      buttonText: '#ffffff',
      accent: '#3b82f6',
    },
    typography: {
      fontFamily: 'Space Grotesk, DM Sans, system-ui, sans-serif',
      headingWeight: '700',
      bodyWeight: '400',
    },
    effects: {
      cardRadius: '8px',
      cardBlur: '20px',
      cardShadow: '0 4px 20px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(59, 130, 246, 0.2)',
    },
    spacing: {
      cardPadding: '16px',
      sectionGap: '12px',
    },
  },
  botanicalGarden: {
    id: 'botanicalGarden',
    name: 'Botanical Garden',
    colors: {
      background:
        'radial-gradient(circle at 20% 30%, rgba(132, 204, 22, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(234, 88, 12, 0.1) 0%, transparent 50%), linear-gradient(160deg, #84cc16 0%, #65a30d 35%, #166534 70%, #14532d 100%)',
      text: '#fef3c7',
      textSecondary: '#fef08a',
      textTertiary: '#d9f99d',
      cardBg: 'rgba(254, 252, 232, 0.12)',
      cardBorder: 'rgba(132, 204, 22, 0.25)',
      buttonBg: 'rgba(254, 252, 232, 0.15)',
      buttonHover: 'rgba(254, 252, 232, 0.25)',
      buttonText: '#fef3c7',
      accent: '#84cc16',
    },
    typography: {
      fontFamily: 'Lora, Merriweather, Georgia, serif',
      headingWeight: '600',
      bodyWeight: '400',
    },
    effects: {
      cardRadius: '16px',
      cardBlur: '30px',
      cardShadow: '0 6px 24px rgba(22, 101, 52, 0.3), 0 0 0 1px rgba(132, 204, 22, 0.15)',
    },
    spacing: {
      cardPadding: '20px',
      sectionGap: '16px',
    },
  },
  neonCyberpunk: {
    id: 'neonCyberpunk',
    name: 'Neon Cyberpunk',
    colors: {
      background:
        'radial-gradient(circle at 30% 20%, rgba(34, 211, 238, 0.2) 0%, transparent 40%), radial-gradient(circle at 70% 80%, rgba(244, 114, 182, 0.2) 0%, transparent 40%), linear-gradient(180deg, #1e1b4b 0%, #1e1b4b 50%, #0f172a 100%)',
      text: '#22d3ee',
      textSecondary: '#a5f3fc',
      textTertiary: '#67e8f9',
      cardBg: 'rgba(30, 27, 75, 0.6)',
      cardBorder: 'rgba(34, 211, 238, 0.5)',
      buttonBg: 'rgba(34, 211, 238, 0.15)',
      buttonHover: 'rgba(34, 211, 238, 0.3)',
      buttonText: '#22d3ee',
      accent: '#f472b6',
    },
    typography: {
      fontFamily: 'Rajdhani, Orbitron, monospace',
      headingWeight: '700',
      bodyWeight: '500',
    },
    effects: {
      cardRadius: '2px',
      cardBlur: '10px',
      cardShadow:
        '0 0 20px rgba(34, 211, 238, 0.4), 0 0 40px rgba(244, 114, 182, 0.2), 0 0 0 1px rgba(34, 211, 238, 0.6)',
    },
    spacing: {
      cardPadding: '12px',
      sectionGap: '8px',
    },
  },
  retroTerminal: {
    id: 'retroTerminal',
    name: 'Retro Terminal',
    colors: {
      background: 'linear-gradient(180deg, #000000 0%, #0a0a0a 100%)',
      text: '#22c55e',
      textSecondary: '#4ade80',
      textTertiary: '#86efac',
      cardBg: 'rgba(34, 197, 94, 0.05)',
      cardBorder: 'rgba(34, 197, 94, 0.4)',
      buttonBg: 'rgba(34, 197, 94, 0.1)',
      buttonHover: 'rgba(34, 197, 94, 0.2)',
      buttonText: '#22c55e',
      accent: '#fbbf24',
    },
    typography: {
      fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
      headingWeight: '700',
      bodyWeight: '400',
    },
    effects: {
      cardRadius: '0px',
      cardBlur: '0px',
      cardShadow: '0 0 0 2px rgba(34, 197, 94, 0.3)',
    },
    spacing: {
      cardPadding: '12px',
      sectionGap: '8px',
    },
  },
  minimalistPaper: {
    id: 'minimalistPaper',
    name: 'Minimalist Paper',
    colors: {
      background:
        'radial-gradient(circle at 50% 50%, rgba(250, 250, 249, 1) 0%, rgba(245, 245, 244, 1) 100%)',
      text: '#292524',
      textSecondary: '#44403c',
      textTertiary: '#78716c',
      cardBg: 'rgba(255, 255, 255, 0.8)',
      cardBorder: 'rgba(120, 113, 108, 0.15)',
      buttonBg: 'rgba(255, 255, 255, 0.9)',
      buttonHover: 'rgba(250, 250, 249, 1)',
      buttonText: '#292524',
      accent: '#0ea5e9',
    },
    typography: {
      fontFamily: 'IBM Plex Sans, Source Sans Pro, system-ui, sans-serif',
      headingWeight: '400',
      bodyWeight: '400',
    },
    effects: {
      cardRadius: '6px',
      cardBlur: '10px',
      cardShadow: '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
    },
    spacing: {
      cardPadding: '28px',
      sectionGap: '16px',
    },
  },
};

export const defaultTheme = 'apple';
