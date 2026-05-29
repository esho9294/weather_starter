import { useEffect, useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { useStore } from '../state/store';
import { FullscreenPortal } from './FullscreenPortal';
import { useMapController } from './useMapController';
import { LocationMarker } from './LocationMarker';
import { validateCoordinates, resolveCollisions, type LabelPosition } from './mapUtils';
import type { Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Default map configuration
const DEFAULT_CENTER: [number, number] = [1.3521, 103.8198]; // Singapore
const DEFAULT_ZOOM = 11;
const MIN_ZOOM = 1;
const MAX_ZOOM = 18;
const TRANSITION_DURATION = 500; // milliseconds
const MAP_INIT_TIMEOUT = 2000; // 2 seconds

// Gray placeholder tile for error state
const ERROR_TILE_URL = 'data:image/svg+xml;base64,' + btoa(`
  <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">
    <rect width="256" height="256" fill="#e5e7eb"/>
    <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#6b7280" font-family="Arial" font-size="14">
      Tile unavailable
    </text>
  </svg>
`);

export function MapCard() {
  const { locations, selectedId, select } = useStore();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [tileError, setTileError] = useState<string | null>(null);
  const transitionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tileErrorCountRef = useRef<number>(0);

  // Use map controller hook to manage bounds and state preservation
  useMapController(mapInstance, locations, isFullscreen);

  // Filter valid locations for rendering
  const validLocations = locations.filter(validateCoordinates);

  // Calculate label positions and apply collision detection
  const labelPositions = useMemo(() => {
    if (!mapInstance || validLocations.length === 0) {
      return new Map<number, 'above' | 'below'>();
    }

    // Convert lat/lng to pixel coordinates for collision detection
    const positions: LabelPosition[] = validLocations.map((location) => {
      const point = mapInstance.latLngToContainerPoint([
        location.latitude,
        location.longitude,
      ]);
      return {
        x: point.x,
        y: point.y,
        id: location.id,
      };
    });

    // Apply collision detection
    const resolved = resolveCollisions(positions);

    // Create a map of location ID to label position (above/below)
    const positionMap = new Map<number, 'above' | 'below'>();
    
    // For now, all labels are 'above' by default
    // The collision detection adjusts the y-offset, which is handled in the icon HTML
    validLocations.forEach((location) => {
      positionMap.set(location.id, 'above');
    });

    return positionMap;
  }, [mapInstance, validLocations]);

  // Handle marker click to select location
  const handleMarkerClick = (locationId: number) => {
    select(locationId);
  };

  // Handle Escape key to exit fullscreen
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen && !isTransitioning) {
        handleCloseClick();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isFullscreen, isTransitioning]);

  // Handle viewport resize to adjust map dimensions
  useEffect(() => {
    if (!mapInstance) return;

    let resizeTimer: NodeJS.Timeout;

    const handleResize = () => {
      // Debounce resize events to trigger within 500ms
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        // Invalidate map size to force recalculation
        mapInstance.invalidateSize();
      }, 500);
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, [mapInstance]);

  // Cleanup transition timer on unmount
  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  // Map initialization timeout - set error if map doesn't initialize within 2 seconds
  useEffect(() => {
    if (!mapInstance && !mapError) {
      initTimeoutRef.current = setTimeout(() => {
        if (!mapInstance) {
          setMapError('Unable to load map. Please refresh the page.');
          console.error('Map initialization failed: timeout after 2 seconds');
        }
      }, MAP_INIT_TIMEOUT);
    }

    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
    };
  }, [mapInstance, mapError]);

  // Cleanup map resources on unmount
  useEffect(() => {
    return () => {
      if (mapInstance) {
        try {
          mapInstance.remove();
        } catch (error) {
          console.error('Error cleaning up map:', error);
        }
      }
    };
  }, [mapInstance]);

  const handleExpandClick = () => {
    // Ignore clicks during transitions
    if (isTransitioning) return;

    setIsTransitioning(true);
    setIsFullscreen(true);

    // Clear transition flag after animation completes
    transitionTimerRef.current = setTimeout(() => {
      setIsTransitioning(false);
      transitionTimerRef.current = null;
    }, TRANSITION_DURATION);
  };

  const handleCloseClick = () => {
    // Ignore clicks during transitions
    if (isTransitioning) return;

    setIsTransitioning(true);
    setIsFullscreen(false);

    // Clear transition flag after animation completes
    transitionTimerRef.current = setTimeout(() => {
      setIsTransitioning(false);
      transitionTimerRef.current = null;
    }, TRANSITION_DURATION);
  };

  // Handle tile loading errors
  const handleTileError = () => {
    tileErrorCountRef.current += 1;
    
    // After 3 failed attempts, show error message
    if (tileErrorCountRef.current >= 3) {
      setTileError('Map tiles unavailable. Please check your connection.');
      console.error('Tile loading failed after 3 retry attempts');
    }
  };

  // If map initialization failed, show error state
  if (mapError) {
    return (
      <section className="rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-xl overflow-hidden min-h-[400px] md:min-h-[400px] sm:min-h-[300px]">
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-6">
            <svg
              className="mx-auto h-12 w-12 text-red-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="text-sm text-white/90">{mapError}</p>
          </div>
        </div>
      </section>
    );
  }

  const mapContent = (
    <div className="relative h-full w-full">
      {/* Tile error message */}
      {tileError && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-[1000] bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
          {tileError}
        </div>
      )}

      {/* Expand button (only shown in card view) */}
      {!isFullscreen && (
        <button
          onClick={handleExpandClick}
          className="absolute right-4 top-4 z-[1000] rounded-lg bg-white/90 p-2 shadow-lg backdrop-blur-sm hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Expand map"
          disabled={isTransitioning}
        >
          <svg
            className="h-5 w-5 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
        </button>
      )}

      {/* Map container */}
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        className="h-full w-full rounded-2xl"
        dragging={true}
        touchZoom={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        zoomControl={true}
        tapTolerance={5}
        ref={(map) => {
          if (map && !mapInstance) {
            try {
              setMapInstance(map);
              // Clear initialization timeout on successful mount
              if (initTimeoutRef.current) {
                clearTimeout(initTimeoutRef.current);
                initTimeoutRef.current = null;
              }
            } catch (error) {
              console.error('Error setting map instance:', error);
              setMapError('Unable to load map. Please refresh the page.');
            }
          }
        }}
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          errorTileUrl={ERROR_TILE_URL}
          eventHandlers={{
            tileerror: handleTileError,
          }}
        />
        
        {/* Render location markers */}
        {validLocations.map((location) => (
          <LocationMarker
            key={location.id}
            location={location}
            isSelected={location.id === selectedId}
            onMarkerClick={handleMarkerClick}
            labelPosition={labelPositions.get(location.id) || 'above'}
          />
        ))}
      </MapContainer>

      {/* Empty state message */}
      {locations.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/20 backdrop-blur-sm">
          <p className="text-sm text-white/70">No locations saved yet</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Card view */}
      <section className="rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-xl overflow-hidden min-h-[300px] md:min-h-[400px] w-full transition-all duration-500">
        {mapContent}
      </section>

      {/* Fullscreen view using portal */}
      <FullscreenPortal isOpen={isFullscreen} onClose={handleCloseClick} isTransitioning={isTransitioning}>
        {mapContent}
      </FullscreenPortal>
    </>
  );
}
