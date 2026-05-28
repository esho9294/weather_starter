import { useEffect, useRef } from 'react';
import type { Map as LeafletMap, LatLngBounds } from 'leaflet';
import L from 'leaflet';
import type { Location } from '../types';
import { validateCoordinates } from './mapUtils';

/**
 * Custom hook that manages map instance lifecycle and automatic bounds adjustment.
 * 
 * Responsibilities:
 * - Calculate bounds to fit all valid location pins with 50px padding
 * - Trigger fitBounds when locations array changes
 * - Debounce bounds updates to 500ms to avoid excessive re-renders
 * - Preserve map center and zoom during fullscreen transitions
 * - Filter out locations with invalid coordinates
 * 
 * @param mapInstance - The Leaflet map instance (can be null during initialization)
 * @param locations - Array of locations to display on the map
 * @param isFullscreen - Whether the map is currently in fullscreen mode
 */
export function useMapController(
  mapInstance: LeafletMap | null,
  locations: Location[],
  isFullscreen: boolean
): void {
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const previousFullscreenRef = useRef<boolean>(isFullscreen);
  const preservedStateRef = useRef<{
    center: L.LatLng | null;
    zoom: number | null;
  }>({
    center: null,
    zoom: null,
  });

  /**
   * Calculate bounds to fit all valid location pins.
   * Returns null if no valid locations exist.
   */
  const calculateBounds = (locs: Location[]): LatLngBounds | null => {
    if (locs.length === 0) return null;

    // Filter out locations with invalid coordinates
    const validLocations = locs.filter(validateCoordinates);

    if (validLocations.length === 0) return null;

    // Create bounds from valid location coordinates
    const bounds = L.latLngBounds(
      validLocations.map(loc => [loc.latitude, loc.longitude])
    );

    return bounds;
  };

  /**
   * Apply bounds to the map with padding and animation.
   */
  const applyBounds = (bounds: LatLngBounds) => {
    if (!mapInstance) return;

    mapInstance.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 15,
      animate: true,
      duration: 0.5,
    });
  };

  /**
   * Debounced bounds update to avoid excessive re-renders.
   */
  const debouncedFitBounds = (bounds: LatLngBounds) => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for 500ms debounce
    debounceTimerRef.current = setTimeout(() => {
      applyBounds(bounds);
      debounceTimerRef.current = null;
    }, 500);
  };

  // Effect: Preserve map state during fullscreen transitions
  useEffect(() => {
    if (!mapInstance) return;

    const wasFullscreen = previousFullscreenRef.current;
    const isNowFullscreen = isFullscreen;

    // Entering fullscreen: save current state
    if (!wasFullscreen && isNowFullscreen) {
      preservedStateRef.current = {
        center: mapInstance.getCenter(),
        zoom: mapInstance.getZoom(),
      };
    }

    // Exiting fullscreen: restore saved state
    if (wasFullscreen && !isNowFullscreen) {
      const { center, zoom } = preservedStateRef.current;
      if (center && zoom !== null) {
        mapInstance.setView(center, zoom, { animate: false });
      }
    }

    previousFullscreenRef.current = isFullscreen;
  }, [isFullscreen, mapInstance]);

  // Effect: Update bounds when locations change
  useEffect(() => {
    if (!mapInstance) return;

    const bounds = calculateBounds(locations);

    if (bounds) {
      debouncedFitBounds(bounds);
    }

    // Cleanup: clear debounce timer on unmount or when dependencies change
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [locations, mapInstance]);
}
