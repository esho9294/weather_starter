# LocationMarker Component Usage

## Overview
The `LocationMarker` component renders a single location pin on the map with visual highlighting support.

## Props

```typescript
interface LocationMarkerProps {
  location: Location;      // Location object with coordinates and weather data
  isSelected: boolean;     // Whether this location is currently selected
  onMarkerClick: (locationId: number) => void;  // Callback when marker is clicked
}
```

## Features

- **Visual Highlighting**: When `isSelected` is true, the marker scales to 1.2x and changes border color to #3b82f6
- **Smooth Transitions**: 200ms ease-in-out animation for scale and border changes
- **Performance Optimized**: Uses React.memo to prevent unnecessary re-renders
- **Click Handling**: Calls `onMarkerClick` with the location ID when clicked

## Integration Example

To integrate LocationMarker into MapCard, add the following inside the `<MapContainer>` component:

```tsx
import { LocationMarker } from './LocationMarker';
import { validateCoordinates } from './mapUtils';

// Inside MapCard component, within <MapContainer>:
{locations
  .filter(validateCoordinates)
  .map((location) => (
    <LocationMarker
      key={location.id}
      location={location}
      isSelected={selectedId === location.id}
      onMarkerClick={select}
    />
  ))}
```

## Complete MapCard Integration

```tsx
export function MapCard() {
  const { locations, selectedId, select } = useStore();
  
  // ... existing state and handlers ...

  const mapContent = (
    <div className="relative h-full w-full">
      {/* ... existing button code ... */}
      
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full rounded-2xl"
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Add LocationMarker components */}
        {locations
          .filter(validateCoordinates)
          .map((location) => (
            <LocationMarker
              key={location.id}
              location={location}
              isSelected={selectedId === location.id}
              onMarkerClick={select}
            />
          ))}
      </MapContainer>
      
      {/* ... existing empty state message ... */}
    </div>
  );
  
  // ... rest of component ...
}
```

## Styling Details

- **Default State**: Blue pin (#3b82f6) with white border (2px), scale 1x
- **Selected State**: Blue pin (#3b82f6) with blue border (3px), scale 1.2x
- **Transition**: 200ms ease-in-out for smooth animation
- **Icon Size**: 25x41 pixels
- **Anchor Point**: Bottom center of the pin (12, 41)

## Requirements Validated

This component validates the following requirements:
- **Requirement 2.1**: Renders Location_Pin at correct latitude/longitude coordinates
- **Requirement 2.2**: Adds new Location_Pin when Saved_Location is created
- **Requirement 2.5**: Applies visual highlight (border color #3b82f6, scale 1.2x) when clicked
