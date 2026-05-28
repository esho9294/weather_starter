import { memo } from 'react';
import { Marker } from 'react-leaflet';
import { divIcon } from 'leaflet';
import type { Location } from '../types';

interface LocationMarkerProps {
  location: Location;
  isSelected: boolean;
  onMarkerClick: (locationId: number) => void;
  labelPosition?: 'above' | 'below';
}

function LocationMarkerComponent({
  location,
  isSelected,
  onMarkerClick,
  labelPosition = 'above',
}: LocationMarkerProps) {
  const handleClick = () => {
    onMarkerClick(location.id);
  };

  // Determine what to display based on available weather data
  const getDisplayText = (): string => {
    const { weather } = location;
    
    // Priority 1: Temperature
    if (weather.temperature_c !== null && weather.temperature_c !== undefined) {
      return `${Math.round(weather.temperature_c)}°C`;
    }
    
    // Priority 2: Weather condition
    if (weather.condition) {
      return weather.condition;
    }
    
    // Priority 3: Placeholder
    return '--';
  };

  // Create a custom icon that includes the weather label
  const iconWithLabel = divIcon({
    className: 'custom-marker-with-label',
    html: `
      <div style="position: relative; width: 25px; height: 41px;">
        <!-- Weather Label -->
        <div style="
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          ${labelPosition === 'above' ? 'bottom: 61px;' : 'top: 41px;'}
          white-space: nowrap;
          pointer-events: none;
          transition: all 200ms ease-in-out;
        ">
          <div style="
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            font-size: 12px;
            padding: 4px 8px;
            border-radius: 6px;
          ">
            ${getDisplayText()}
          </div>
        </div>
        
        <!-- Pin Marker -->
        <div style="
          width: 25px;
          height: 41px;
          position: relative;
          transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
          transition: transform 200ms ease-in-out;
        ">
          <svg
            width="25"
            height="41"
            viewBox="0 0 25 41"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.5 0C5.596 0 0 5.596 0 12.5c0 9.375 12.5 28.5 12.5 28.5S25 21.875 25 12.5C25 5.596 19.404 0 12.5 0z"
              fill="#3b82f6"
              stroke="${isSelected ? '#3b82f6' : '#ffffff'}"
              stroke-width="${isSelected ? '3' : '2'}"
            />
            <circle
              cx="12.5"
              cy="12.5"
              r="6"
              fill="#ffffff"
            />
          </svg>
        </div>
      </div>
    `,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -41],
  });

  return (
    <Marker
      position={[location.latitude, location.longitude]}
      icon={iconWithLabel}
      eventHandlers={{
        click: handleClick,
      }}
    />
  );
}

// Export memoized component for performance optimization
export const LocationMarker = memo(LocationMarkerComponent);
