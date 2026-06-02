# Theme System

## Overview
Weather Starter features a comprehensive theme system with **8 distinct themes**, each offering a unique visual experience. The theme selector appears in the top right corner of the app, allowing instant theme switching with localStorage persistence.

## Available Themes

### 1. 🍎 Apple (Default)
**Type:** Dark Mode | **Mood:** Cool, Professional

**Description:** The original design featuring a sophisticated dark blue gradient with subtle radial overlays. Clean, professional aesthetic inspired by Apple's design language.

**Color Palette:**
- Background: Dark blue gradient (#6f8aa8 → #5a7591 → #4a627c → #3c5066)
- Text: White with varying opacity levels
- Accent: Sky blue (#0ea5e9)

**Typography:** System UI fonts, light weight (300)

**Design Considerations:**
- Medium contrast for comfortable evening viewing
- Balanced spacing (20px padding, 12px gaps)
- Moderate blur (40px) for depth
- Professional, versatile for all contexts

**Best For:** Evening use, professional settings, general purpose

---

### 2. ❄️ Arctic Frost
**Type:** Light Mode | **Mood:** Clean, Minimal

**Description:** Nordic winter-inspired theme with cool whites and ice blues. Features generous whitespace and enhanced frosted glass effects for a serene, airy feel.

**Color Palette:**
- Background: Light ice blue gradient (#f0f9ff → #e0f2fe → #bae6fd)
- Text: Deep navy (#1e3a5f) to slate gray
- Accent: Bright cyan (#06b6d4)

**Typography:** Inter, light weight (300)

**Design Considerations:**
- High contrast for excellent readability
- Most spacious theme (28px padding, 16px gaps)
- Enhanced blur (60px) for premium frosted glass
- Rounded corners (20px) for soft, approachable feel

**Best For:** Daytime use, bright environments, data-heavy interfaces, professional/corporate settings

---

### 3. 🌅 Sunset Gradient
**Type:** Colorful | **Mood:** Warm, Vibrant

**Description:** Golden hour-inspired theme with vibrant gradient transitions from orange through pink to purple. Energetic and visually striking.

**Color Palette:**
- Background: Sunset gradient (#fb923c → #f97316 → #ec4899 → #a855f7)
- Text: Cream (#fef3c7) with golden highlights
- Accent: Golden yellow (#fbbf24)

**Typography:** Outfit, Poppins, medium weight (500)

**Design Considerations:**
- Warm color psychology (energy, creativity, comfort)
- Medium contrast with cream text on gradient
- Balanced spacing and blur (40px)
- Rounded letterforms for friendly feel

**Best For:** Evening/sunset use, creative applications, vibrant interfaces, entertainment apps

---

### 4. ⚡ Dark Storm
**Type:** Dark Mode | **Mood:** Bold, Dramatic

**Description:** High-contrast dark mode with electric blue accents. Sharp edges and strong shadows create a powerful, modern aesthetic.

**Color Palette:**
- Background: Pure black to zinc gradient (#000000 → #18181b → #27272a)
- Text: Pure white (#ffffff) for maximum contrast
- Accent: Electric blue (#3b82f6)

**Typography:** Space Grotesk, DM Sans, bold weight (700)

**Design Considerations:**
- Highest contrast (21:1 ratio) for accessibility
- Sharpest theme (8px radius, 20px blur)
- Most compact spacing (16px padding)
- Bold typography for strong hierarchy
- OLED-friendly (pure black saves battery)

**Best For:** Night use, storm displays, power users, dark mode enthusiasts, OLED screens

---

### 5. 🌿 Botanical Garden
**Type:** Nature | **Mood:** Earthy, Organic

**Description:** Nature-inspired theme with sage green gradients and organic shapes. Serif typography adds an editorial, natural feel.

**Color Palette:**
- Background: Green gradient (#84cc16 → #65a30d → #166534 → #14532d)
- Text: Cream (#fef3c7) with yellow highlights
- Accent: Lime green (#84cc16)

**Typography:** Lora, Merriweather (serif), semi-bold (600)

**Design Considerations:**
- Earthy color psychology (nature, growth, harmony)
- Organic shapes with 16px radius
- Soft blur (30px) for natural depth
- Serif fonts for organic, editorial feel
- Forest green shadows for depth

**Best For:** Outdoor enthusiasts, eco-conscious users, garden/agriculture apps, wellness contexts

---

### 6. 🌃 Neon Cyberpunk
**Type:** Futuristic | **Mood:** Tech, Electric

**Description:** Futuristic theme with glowing neon accents on dark purple backgrounds. Sharp edges and multi-layer glow effects create a cyberpunk aesthetic.

**Color Palette:**
- Background: Deep purple to navy (#1e1b4b → #0f172a)
- Text: Neon cyan (#22d3ee) with bright highlights
- Accent: Hot pink (#f472b6)

**Typography:** Rajdhani, Orbitron (futuristic), bold (700)

**Design Considerations:**
- Sharpest corners (2px radius) for tech feel
- Minimal blur (10px) for crisp appearance
- Multi-layer neon glow shadows (cyan + pink)
- Most compact spacing (12px padding, 8px gaps)
- Geometric, uppercase-style fonts

**Best For:** Gaming interfaces, tech/sci-fi apps, night city contexts, futuristic dashboards, cyberpunk aesthetic

---

### 7. 💻 Retro Terminal
**Type:** Retro | **Mood:** Nostalgic, Tech

**Description:** Command-line aesthetic with terminal green on pure black. Monospace fonts and zero blur create an authentic retro computing experience.

**Color Palette:**
- Background: Pure black (#000000) to near-black (#0a0a0a)
- Text: Terminal green (#22c55e) with bright variants
- Accent: Amber (#fbbf24) for warnings

**Typography:** JetBrains Mono, Fira Code (monospace), bold (700)

**Design Considerations:**
- Zero blur and radius for authentic terminal look
- ASCII-style borders (2px green outline)
- Compact spacing (12px padding)
- Monospace fonts for code-like appearance
- Maximum nostalgia factor

**Best For:** Developers, system administrators, retro computing enthusiasts, CLI tools, technical documentation

---

### 8. 📄 Minimalist Paper
**Type:** Light Mode | **Mood:** Clean, Elegant

**Description:** Ultra-clean design mimicking paper textures with subtle shadows. Typography-focused with generous whitespace for editorial feel.

**Color Palette:**
- Background: Off-white to warm gray (#fafaf9 → #f5f5f4)
- Text: Charcoal (#292524) with warm grays
- Accent: Sky blue (#0ea5e9)

**Typography:** IBM Plex Sans, Source Sans Pro, regular (400)

**Design Considerations:**
- Paper-like aesthetic with subtle shadows
- Most spacious with Arctic Frost (28px padding)
- Minimal effects (6px radius, 10px blur)
- Editorial typography (regular weight throughout)
- High contrast for readability

**Best For:** Reading/content apps, writing/note-taking, documentation, minimalist design lovers, focus/productivity

---

## Theme Comparison Matrix

| Theme | Type | Contrast | Density | Radius | Blur | Font Style | Best Time |
|-------|------|----------|---------|--------|------|------------|-----------|
| Apple | Dark | Medium | Balanced | 16px | 40px | Sans (Light) | Evening |
| Arctic Frost | Light | High | Spacious | 20px | 60px | Sans (Light) | Day |
| Sunset Gradient | Color | Medium | Balanced | 12px | 40px | Sans (Medium) | Sunset |
| Dark Storm | Dark | Very High | Compact | 8px | 20px | Sans (Bold) | Night |
| Botanical Garden | Nature | Medium | Balanced | 16px | 30px | Serif (Semi-bold) | Outdoor |
| Neon Cyberpunk | Future | Medium | Compact | 2px | 10px | Display (Bold) | Night |
| Retro Terminal | Retro | Very High | Compact | 0px | 0px | Mono (Bold) | Anytime |
| Minimalist Paper | Light | High | Spacious | 6px | 10px | Sans (Regular) | Day |

---

## System Architecture

### 1. Theme Configuration (`frontend/src/themes/themes.ts`)
- Defines the `Theme` interface with all customizable properties
- Contains the "Apple" theme with the original design values
- Easily extensible for adding new themes

### 2. Theme Context (`frontend/src/themes/ThemeContext.tsx`)
- React context provider for theme management
- Applies theme CSS variables to the document root
- Persists theme selection to localStorage
- Provides `useTheme()` hook for components

### 3. Theme Selector Component (`frontend/src/components/ThemeSelector.tsx`)
- Dropdown button in the top right corner
- Shows current theme name with paint palette icon
- Lists all available themes
- Highlights currently selected theme with checkmark
- Closes on outside click

### 4. Updated Files

#### `frontend/src/App.tsx`
- Wrapped app with `ThemeProvider`

#### `frontend/src/components/Layout.tsx`
- Added `ThemeSelector` component in top right corner
- Positioned absolutely with proper z-index

#### `frontend/src/index.css`
- Converted hardcoded values to CSS variables
- Added `:root` with default theme values
- Variables are dynamically updated by ThemeProvider

## Theme Properties

Each theme can customize:

### Colors
- `background` - Main app background (supports gradients)
- `text` - Primary text color
- `textSecondary` - Secondary text color
- `textTertiary` - Tertiary text color
- `cardBg` - Card background color
- `cardBorder` - Card border color
- `buttonBg` - Button background color
- `buttonHover` - Button hover state color
- `buttonText` - Button text color
- `accent` - Accent color for highlights

### Typography
- `fontFamily` - Font stack
- `headingWeight` - Font weight for headings
- `bodyWeight` - Font weight for body text

### Effects
- `cardRadius` - Border radius for cards
- `cardBlur` - Backdrop blur amount
- `cardShadow` - Box shadow for cards

### Spacing
- `cardPadding` - Internal card padding
- `sectionGap` - Gap between sections

## Design Considerations by Category

### Light vs Dark Themes

**Light Themes (Arctic Frost, Minimalist Paper):**
- Best for daytime use and bright environments
- Higher contrast with dark text on light backgrounds
- More spacious layouts (28px padding)
- Softer shadows and effects
- Better for reading and content-heavy interfaces

**Dark Themes (Apple, Dark Storm, Neon Cyberpunk, Retro Terminal):**
- Best for evening/night use and low-light environments
- Reduced eye strain in dark settings
- OLED-friendly (especially pure black themes)
- More dramatic shadows and glows
- Better for media and entertainment

### Contrast Levels

**Very High Contrast (Dark Storm, Retro Terminal):**
- Maximum accessibility (WCAG AAA)
- Best for users with visual impairments
- Excellent for focused work
- May cause eye strain in bright environments

**High Contrast (Arctic Frost, Minimalist Paper):**
- Excellent readability
- Professional appearance
- Good for all-day use
- Versatile across contexts

**Medium Contrast (Apple, Sunset Gradient, Botanical Garden, Neon Cyberpunk):**
- Comfortable for extended viewing
- More visually interesting
- Better for entertainment
- May sacrifice some readability for aesthetics

### Density and Spacing

**Spacious (Arctic Frost, Minimalist Paper):**
- 28px padding, 16px gaps
- Best for reading and content
- Editorial, premium feel
- More scrolling required

**Balanced (Apple, Sunset Gradient, Botanical Garden):**
- 20px padding, 12-16px gaps
- Versatile for most use cases
- Good balance of density and comfort
- Standard for most applications

**Compact (Dark Storm, Neon Cyberpunk, Retro Terminal):**
- 12-16px padding, 8-12px gaps
- Information-dense displays
- More data visible at once
- Better for power users and dashboards

### Typography Choices

**Serif Fonts (Botanical Garden):**
- Traditional, editorial feel
- Better for long-form reading
- Organic, natural aesthetic
- Less common in UI design

**Sans-Serif Fonts (Most themes):**
- Modern, clean appearance
- Excellent screen readability
- Versatile across contexts
- Industry standard for UI

**Monospace Fonts (Retro Terminal):**
- Technical, code-like appearance
- Nostalgic, retro feel
- Fixed-width characters
- Best for developer tools

**Display Fonts (Neon Cyberpunk):**
- Decorative, attention-grabbing
- Strong personality
- Less readable at small sizes
- Best for headings and accents

### Color Psychology

**Cool Colors (Apple, Arctic Frost, Dark Storm):**
- Professional, trustworthy
- Calming, focused
- Tech-forward
- Better for productivity

**Warm Colors (Sunset Gradient, Botanical Garden):**
- Energetic, creative
- Comfortable, inviting
- Natural, organic
- Better for entertainment

**Neon/Electric (Neon Cyberpunk):**
- Futuristic, exciting
- High energy
- Attention-grabbing
- Better for gaming/entertainment

**Monochrome (Retro Terminal, Minimalist Paper):**
- Focused, distraction-free
- Timeless, classic
- Maximum readability
- Better for content and productivity

---

## How to Add New Themes

1. Open `frontend/src/themes/themes.ts`
2. Add a new theme object to the `themes` record:

```typescript
export const themes: Record<string, Theme> = {
  // ... existing themes
  
  newTheme: {
    id: 'newTheme',
    name: 'New Theme',
    colors: {
      background: 'linear-gradient(...)',
      text: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.9)',
      textTertiary: 'rgba(255, 255, 255, 0.7)',
      cardBg: 'rgba(255, 255, 255, 0.1)',
      cardBorder: 'rgba(255, 255, 255, 0.2)',
      buttonBg: 'rgba(255, 255, 255, 0.15)',
      buttonHover: 'rgba(255, 255, 255, 0.25)',
      buttonText: '#ffffff',
      accent: '#0ea5e9',
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      headingWeight: '600',
      bodyWeight: '400',
    },
    effects: {
      cardRadius: '12px',
      cardBlur: '20px',
      cardShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
    },
    spacing: {
      cardPadding: '16px',
      sectionGap: '12px',
    },
  },
};
```

3. The new theme will automatically appear in the theme selector

### Theme Design Guidelines

When creating new themes, consider:

1. **Contrast Ratios:** Ensure text meets WCAG AA standards (4.5:1 for normal text)
2. **Consistency:** Use a cohesive color palette with clear hierarchy
3. **Accessibility:** Test with screen readers and keyboard navigation
4. **Performance:** Avoid excessive blur or complex gradients on low-end devices
5. **Context:** Consider when and where the theme will be used
6. **Typography:** Choose fonts that match the theme's personality
7. **Spacing:** Maintain consistent rhythm throughout the design
8. **Testing:** Verify theme works across all components and states

## What Remains Unchanged

- All data fetching and API calls
- Map functionality and interactions
- Add location flow
- Refresh behavior
- Backend API
- Database schema
- All business logic

## Usage

### Switching Themes

1. Click the theme selector button (paint palette icon) in the top right corner
2. Browse through all 8 available themes
3. Click any theme to instantly apply it
4. Your selection is saved to localStorage and persists across sessions

### Programmatic Theme Access

```typescript
import { useTheme } from './themes/ThemeContext';

function MyComponent() {
  const { currentTheme, setTheme, themes } = useTheme();
  
  // Get current theme
  console.log(currentTheme.name);
  
  // Change theme
  setTheme('darkStorm');
  
  // List all themes
  Object.values(themes).forEach(theme => {
    console.log(theme.name);
  });
}
```

---

## Font Loading (Optional)

For optimal typography, add these web fonts to your HTML:

```html
<!-- Arctic Frost, Minimalist Paper -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400&family=IBM+Plex+Sans:wght@400&family=Source+Sans+Pro:wght@400&display=swap" rel="stylesheet">

<!-- Sunset Gradient -->
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500&family=Poppins:wght@400;500&display=swap" rel="stylesheet">

<!-- Dark Storm -->
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=DM+Sans:wght@400;700&display=swap" rel="stylesheet">

<!-- Botanical Garden -->
<link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;600&family=Merriweather:wght@400;600&display=swap" rel="stylesheet">

<!-- Neon Cyberpunk -->
<link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;700&family=Orbitron:wght@500;700&display=swap" rel="stylesheet">

<!-- Retro Terminal -->
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Fira+Code:wght@400;700&display=swap" rel="stylesheet">
```

All themes gracefully fall back to system fonts if web fonts aren't loaded.

---

## Future Enhancements

Potential additions to the theme system:

1. **Theme Preview Thumbnails** - Visual previews in the selector
2. **Theme Categories** - Filter by light/dark, colorful, minimal, etc.
3. **Favorite Themes** - Star/bookmark preferred themes
4. **Time-Based Auto-Switching** - Automatically switch based on time of day
5. **Custom Theme Creator** - UI for building custom themes
6. **Theme Import/Export** - Share themes as JSON
7. **Theme Variants** - Light/dark variants of each theme
8. **Seasonal Themes** - Special themes for holidays/seasons
9. **Accessibility Presets** - High contrast, large text, etc.
10. **Theme Animations** - Smooth transitions between themes
