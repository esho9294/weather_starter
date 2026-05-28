# Implementation Plan: Weather Map Card

## Overview

This implementation plan breaks down the Weather Map Card feature into discrete coding tasks. The feature adds an Apple Weather-style map card to the dashboard that displays saved locations as pins with weather labels and supports fullscreen expansion. The implementation uses React Leaflet 4.x with OpenStreetMap tiles and integrates with the existing Zustand store for location management.

## Tasks

- [~] 1. Install dependencies and configure map library
  - Install `react-leaflet` package (version 4.x)
  - Install `@types/leaflet` as dev dependency
  - Import Leaflet CSS in `main.tsx` or `index.css`
  - Configure Leaflet default marker icons to work with Vite bundler
  - _Requirements: 7.1, 7.2, 7.6, 7.7_

- [x] 2. Create core MapCard component structure
  - [x] 2.1 Create `MapCard.tsx` component file in `frontend/src/components/`
    - Implement MapCard component with local state for fullscreen mode and map instance
    - Render MapContainer with OpenStreetMap TileLayer
    - Set default center to Singapore (1.3521°N, 103.8198°E) and zoom level 11
    - Add expand button in top-right corner
    - Subscribe to locations array from Zustand store
    - Handle empty state with "No locations saved yet" message
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.7, 7.1, 7.2_
  
  - [x] 2.2 Write unit tests for MapCard component
    - Test rendering with default center and zoom when no locations exist
    - Test empty state message display
    - Test expand button click toggles fullscreen state
    - Test Escape key exits fullscreen mode
    - Test button clicks ignored during transitions
    - _Requirements: 1.5, 1.7, 4.1, 4.8, 4.9_

- [x] 3. Implement coordinate validation utility
  - [x] 3.1 Create coordinate validation function
    - Write `validateCoordinates` function that checks latitude in [-90, 90] and longitude in [-180, 180]
    - Log error for invalid coordinates
    - Return boolean indicating validity
    - _Requirements: 2.1, 2.6_
  
  - [x] 3.2 Write unit tests for coordinate validation
    - Test valid latitude and longitude ranges
    - Test rejection of out-of-range coordinates
    - Test error logging for invalid coordinates
    - _Requirements: 2.1, 2.6_

- [x] 4. Create LocationMarker component
  - [x] 4.1 Create `LocationMarker.tsx` component file
    - Implement LocationMarker component that renders Leaflet Marker at location coordinates
    - Accept location, isSelected, and onMarkerClick props
    - Apply visual highlight (border color #3b82f6, scale 1.2x) when isSelected is true
    - Handle marker click to call onMarkerClick with location ID
    - Add 200ms transition for highlight animation
    - Use React.memo for performance optimization
    - _Requirements: 2.1, 2.2, 2.5_
  
  - [x] 4.2 Write unit tests for LocationMarker component
    - Test marker renders at correct coordinates
    - Test onMarkerClick called with location ID on click
    - Test selected styling applied when isSelected is true
    - Test marker not rendered for invalid coordinates
    - _Requirements: 2.1, 2.2, 2.5, 2.6_

- [x] 5. Create WeatherLabel component
  - [x] 5.1 Create `WeatherLabel.tsx` component file
    - Implement WeatherLabel component that displays weather info above pin
    - Display temperature in format "{temp}°C" if available
    - Display weather condition text if temperature unavailable
    - Display "--" placeholder if no weather data available
    - Position label 20px above pin vertical center
    - Apply semi-transparent background (rgba(0, 0, 0, 0.8)) with white text
    - Use font size 12px, padding 4px 8px, border radius 6px
    - _Requirements: 3.1, 3.2, 3.3, 3.6, 3.7, 3.8_
  
  - [x] 5.2 Write unit tests for WeatherLabel component
    - Test temperature display when available
    - Test condition display when temperature unavailable
    - Test placeholder display when no weather data
    - Test styling and positioning
    - _Requirements: 3.2, 3.3, 3.6, 3.7_

- [x] 6. Implement label collision detection
  - [x] 6.1 Create collision detection utility
    - Write `resolveCollisions` function that detects overlapping labels (< 30px separation)
    - Apply 30px vertical offset to overlapping labels
    - Stack up to 3 labels with 30px increments (max 90px offset)
    - Sort labels by y-position before processing
    - _Requirements: 3.5_
  
  - [x] 6.2 Write unit tests for collision detection
    - Test collision detection when labels < 30px apart
    - Test 30px vertical offset applied to second label
    - Test stacking up to 3 labels
    - Test max offset limit of 90px
    - _Requirements: 3.5_

- [x] 7. Create MapController custom hook
  - [x] 7.1 Create `useMapController.ts` hook file
    - Implement useMapController hook that manages map instance lifecycle
    - Calculate bounds to fit all valid location pins with 50px padding
    - Trigger fitBounds when locations array changes
    - Debounce bounds updates to 500ms to avoid excessive re-renders
    - Preserve map center and zoom during fullscreen transitions
    - Filter out locations with invalid coordinates
    - Return null bounds for empty locations array
    - _Requirements: 1.6, 1.8, 2.3, 2.4, 2.6_
  
  - [x] 7.2 Write unit tests for MapController hook
    - Test map initialization with default center and zoom
    - Test bounds calculation for single location
    - Test bounds calculation for multiple locations
    - Test null bounds for empty locations array
    - Test filtering of invalid coordinates
    - Test debouncing of fitBounds calls (500ms)
    - Test preservation of center and zoom during transitions
    - _Requirements: 1.5, 1.6, 1.8, 2.3, 2.4, 2.6_

- [~] 8. Checkpoint - Ensure core map functionality works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Create FullscreenPortal component
  - [x] 9.1 Create `FullscreenPortal.tsx` component file
    - Implement FullscreenPortal using React's createPortal to render into document.body
    - Accept isOpen, onClose, and children props
    - Apply fullscreen overlay styles with z-index 50
    - Prevent body scroll when open (set document.body.style.overflow = 'hidden')
    - Restore body scroll on unmount
    - Render close button in top-right corner
    - Handle close button click and Escape key press
    - _Requirements: 4.2, 4.4, 4.8, 4.11_
  
  - [x] 9.2 Write unit tests for FullscreenPortal component
    - Test portal renders into document.body when open
    - Test body scroll prevention when open
    - Test body scroll restoration on close
    - Test close button click calls onClose
    - Test Escape key press calls onClose
    - _Requirements: 4.2, 4.4, 4.8, 4.11_

- [x] 10. Integrate MapCard with fullscreen functionality
  - [x] 10.1 Add fullscreen state management to MapCard
    - Add isFullscreen and isTransitioning state to MapCard
    - Implement expand button click handler to set isFullscreen to true
    - Implement close handler to set isFullscreen to false
    - Set isTransitioning flag during 500ms animation
    - Ignore button clicks when isTransitioning is true
    - Preserve map center and zoom during transitions
    - Render FullscreenPortal when isFullscreen is true
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10_
  
  - [x] 10.2 Write integration tests for fullscreen transitions
    - Test expand button opens fullscreen within 500ms
    - Test close button exits fullscreen within 500ms
    - Test Escape key exits fullscreen within 500ms
    - Test map center and zoom preserved during transitions
    - Test all pins and labels visible in fullscreen
    - Test button clicks ignored during transitions
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10_

- [x] 11. Wire LocationMarkers into MapCard
  - [x] 11.1 Integrate LocationMarker rendering in MapCard
    - Map over locations array from store
    - Filter locations using validateCoordinates
    - Render LocationMarker for each valid location
    - Pass location, isSelected (compare with selectedId from store), and onMarkerClick props
    - Implement onMarkerClick to call store.select(locationId)
    - Apply useMapController hook to manage bounds
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  
  - [x] 11.2 Write integration tests for location pin rendering
    - Test pins render for all valid locations
    - Test pins not rendered for invalid coordinates
    - Test new pin appears within 500ms when location added
    - Test pin removes within 500ms when location deleted
    - Test map bounds adjust when locations change
    - Test clicking pin highlights corresponding dashboard card
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [ ] 12. Wire WeatherLabels into LocationMarkers
  - [x] 12.1 Integrate WeatherLabel rendering in LocationMarker
    - Render WeatherLabel component above each marker
    - Pass weather snapshot from location data
    - Apply collision detection using resolveCollisions utility
    - Update labels within 200ms when weather data refreshes
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  
  - [-] 12.2 Write integration tests for weather label display
    - Test labels display correct temperature or condition
    - Test labels update within 200ms when weather refreshes
    - Test collision detection maintains 30px separation
    - Test placeholder displayed when no weather data
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 13. Implement map interaction and navigation
  - [-] 13.1 Configure map interaction settings
    - Enable pan with mouse/touch drag (5px minimum movement)
    - Enable zoom with scroll wheel, pinch gestures, and zoom controls
    - Set minimum zoom level to 1 and maximum to 18
    - Ensure pins and labels remain anchored during pan/zoom (within 100ms)
    - Apply same settings to both card and fullscreen views
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_
  
  - [~] 13.2 Write integration tests for map interaction
    - Test map pans on drag (5px minimum)
    - Test map zooms with scroll wheel
    - Test zoom level constraints (min 1, max 18)
    - Test pins remain anchored during pan/zoom
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [ ] 14. Implement responsive design
  - [-] 14.1 Add responsive styling to MapCard
    - Set minimum height 400px and grid column width for viewport >= 768px
    - Set minimum height 300px and 100% width for viewport < 768px
    - Make fullscreen view occupy 100% viewport width and height
    - Handle viewport resize to adjust dimensions within 500ms
    - Handle viewport resize in fullscreen to adjust to new dimensions within 500ms
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [~] 14.2 Write integration tests for responsive behavior
    - Test card dimensions at mobile width (< 768px)
    - Test card dimensions at desktop width (>= 768px)
    - Test fullscreen occupies full viewport
    - Test dimension adjustment on viewport resize
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 15. Implement error handling
  - [-] 15.1 Add error handling to MapCard
    - Wrap map initialization in try-catch block
    - Display "Unable to load map. Please refresh the page." on initialization failure (2s timeout)
    - Configure TileLayer with errorTileUrl for gray placeholder tiles
    - Display "Map tiles unavailable. Please check your connection." on tile loading failure (3 retries, 10s timeout each)
    - Call map.remove() on component unmount to clean up resources
    - _Requirements: 7.3, 7.4, 7.5, 7.8_
  
  - [~] 15.2 Write unit tests for error handling
    - Test error message display on map initialization failure
    - Test gray placeholder tiles on tile loading failure
    - Test map.remove() called on unmount
    - _Requirements: 7.3, 7.4, 7.5, 7.8_

- [ ] 16. Integrate MapCard into Hero component
  - [~] 16.1 Add MapCard to Hero component layout
    - Import MapCard component in `Hero.tsx`
    - Render MapCard after the header section and validPeriod paragraph
    - Position MapCard before HourlyStrip component
    - Ensure MapCard uses same card styling as other dashboard components
    - _Requirements: 1.1, 1.2, 1.4_
  
  - [~] 16.2 Write integration tests for Hero layout
    - Test MapCard renders in correct position in dashboard
    - Test MapCard does not replace main weather view
    - Test MapCard styling matches other dashboard cards
    - _Requirements: 1.1, 1.2, 1.4_

- [~] 17. Final checkpoint - End-to-end testing
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- The design document specifies TypeScript with React Leaflet 4.x
- Existing project uses Zustand for state management and Tailwind CSS for styling
- Map tiles are provided by OpenStreetMap (no API key required)
- Leaflet CSS must be imported for proper marker and control styling
- Custom marker icons need special configuration to work with Vite bundler
- React.memo should be used on LocationMarker components for performance
- Debouncing is critical for bounds updates to avoid excessive re-renders
- Fullscreen implementation uses React Portal to render into document.body
- All timing requirements (200ms, 500ms) should be implemented with CSS transitions or setTimeout
- Error boundaries are recommended but not required for MVP

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "3.1"] },
    { "id": 1, "tasks": ["2.1", "3.2"] },
    { "id": 2, "tasks": ["2.2", "4.1", "5.1", "6.1", "7.1", "9.1"] },
    { "id": 3, "tasks": ["4.2", "5.2", "6.2", "7.2", "9.2"] },
    { "id": 4, "tasks": ["10.1", "11.1"] },
    { "id": 5, "tasks": ["10.2", "11.2", "12.1"] },
    { "id": 6, "tasks": ["12.2", "13.1", "14.1", "15.1"] },
    { "id": 7, "tasks": ["13.2", "14.2", "15.2", "16.1"] },
    { "id": 8, "tasks": ["16.2"] }
  ]
}
```
