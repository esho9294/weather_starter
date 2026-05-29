# Sunset Gradient Theme

## Overview
The **Sunset Gradient** theme brings warm, vibrant colors inspired by golden hour skies. This theme features gradient transitions from orange through pink to purple, creating a stunning visual experience.

## Theme Characteristics

### Visual Design Philosophy
- **Warm & Vibrant**: Rich sunset colors that evoke evening warmth
- **Golden Hour Inspired**: Orange, pink, and purple gradient palette
- **Energetic Feel**: Medium weights and comfortable spacing
- **Gradient Borders**: Subtle orange-tinted borders for depth

### Color Palette

#### Background
- Vibrant gradient: Orange (`#fb923c`) → Deep Orange (`#f97316`) → Pink (`#ec4899`) → Purple (`#a855f7`)
- Radial overlays at strategic positions for depth
- Creates a warm, sunset sky atmosphere

#### Text Colors
- **Primary**: Cream (`#fef3c7`) - soft, warm white
- **Secondary**: Light yellow (`#fde68a`) - golden highlights
- **Tertiary**: Medium yellow (`#fcd34d`) - warm accents
- **Button Text**: Cream (`#fef3c7`) - matches primary text

#### Interactive Elements
- **Cards**: White with 12% opacity for subtle glass effect
- **Borders**: Orange-tinted (`rgba(251, 146, 60, 0.3)`)
- **Buttons**: Slightly higher opacity white (15%) with warm hover
- **Accent**: Golden yellow (`#fbbf24`) for highlights

### Typography
- **Font Family**: Outfit, Poppins (with system fallbacks)
- **Heading Weight**: 500 (medium, more substantial than Apple/Arctic)
- **Body Weight**: 400 (regular, readable)
- **Style**: Rounded letterforms for friendly feel

### Effects & Styling

#### Cards
- **Border Radius**: 12px (slightly rounded, modern)
- **Backdrop Blur**: 40px (balanced glass effect)
- **Shadow**: Pink-tinted shadow with orange border glow
- **Padding**: 20px (balanced, comfortable)

#### Layout
- **Section Gap**: 12px (consistent with Apple theme)
- **Overall Density**: Balanced, neither too spacious nor compact

## Comparison with Other Themes

| Property | Apple | Arctic Frost | Sunset Gradient |
|----------|-------|--------------|-----------------|
| **Mood** | Cool, professional | Clean, minimal | Warm, vibrant |
| **Background** | Dark blue | Light ice blue | Orange-pink-purple |
| **Text Color** | White | Black | Cream/golden |
| **Card Opacity** | 8% white | 70% white | 12% white |
| **Border Radius** | 16px | 20px | 12px |
| **Font Weight** | Light (300) | Light (300) | Medium (500) |
| **Best Time** | Evening | Daytime | Sunset/Evening |

## Color Psychology

The Sunset Gradient theme leverages warm colors to create specific emotional responses:

- **Orange**: Energy, enthusiasm, warmth
- **Pink**: Playfulness, creativity, comfort
- **Purple**: Luxury, imagination, sophistication
- **Golden Yellow**: Optimism, happiness, clarity

## Technical Details

### CSS Variables Set
```css
--theme-bg: [orange-pink-purple gradient]
--theme-text: #fef3c7 (cream)
--theme-text-secondary: #fde68a (light yellow)
--theme-text-tertiary: #fcd34d (medium yellow)
--theme-card-bg: rgba(255, 255, 255, 0.12)
--theme-card-border: rgba(251, 146, 60, 0.3)
--theme-accent: #fbbf24 (golden)
```

### Font Loading
The theme specifies Outfit and Poppins fonts. These are web fonts that may need to be loaded. If not available, the theme gracefully falls back to system fonts.

To add the fonts, include in your HTML:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500&family=Poppins:wght@400;500&display=swap" rel="stylesheet">
```

## Best Use Cases

Sunset Gradient works particularly well for:
- 🌅 Evening use (warm, comfortable on eyes at dusk)
- 🎨 Creative/artistic applications
- 💫 Users who prefer vibrant, colorful interfaces
- 🌆 Sunset weather displays
- 🎭 Entertainment or lifestyle apps
- 📸 Photo/media-heavy interfaces

## Accessibility Notes

### Contrast Ratios
- Cream text on gradient background: Good contrast in most areas
- Golden accents provide visual interest without compromising readability
- Card backgrounds provide additional contrast layer

### Recommendations
- Best used in well-lit environments
- May be less suitable for extended reading sessions
- Consider offering alongside a high-contrast option

## How to Use

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open the app in your browser

3. Click the theme selector in the top right corner

4. Select "Sunset Gradient" from the dropdown

5. Enjoy the warm, vibrant sunset colors!

## Customization Ideas

You can create variants of this theme:
- **Dawn Gradient**: Reverse the gradient (purple → pink → orange)
- **Tropical Sunset**: Add more red/coral tones
- **Desert Sunset**: Shift toward amber and terracotta
- **Neon Sunset**: Increase saturation for a more electric feel

## Next Steps

With three themes now available (Apple, Arctic Frost, Sunset Gradient), you can:
1. Continue adding more themes from the original list
2. Create seasonal theme packs
3. Add theme preview thumbnails
4. Implement theme scheduling (auto-switch based on time of day)
5. Allow users to customize existing themes
