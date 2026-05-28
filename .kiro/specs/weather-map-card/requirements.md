# Requirements Document

## Introduction

This document specifies requirements for adding an Apple Weather-style map card to the Weather Starter application. The map card will display all saved locations as pins with weather labels and support expansion to a fullscreen map view. The feature integrates with the existing location management system and provides a visual geographic overview of tracked weather locations.

## Glossary

- **Map_Card**: A dashboard card component that displays an embedded map showing saved location pins
- **Location_Pin**: A visual marker on the map representing a saved location's geographic coordinates
- **Weather_Label**: A text overlay above a location pin showing current weather condition or temperature
- **Fullscreen_Map**: An expanded view of the map that covers the entire viewport
- **Dashboard**: The main application view that displays weather cards for saved locations
- **Saved_Location**: A location stored in the database with latitude, longitude, and weather snapshot data

## Requirements

### Requirement 1: Display Map Card in Dashboard

**User Story:** As a user, I want to see a map card in my dashboard, so that I can view the geographic distribution of my saved locations at a glance.

#### Acceptance Criteria

1. THE Map_Card SHALL render as a card component in the Dashboard alongside existing weather cards
2. THE Map_Card SHALL NOT replace the main weather view for the selected location
3. THE Map_Card SHALL display an interactive map that allows panning and zooming
4. THE Map_Card SHALL have the same visual styling (border radius, shadow, padding, background color) as other dashboard cards
5. WHEN the Dashboard loads, THE Map_Card SHALL initialize the map centered at coordinates 1.3521°N, 103.8198°E (Singapore) with zoom level 11
6. WHEN one or more Saved_Locations exist, THE Map_Card SHALL display Location_Pins for each location
7. IF no Saved_Locations exist, THEN THE Map_Card SHALL display an empty map with the message "No locations saved yet"
8. WHEN multiple Saved_Locations exist, THE Map_Card SHALL automatically adjust the map bounds to fit all Location_Pins with 50px padding

### Requirement 2: Render Location Pins on Map

**User Story:** As a user, I want to see pins for all my saved locations on the map, so that I can identify where each location is geographically.

#### Acceptance Criteria

1. FOR ALL Saved_Locations WHERE latitude is in range [-90, 90] AND longitude is in range [-180, 180], THE Map_Card SHALL render a Location_Pin at the corresponding latitude and longitude coordinates
2. WHEN a Saved_Location is created, THE Map_Card SHALL add a new Location_Pin to the map within 500ms
3. WHEN a Saved_Location is deleted, THE Map_Card SHALL remove the corresponding Location_Pin from the map within 500ms
4. WHEN the set of Saved_Locations changes, THE Map_Card SHALL adjust the map bounds to fit all Location_Pins with 50px padding within 500ms
5. WHEN a Location_Pin is clicked, THE Map_Card SHALL apply a visual highlight (border color change to #3b82f6 and scale increase to 1.2x) to the corresponding location card in the Dashboard within 200ms
6. IF a Saved_Location has latitude outside [-90, 90] OR longitude outside [-180, 180], THEN THE Map_Card SHALL log an error and not render a Location_Pin for that location

### Requirement 3: Display Weather Labels Above Pins

**User Story:** As a user, I want to see weather information above each pin, so that I can quickly understand current conditions without leaving the map view.

#### Acceptance Criteria

1. FOR ALL Location_Pins, THE Map_Card SHALL display a Weather_Label positioned 20px above the pin's vertical center
2. IF a location's weather snapshot contains temperature data, THEN THE Weather_Label SHALL display the temperature in Celsius with format "{temp}°C"
3. IF a location's weather snapshot does not contain temperature data AND contains weather condition text, THEN THE Weather_Label SHALL display the weather condition text
4. WHEN a location's weather data is refreshed, THE Weather_Label SHALL update to reflect the new weather information within 200ms
5. WHEN two or more Weather_Labels would overlap (separation distance < 30px), THE Map_Card SHALL apply a vertical offset to maintain minimum 30px separation
6. IF weather data is unavailable for a location, THEN THE Weather_Label SHALL display the placeholder text "--"
7. THE Weather_Label SHALL have a semi-transparent background (opacity 0.8) and font size 12px
8. THE Weather_Label SHALL have a minimum contrast ratio of 4.5:1 between text and background colors

### Requirement 4: Expand Map to Fullscreen View

**User Story:** As a user, I want to expand the map card to fullscreen, so that I can see more geographic detail and interact with the map more easily.

#### Acceptance Criteria

1. THE Map_Card SHALL provide an expand button in the top-right corner of the card to trigger fullscreen mode
2. WHEN the expand button is clicked, THE same map instance SHALL transition to a Fullscreen_Map view covering the browser viewport (excluding browser chrome) within 500ms
3. THE Fullscreen_Map SHALL display all Location_Pins and Weather_Labels from the card view
4. THE Fullscreen_Map SHALL provide a close button in the top-right corner to exit fullscreen mode
5. WHEN the close button is clicked, THE Fullscreen_Map SHALL transition back to the card view in the Dashboard within 500ms
6. THE Fullscreen_Map SHALL preserve the map's center coordinates (latitude and longitude) and zoom level during the transition to fullscreen
7. THE Fullscreen_Map SHALL preserve the map's center coordinates (latitude and longitude) and zoom level during the transition back to card view
8. WHEN the Escape key is pressed WHILE the Fullscreen_Map is active, THE Map_Card SHALL exit fullscreen mode within 500ms
9. IF the expand button is clicked WHILE a fullscreen transition is in progress, THEN THE Map_Card SHALL ignore the click
10. IF the close button is clicked WHILE a card view transition is in progress, THEN THE Fullscreen_Map SHALL ignore the click
11. WHEN transitioning to fullscreen, THE Dashboard and other cards SHALL remain in the background and become visible again when exiting fullscreen

### Requirement 5: Map Interaction and Navigation

**User Story:** As a user, I want to pan and zoom the map, so that I can explore different areas and adjust the level of detail.

#### Acceptance Criteria

1. WHEN the user drags the map with mouse or touch input for at least 5px, THE Map_Card SHALL pan the map view within 100ms
2. THE Map_Card SHALL zoom using scroll wheel (one notch = one zoom level), pinch gestures (spread = zoom in, pinch = zoom out), or zoom controls (+/- buttons)
3. WHEN the user drags the Fullscreen_Map with mouse or touch input for at least 5px, THE Fullscreen_Map SHALL pan the map view within 100ms
4. THE Fullscreen_Map SHALL zoom using scroll wheel (one notch = one zoom level), pinch gestures (spread = zoom in, pinch = pinch out), or zoom controls (+/- buttons)
5. WHEN the map is panned or zoomed, THE Location_Pins and Weather_Labels SHALL remain anchored to their geographic coordinates within 100ms
6. THE Map_Card SHALL enforce minimum zoom level 1 and maximum zoom level 18
7. THE Fullscreen_Map SHALL enforce minimum zoom level 1 and maximum zoom level 18

### Requirement 6: Map Card Responsiveness

**User Story:** As a user, I want the map card to work well on different screen sizes, so that I can use it on mobile and desktop devices.

#### Acceptance Criteria

1. WHEN the viewport width is >= 768px, THE Map_Card SHALL render with minimum height 400px and width matching the Dashboard grid column width
2. WHEN the viewport width is < 768px, THE Map_Card SHALL render with minimum height 300px and width 100% of the viewport width minus padding
3. THE Fullscreen_Map SHALL occupy 100% of the browser viewport width and height (excluding browser chrome)
4. WHEN the viewport is resized, THE Map_Card SHALL adjust its dimensions to match the Dashboard layout within 500ms
5. WHEN the viewport is resized WHILE in fullscreen mode, THE Fullscreen_Map SHALL adjust to fill the new viewport dimensions within 500ms

### Requirement 7: Map Library Integration

**User Story:** As a developer, I want to use a well-supported mapping library, so that the map functionality is reliable and maintainable.

#### Acceptance Criteria

1. THE Map_Card SHALL use React Leaflet version 4.x as the mapping library
2. THE Map_Card SHALL load map tiles from OpenStreetMap tile server (https://tile.openstreetmap.org/{z}/{x}/{y}.png)
3. IF map initialization fails within 2 seconds, THEN THE Map_Card SHALL display the error message "Unable to load map. Please refresh the page."
4. IF map tile loading fails after 3 retry attempts with 10 second timeout per attempt, THEN THE Map_Card SHALL display the error message "Map tiles unavailable. Please check your connection."
5. WHEN the Map_Card component unmounts, THE Map_Card SHALL call the Leaflet map.remove() method to clean up map resources
6. THE Map_Card SHALL use TypeScript types from @types/leaflet for all Leaflet API interactions
7. THE Map_Card SHALL use TypeScript interfaces for all map-related props and state
8. THE Map_Card SHALL handle tile loading errors by displaying a gray placeholder tile with "Tile unavailable" text
