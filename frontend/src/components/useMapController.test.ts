import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useMapController } from './useMapController';
import type { Map as LeafletMap } from 'leaflet';
import type { Location } from '../types';

// Helper function to create a mock location
function createMockLocation(
  id: number,
  latitude: number,
  longitude: number
): Location {
  return {
    id,
    latitude,
    longitude,
    created_at: '2024-01-01T00:00:00Z',
    weather: {
      condition: 'Sunny',
      observed_at: '2024-01-01T00:00:00Z',
      source: 'test',
      area: 'Test Area',
      valid_period_text: 'Now',
      temperature_c: 25,
      humidity_percent: 70,
      rainfall_mm: 0,
      wind_speed_knots: 5,
      wind_direction_degrees: 180,
      forecast_low_c: 20,
      forecast_high_c: 30,
      uv_index: 5,
      psi_twenty_four_hourly: 50,
      pm25_one_hourly: 10,
      air_quality_region: 'central',
      forecast_periods: [],
      daily_forecast: [],
    },
  };
}

// Mock Leaflet map instance
function createMockMapInstance(): LeafletMap {
  return {
    fitBounds: vi.fn(),
    getCenter: vi.fn(() => ({ lat: 1.3521, lng: 103.8198 })),
    getZoom: vi.fn(() => 11),
    setView: vi.fn(),
  } as unknown as LeafletMap;
}

describe('useMapController', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.useFakeTimers();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('initialization', () => {
    it('does not throw error when mapInstance is null', () => {
      expect(() => {
        renderHook(() => useMapController(null, [], false));
      }).not.toThrow();
    });

    it('does not call fitBounds when mapInstance is null', () => {
      const locations = [createMockLocation(1, 1.3521, 103.8198)];
      renderHook(() => useMapController(null, locations, false));

      vi.advanceTimersByTime(500);

      // No error should occur since mapInstance is null
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('bounds calculation', () => {
    it('calculates bounds for single location', async () => {
      const mapInstance = createMockMapInstance();
      const locations = [createMockLocation(1, 1.3521, 103.8198)];

      renderHook(() => useMapController(mapInstance, locations, false));

      // Wait for debounce (500ms)
      vi.advanceTimersByTime(500);

      expect(mapInstance.fitBounds).toHaveBeenCalledWith(
        expect.objectContaining({
          _southWest: expect.objectContaining({
            lat: 1.3521,
            lng: 103.8198,
          }),
          _northEast: expect.objectContaining({
            lat: 1.3521,
            lng: 103.8198,
          }),
        }),
        {
          padding: [50, 50],
          maxZoom: 15,
          animate: true,
          duration: 0.5,
        }
      );
    });

    it('calculates bounds for multiple locations', async () => {
      const mapInstance = createMockMapInstance();
      const locations = [
        createMockLocation(1, 1.3521, 103.8198), // Singapore
        createMockLocation(2, 40.7128, -74.006), // New York
        createMockLocation(3, 51.5074, -0.1278), // London
      ];

      renderHook(() => useMapController(mapInstance, locations, false));

      // Wait for debounce (500ms)
      vi.advanceTimersByTime(500);

      expect(mapInstance.fitBounds).toHaveBeenCalledWith(
        expect.objectContaining({
          _southWest: expect.any(Object),
          _northEast: expect.any(Object),
        }),
        {
          padding: [50, 50],
          maxZoom: 15,
          animate: true,
          duration: 0.5,
        }
      );
    });

    it('does not call fitBounds for empty locations array', () => {
      const mapInstance = createMockMapInstance();
      const locations: Location[] = [];

      renderHook(() => useMapController(mapInstance, locations, false));

      // Wait for debounce (500ms)
      vi.advanceTimersByTime(500);

      expect(mapInstance.fitBounds).not.toHaveBeenCalled();
    });

    it('filters out locations with invalid coordinates', () => {
      const mapInstance = createMockMapInstance();
      const locations = [
        createMockLocation(1, 1.3521, 103.8198), // Valid
        createMockLocation(2, 100, 200), // Invalid - out of range
        createMockLocation(3, -95, 50), // Invalid - latitude out of range
      ];

      renderHook(() => useMapController(mapInstance, locations, false));

      // Wait for debounce (500ms)
      vi.advanceTimersByTime(500);

      // Should only fit bounds for the valid location
      expect(mapInstance.fitBounds).toHaveBeenCalledWith(
        expect.objectContaining({
          _southWest: expect.objectContaining({
            lat: 1.3521,
            lng: 103.8198,
          }),
          _northEast: expect.objectContaining({
            lat: 1.3521,
            lng: 103.8198,
          }),
        }),
        expect.any(Object)
      );

      // Should log errors for invalid coordinates
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
    });

    it('does not call fitBounds when all locations have invalid coordinates', () => {
      const mapInstance = createMockMapInstance();
      const locations = [
        createMockLocation(1, 100, 200), // Invalid
        createMockLocation(2, -95, 50), // Invalid
      ];

      renderHook(() => useMapController(mapInstance, locations, false));

      // Wait for debounce (500ms)
      vi.advanceTimersByTime(500);

      expect(mapInstance.fitBounds).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('debouncing', () => {
    it('debounces fitBounds calls to 500ms', () => {
      const mapInstance = createMockMapInstance();
      const locations = [createMockLocation(1, 1.3521, 103.8198)];

      renderHook(() => useMapController(mapInstance, locations, false));

      // Should not call fitBounds immediately
      expect(mapInstance.fitBounds).not.toHaveBeenCalled();

      // Should not call fitBounds before 500ms
      vi.advanceTimersByTime(400);
      expect(mapInstance.fitBounds).not.toHaveBeenCalled();

      // Should call fitBounds after 500ms
      vi.advanceTimersByTime(100);
      expect(mapInstance.fitBounds).toHaveBeenCalledTimes(1);
    });

    it('resets debounce timer when locations change', () => {
      const mapInstance = createMockMapInstance();
      const { rerender } = renderHook(
        ({ locs }) => useMapController(mapInstance, locs, false),
        {
          initialProps: {
            locs: [createMockLocation(1, 1.3521, 103.8198)],
          },
        }
      );

      // Advance time by 400ms
      vi.advanceTimersByTime(400);
      expect(mapInstance.fitBounds).not.toHaveBeenCalled();

      // Change locations (add a new one)
      rerender({
        locs: [
          createMockLocation(1, 1.3521, 103.8198),
          createMockLocation(2, 40.7128, -74.006),
        ],
      });

      // Advance time by 400ms (total 800ms from start, but only 400ms from rerender)
      vi.advanceTimersByTime(400);
      expect(mapInstance.fitBounds).not.toHaveBeenCalled();

      // Advance time by 100ms more (500ms from rerender)
      vi.advanceTimersByTime(100);
      expect(mapInstance.fitBounds).toHaveBeenCalledTimes(1);
    });

    it('clears debounce timer on unmount', () => {
      const mapInstance = createMockMapInstance();
      const locations = [createMockLocation(1, 1.3521, 103.8198)];

      const { unmount } = renderHook(() =>
        useMapController(mapInstance, locations, false)
      );

      // Advance time by 400ms
      vi.advanceTimersByTime(400);

      // Unmount before debounce completes
      unmount();

      // Advance time past debounce period
      vi.advanceTimersByTime(200);

      // Should not call fitBounds after unmount
      expect(mapInstance.fitBounds).not.toHaveBeenCalled();
    });
  });

  describe('fullscreen state preservation', () => {
    it('preserves center and zoom when entering fullscreen', () => {
      const mapInstance = createMockMapInstance();
      const locations = [createMockLocation(1, 1.3521, 103.8198)];

      const { rerender } = renderHook(
        ({ isFullscreen }) =>
          useMapController(mapInstance, locations, isFullscreen),
        {
          initialProps: { isFullscreen: false },
        }
      );

      // Enter fullscreen
      rerender({ isFullscreen: true });

      // Should have called getCenter and getZoom to preserve state
      expect(mapInstance.getCenter).toHaveBeenCalled();
      expect(mapInstance.getZoom).toHaveBeenCalled();
    });

    it('restores center and zoom when exiting fullscreen', () => {
      const mapInstance = createMockMapInstance();
      const locations = [createMockLocation(1, 1.3521, 103.8198)];

      const { rerender } = renderHook(
        ({ isFullscreen }) =>
          useMapController(mapInstance, locations, isFullscreen),
        {
          initialProps: { isFullscreen: false },
        }
      );

      // Enter fullscreen
      rerender({ isFullscreen: true });

      // Exit fullscreen
      rerender({ isFullscreen: false });

      // Should restore the preserved state
      expect(mapInstance.setView).toHaveBeenCalledWith(
        { lat: 1.3521, lng: 103.8198 },
        11,
        { animate: false }
      );
    });

    it('does not restore state when entering fullscreen', () => {
      const mapInstance = createMockMapInstance();
      const locations = [createMockLocation(1, 1.3521, 103.8198)];

      const { rerender } = renderHook(
        ({ isFullscreen }) =>
          useMapController(mapInstance, locations, isFullscreen),
        {
          initialProps: { isFullscreen: false },
        }
      );

      // Enter fullscreen
      rerender({ isFullscreen: true });

      // Should not call setView when entering fullscreen
      expect(mapInstance.setView).not.toHaveBeenCalled();
    });

    it('does not restore state when staying in same mode', () => {
      const mapInstance = createMockMapInstance();
      const locations = [createMockLocation(1, 1.3521, 103.8198)];

      const { rerender } = renderHook(
        ({ isFullscreen }) =>
          useMapController(mapInstance, locations, isFullscreen),
        {
          initialProps: { isFullscreen: false },
        }
      );

      // Stay in card mode
      rerender({ isFullscreen: false });

      // Should not call setView
      expect(mapInstance.setView).not.toHaveBeenCalled();
    });

    it('handles multiple fullscreen transitions', () => {
      const mapInstance = createMockMapInstance();
      const locations = [createMockLocation(1, 1.3521, 103.8198)];

      const { rerender } = renderHook(
        ({ isFullscreen }) =>
          useMapController(mapInstance, locations, isFullscreen),
        {
          initialProps: { isFullscreen: false },
        }
      );

      // First transition: enter fullscreen
      rerender({ isFullscreen: true });
      expect(mapInstance.getCenter).toHaveBeenCalledTimes(1);
      expect(mapInstance.getZoom).toHaveBeenCalledTimes(1);

      // First transition: exit fullscreen
      rerender({ isFullscreen: false });
      expect(mapInstance.setView).toHaveBeenCalledTimes(1);

      // Second transition: enter fullscreen again
      rerender({ isFullscreen: true });
      expect(mapInstance.getCenter).toHaveBeenCalledTimes(2);
      expect(mapInstance.getZoom).toHaveBeenCalledTimes(2);

      // Second transition: exit fullscreen again
      rerender({ isFullscreen: false });
      expect(mapInstance.setView).toHaveBeenCalledTimes(2);
    });
  });

  describe('location updates', () => {
    it('triggers fitBounds when locations are added', () => {
      const mapInstance = createMockMapInstance();

      const { rerender } = renderHook(
        ({ locs }) => useMapController(mapInstance, locs, false),
        {
          initialProps: {
            locs: [createMockLocation(1, 1.3521, 103.8198)],
          },
        }
      );

      // Wait for initial debounce
      vi.advanceTimersByTime(500);
      expect(mapInstance.fitBounds).toHaveBeenCalledTimes(1);

      // Add a new location
      rerender({
        locs: [
          createMockLocation(1, 1.3521, 103.8198),
          createMockLocation(2, 40.7128, -74.006),
        ],
      });

      // Wait for debounce
      vi.advanceTimersByTime(500);
      expect(mapInstance.fitBounds).toHaveBeenCalledTimes(2);
    });

    it('triggers fitBounds when locations are removed', () => {
      const mapInstance = createMockMapInstance();

      const { rerender } = renderHook(
        ({ locs }) => useMapController(mapInstance, locs, false),
        {
          initialProps: {
            locs: [
              createMockLocation(1, 1.3521, 103.8198),
              createMockLocation(2, 40.7128, -74.006),
            ],
          },
        }
      );

      // Wait for initial debounce
      vi.advanceTimersByTime(500);
      expect(mapInstance.fitBounds).toHaveBeenCalledTimes(1);

      // Remove a location
      rerender({
        locs: [createMockLocation(1, 1.3521, 103.8198)],
      });

      // Wait for debounce
      vi.advanceTimersByTime(500);
      expect(mapInstance.fitBounds).toHaveBeenCalledTimes(2);
    });

    it('does not call fitBounds when all locations are removed', () => {
      const mapInstance = createMockMapInstance();

      const { rerender } = renderHook(
        ({ locs }) => useMapController(mapInstance, locs, false),
        {
          initialProps: {
            locs: [createMockLocation(1, 1.3521, 103.8198)],
          },
        }
      );

      // Wait for initial debounce
      vi.advanceTimersByTime(500);
      expect(mapInstance.fitBounds).toHaveBeenCalledTimes(1);

      // Remove all locations
      rerender({ locs: [] });

      // Wait for debounce
      vi.advanceTimersByTime(500);

      // Should not call fitBounds again (still 1 call from initial)
      expect(mapInstance.fitBounds).toHaveBeenCalledTimes(1);
    });
  });

  describe('edge cases', () => {
    it('handles mapInstance becoming available after initialization', () => {
      const locations = [createMockLocation(1, 1.3521, 103.8198)];

      const { rerender } = renderHook(
        ({ map }) => useMapController(map, locations, false),
        {
          initialProps: { map: null as LeafletMap | null },
        }
      );

      // Wait for debounce with null map
      vi.advanceTimersByTime(500);

      // Now provide the map instance
      const mapInstance = createMockMapInstance();
      rerender({ map: mapInstance });

      // Wait for debounce
      vi.advanceTimersByTime(500);

      // Should call fitBounds now that map is available
      expect(mapInstance.fitBounds).toHaveBeenCalledTimes(1);
    });

    it('handles mapInstance becoming null', () => {
      const mapInstance = createMockMapInstance();
      const locations = [createMockLocation(1, 1.3521, 103.8198)];

      const { rerender } = renderHook(
        ({ map }) => useMapController(map, locations, false),
        {
          initialProps: { map: mapInstance as LeafletMap | null },
        }
      );

      // Wait for initial debounce
      vi.advanceTimersByTime(500);
      expect(mapInstance.fitBounds).toHaveBeenCalledTimes(1);

      // Map becomes null
      rerender({ map: null });

      // Change locations
      rerender({ map: null });

      // Wait for debounce
      vi.advanceTimersByTime(500);

      // Should not call fitBounds again (still 1 call from initial)
      expect(mapInstance.fitBounds).toHaveBeenCalledTimes(1);
    });

    it('handles rapid location changes with debouncing', () => {
      const mapInstance = createMockMapInstance();

      const { rerender } = renderHook(
        ({ locs }) => useMapController(mapInstance, locs, false),
        {
          initialProps: {
            locs: [createMockLocation(1, 1.3521, 103.8198)],
          },
        }
      );

      // Rapid changes
      vi.advanceTimersByTime(100);
      rerender({
        locs: [
          createMockLocation(1, 1.3521, 103.8198),
          createMockLocation(2, 40.7128, -74.006),
        ],
      });

      vi.advanceTimersByTime(100);
      rerender({
        locs: [
          createMockLocation(1, 1.3521, 103.8198),
          createMockLocation(2, 40.7128, -74.006),
          createMockLocation(3, 51.5074, -0.1278),
        ],
      });

      vi.advanceTimersByTime(100);
      rerender({
        locs: [
          createMockLocation(1, 1.3521, 103.8198),
          createMockLocation(2, 40.7128, -74.006),
          createMockLocation(3, 51.5074, -0.1278),
          createMockLocation(4, 35.6762, 139.6503),
        ],
      });

      // Should not have called fitBounds yet
      expect(mapInstance.fitBounds).not.toHaveBeenCalled();

      // Wait for debounce to complete
      vi.advanceTimersByTime(500);

      // Should only call fitBounds once after all rapid changes
      expect(mapInstance.fitBounds).toHaveBeenCalledTimes(1);
    });
  });
});
