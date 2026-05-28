import type { WeatherSnapshot } from '../types';

interface WeatherLabelProps {
  weather: WeatherSnapshot;
  position?: 'above' | 'below';
}

/**
 * WeatherLabel component displays weather information above a location pin.
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.6, 3.7, 3.8**
 * 
 * Display logic:
 * - If temperature is available: Display "{temp}°C" format
 * - If temperature unavailable but condition exists: Display condition text
 * - If no weather data: Display "--" placeholder
 * 
 * Styling:
 * - Position: 20px above pin vertical center
 * - Background: rgba(0, 0, 0, 0.8) with white text
 * - Font size: 12px
 * - Padding: 4px 8px
 * - Border radius: 6px
 */
export function WeatherLabel({ weather, position = 'above' }: WeatherLabelProps) {
  // Determine what to display based on available weather data
  const getDisplayText = (): string => {
    // Priority 1: Temperature (Requirement 3.2)
    if (weather.temperature_c !== null && weather.temperature_c !== undefined) {
      return `${Math.round(weather.temperature_c)}°C`;
    }
    
    // Priority 2: Weather condition (Requirement 3.3)
    if (weather.condition) {
      return weather.condition;
    }
    
    // Priority 3: Placeholder (Requirement 3.6)
    return '--';
  };

  const displayText = getDisplayText();

  return (
    <div
      className="pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap"
      style={{
        // Position 20px above pin vertical center (Requirement 3.1)
        [position === 'above' ? 'bottom' : 'top']: '20px',
      }}
    >
      <div
        className="rounded-md px-2 py-1 text-xs text-white"
        style={{
          // Semi-transparent background (Requirement 3.7)
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          // Font size 12px (Requirement 3.7)
          fontSize: '12px',
          // Padding 4px 8px (Requirement 3.8)
          padding: '4px 8px',
          // Border radius 6px (Requirement 3.8)
          borderRadius: '6px',
        }}
      >
        {displayText}
      </div>
    </div>
  );
}
