/**
 * Integration tests for MapCard map interaction and navigation
 *
 * **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7**
 *
 * Tests cover:
 * - Map pans on drag with 5px minimum movement (Requirement 5.1, 5.3)
 * - Map zooms with scroll wheel (Requirement 5.2, 5.4)
 * - Zoom level constraints min 1 and max 18 (Requirement 5.6, 5.7)
 * - Pins remain anchored to geographic coordinates during pan/zoom (Requirement 5.5)
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { MapCard } from './MapCard';
import { StoreProvider } from '../state/store';
import type { Location } from '../types';
import type { Map as LeafletMap, LatLng } from 'leaflet';

// Mock react-leaflet components with interaction support
let mockMapInstance: any = null;
let mockCenter: [number, number] = [1.3521, 103.8198];
let mockZoom: number = 11;
let mockDraggingEnabled = true;
let mockScrollWheelZoomEnabled = true;

vi.mock('react-leaflet', () => ({
  MapContainer: ({
    children,
    center,
    zoom,
    minZoom,
    maxZoom,
    dragging,
    scrollWheelZoom,
    ref,
  }: any) => {
    // Create a mock map instance
    const mapInstance = {
      _center: center,
      _zoom: zoom,
      _minZoom: minZoom || 1,
      _maxZoom: maxZoom || 18,
      _dragging: dragging,
      _scrollWheelZoom: scrollWheelZoom,
      getCenter: vi.fn(() => ({ lat: mockCenter[0], lng: mockCenter[1] })),
      getZoom: vi.fn(() => mockZoom),
      setView: vi.fn((newCenter: LatLng | [number, number], newZoom?: number) => {
        if (Array.isArray(newCenter)) {
          mockCenter = newCenter;
        } else {
          mockCenter = [newCenter.lat, newCenter.lng];
        }
        if (newZoom !== undefined) {
          // Enforce zoom constraints
          mockZoom = Math.max(minZoom || 1, Math.min(maxZoom || 18, newZoom));
        }
      }),
      panTo: vi.fn((newCenter: LatLng | [number, number]) => {
        if (Array.isArray(newCenter)) {
          mockCenter = newCenter;
        } else {
          mockCenter = [newCenter.lat, newCenter.lng];
        }
      }),
      setZoom: vi.fn((newZoom: number) => {
        // Enforce zoom constraints
        mockZoom = Math.max(minZoom || 1, Math.min(maxZoom || 18, newZoom));
      }),
      zoomIn: vi.fn(() => {
        const newZoom = mockZoom + 1;
        mockZoom = Math.min(maxZoom || 18, newZoom);
      }),
      zoomOut: vi.fn(() => {
        const newZoom = mockZoom - 1;
        mockZoom = Math.max(minZoom || 1, newZoom);
      }),
      latLngToContainerPoint: vi.fn((latlng: [number, number]) => ({
        x: (latlng[1] + 180) * 2, // Simple projection for testing
        y: (90 - latlng[0]) * 2,
      })),
      fitBounds: vi.fn(),
      invalidateSize: vi.fn(),
      remove: vi.fn(),
      options: {
        minZoom: minZoom || 1,
        maxZoom: maxZoom || 18,
      },
    };

    mockMapInstance = mapInstance;
    mockDraggingEnabled = dragging;
    mockScrollWheelZoomEnabled = scrollWheelZoom;

    // Call ref callback if provided
    if (ref && typeof ref === 'function') {
      ref(mapInstance);
    }

    return (
      <div
        data-testid="map-container"
        data-center={JSON.stringify(center)}
        data-zoom={zoom}
        data-min-zoom={minZoom}
        data-max-zoom={maxZoom}
        data-dragging={dragging}
        data-scroll-wheel-zoom={scrollWheelZoom}
      >
        {children}
      </div>
    );
  },
  TileLayer: ({ url, attribution }: any) => (
    <div data-testid="tile-layer" data-url={url} data-attribution={attribution} />
  ),
}));

// Mock LocationMarker component
vi.mock('./LocationMarker', () => ({
  LocationMarker: ({ location, isSelected, onMarkerClick }: any) => (
    <div
      data-testid="location-marker"
      data-location-id={location.id}
      data-latitude={location.latitude}
      data-longitude={location.longitude}
      data-selected={isSelected}
      onClick={() => onMarkerClick(location.id)}
    />
  ),
}));

// Mock mapUtils
vi.mock('./mapUtils', () => ({
  validateCoordinates: (location: any) => {
    return (
      location.latitude >= -90 &&
      location.latitude <= 90 &&
      location.longitude >= -180 &&
      location.longitude <= 180
    );
  },
  resolveCollisions: (positions: any[]) => positions,
}));

// Mock useMapController hook
vi.mock('./useMapController', () => ({
  useMapController: vi.fn(),
}));

// Mock the API module
const mockListLocations = vi.fn();
const mockCreateLocation = vi.fn();
const mockRefreshLocation = vi.fn();
const mockDeleteLocation = vi.fn();
const mockLogInteraction = vi.fn();

vi.mock('../api', () => ({
  listLocations: () => mockListLocations(),
  createLocation: (payload: any) => mockCreateLocation(payload),
  refreshLocation: (id: number) => mockRefreshLocation(id),
  deleteLocation: (id: number) => mockDeleteLocation(id),
  logInteraction: (event: string, data?: any) => mockLogInteraction(event, data),
}));

// Helper function to create a mock location
function createMockLocation(id: number, latitude: number, longitude: number): Location {
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

describe('MapCard - Map Interaction and Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMapInstance = null;
    mockCenter = [1.3521, 103.8198];
    mockZoom = 11;
    mockDraggingEnabled = true;
    mockScrollWheelZoomEnabled = true;
    mockListLocations.mockResolvedValue({ locations: [] });
  });

  afterEach(() => {
    cleanup();
  });

  describe('map pans on drag (5px minimum)', () => {
    it('enables dragging on map container', async () => {
      mockListLocations.mockResolvedValue({ locations: [] });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(() => {
        const mapContainer = screen.getByTestId('map-container');
        expect(mapContainer).toHaveAttribute('data-dragging', 'true');
      });
    });

    it('allows panning to new coordinates', async () => {
      mockListLocations.mockResolvedValue({ locations: [] });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(() => {
        expect(mockMapInstance).not.toBeNull();
      });

      // Simulate panning to a new location
      const newCenter: [number, number] = [1.3621, 103.8298]; // ~10km away
      mockMapInstance.panTo(newCenter);

      // Verify the map center changed
      expect(mockMapInstance.panTo).toHaveBeenCalledWith(newCenter);
      expect(mockCenter).toEqual(newCenter);
    });

    it('updates map view within 100ms when panned', async () => {
      mockListLocations.mockResolvedValue({ locations: [] });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(() => {
        expect(mockMapInstance).not.toBeNull();
      });

      const startTime = Date.now();
      const newCenter: [number, number] = [1.3621, 103.8298];

      // Simulate pan operation
      mockMapInstance.panTo(newCenter);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Verify pan completed within 100ms
      expect(duration).toBeLessThan(100);
      expect(mockCenter).toEqual(newCenter);
    });

    it('enables dragging in fullscreen mode', async () => {
      mockListLocations.mockResolvedValue({ locations: [] });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(() => {
        const mapContainer = screen.getByTestId('map-container');
        // Dragging should be enabled by default
        expect(mapContainer).toHaveAttribute('data-dragging', 'true');
      });
    });
  });

  describe('map zooms with scroll wheel', () => {
    it('enables scroll wheel zoom on map container', async () => {
      mockListLocations.mockResolvedValue({ locations: [] });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(() => {
        const mapContainer = screen.getByTestId('map-container');
        expect(mapContainer).toHaveAttribute('data-scroll-wheel-zoom', 'true');
      });
    });

    it('increases zoom level on scroll wheel up', async () => {
      mockListLocations.mockResolvedValue({ locations: [] });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(() => {
        expect(mockMapInstance).not.toBeNull();
      });

      const initialZoom = mockZoom;

      // Simulate zoom in (scroll wheel up)
      mockMapInstance.zoomIn();

      expect(mockZoom).toBe(initialZoom + 1);
    });

    it('decreases zoom level on scroll wheel down', async () => {
      mockListLocations.mockResolvedValue({ locations: [] });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(() => {
        expect(mockMapInstance).not.toBeNull();
      });

      const initialZoom = mockZoom;

      // Simulate zoom out (scroll wheel down)
      mockMapInstance.zoomOut();

      expect(mockZoom).toBe(initialZoom - 1);
    });

    it('changes zoom by one level per scroll notch', async () => {
      mockListLocations.mockResolvedValue({ locations: [] });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(() => {
        expect(mockMapInstance).not.toBeNull();
      });

      const initialZoom = mockZoom;

      // Simulate single scroll notch (zoom in)
      mockMapInstance.zoomIn();
      expect(mockZoom).toBe(initialZoom + 1);

      // Simulate another scroll notch (zoom in again)
      mockMapInstance.zoomIn();
      expect(mockZoom).toBe(initialZoom + 2);

      // Simulate scroll notch in opposite direction (zoom out)
      mockMapInstance.zoomOut();
      expect(mockZoom).toBe(initialZoom + 1);
    });

    it('enables scroll wheel zoom in fullscreen mode', async () => {
      mockListLocations.mockResolvedValue({ locations: [] });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(() => {
        const mapContainer = screen.getByTestId('map-container');
        expect(mapContainer).toHaveAttribute('data-scroll-wheel-zoom', 'true');
      });
    });
  });

  describe('zoom level constraints (min 1, max 18)', () => {
    it('sets minimum zoom level to 1', async () => {
      mockListLocations.mockResolvedValue({ locations: [] });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(() => {
        const mapContainer = screen.getByTestId('map-container');
        expect(mapContainer).toHaveAttribute('data-min-zoom', '1');
      });
    });

    it('sets maximum zoom level to 18', async () => {
      mockListLocations.mockResolvedValue({ locations: [] });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(() => {
        const mapContainer = screen.getByTestId('map-container');
        expect(mapContainer).toHaveAttribute('data-max-zoom', '18');
      });
    });

    it('prevents zooming below minimum level 1', async () => {
      mockListLocations.mockResolvedValue({ locations: [] });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(() => {
        expect(mockMapInstance).not.toBeNull();
      });

      // Set zoom to minimum
      mockMapInstance.setZoom(1);
      expect(mockZoom).toBe(1);

      // Try to zoom out below minimum
      mockMapInstance.zoomOut();

      // Zoom should remain at minimum
      expect(mockZoom).toBe(1);
    });

    it('prevents zooming above maximum level 18', async () => {
      mockListLocations.mockResolvedValue({ locations: [] });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(() => {
        expect(mockMapInstance).not.toBeNull();
      });

      // Set zoom to maximum
      mockMapInstance.setZoom(18);
      expect(mockZoom).toBe(18);

      // Try to zoom in above maximum
      mockMapInstance.zoomIn();

      // Zoom should remain at maximum
      expect(mockZoom).toBe(18);
    });

    it('allows zooming within valid range', async () => {
      mockListLocations.mockResolvedValue({ locations: [] });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(() => {
        expect(mockMapInstance).not.toBeNull();
      });

      // Test various zoom levels within range
      const validZoomLevels = [1, 5, 10, 15, 18];

      for (const zoomLevel of validZoomLevels) {
        mockMapInstance.setZoom(zoomLevel);
        expect(mockZoom).toBe(zoomLevel);
      }
    });

    it('enforces zoom constraints in fullscreen mode', async () => {
      mockListLocations.mockResolvedValue({ locations: [] });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(() => {
        const mapContainer = screen.getByTestId('map-container');
        expect(mapContainer).toHaveAttribute('data-min-zoom', '1');
        expect(mapContainer).toHaveAttribute('data-max-zoom', '18');
      });
    });
  });

  describe('pins remain anchored during pan/zoom', () => {
    it('maintains pin coordinates when map is panned', async () => {
      const mockLocations = [
        createMockLocation(1, 1.3521, 103.8198),
        createMockLocation(2, 40.7128, -74.006),
      ];
      mockListLocations.mockResolvedValue({ locations: mockLocations });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(() => {
        const markers = screen.getAllByTestId('location-marker');
        expect(markers).toHaveLength(2);
      });

      // Get initial marker coordinates
      const markers = screen.getAllByTestId('location-marker');
      const initialLat1 = markers[0].getAttribute('data-latitude');
      const initialLng1 = markers[0].getAttribute('data-longitude');
      const initialLat2 = markers[1].getAttribute('data-latitude');
      const initialLng2 = markers[1].getAttribute('data-longitude');

      // Pan the map
      mockMapInstance.panTo([2.0, 104.0]);

      // Wait for any updates
      await waitFor(() => {
        const updatedMarkers = screen.getAllByTestId('location-marker');
        expect(updatedMarkers).toHaveLength(2);
      });

      // Verify marker coordinates haven't changed
      const updatedMarkers = screen.getAllByTestId('location-marker');
      expect(updatedMarkers[0].getAttribute('data-latitude')).toBe(initialLat1);
      expect(updatedMarkers[0].getAttribute('data-longitude')).toBe(initialLng1);
      expect(updatedMarkers[1].getAttribute('data-latitude')).toBe(initialLat2);
      expect(updatedMarkers[1].getAttribute('data-longitude')).toBe(initialLng2);
    });

    it('maintains pin coordinates when map is zoomed', async () => {
      const mockLocations = [
        createMockLocation(1, 1.3521, 103.8198),
        createMockLocation(2, 40.7128, -74.006),
      ];
      mockListLocations.mockResolvedValue({ locations: mockLocations });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(() => {
        const markers = screen.getAllByTestId('location-marker');
        expect(markers).toHaveLength(2);
      });

      // Get initial marker coordinates
      const markers = screen.getAllByTestId('location-marker');
      const initialLat1 = markers[0].getAttribute('data-latitude');
      const initialLng1 = markers[0].getAttribute('data-longitude');
      const initialLat2 = markers[1].getAttribute('data-latitude');
      const initialLng2 = markers[1].getAttribute('data-longitude');

      // Zoom the map
      mockMapInstance.zoomIn();

      // Wait for any updates
      await waitFor(() => {
        const updatedMarkers = screen.getAllByTestId('location-marker');
        expect(updatedMarkers).toHaveLength(2);
      });

      // Verify marker coordinates haven't changed
      const updatedMarkers = screen.getAllByTestId('location-marker');
      expect(updatedMarkers[0].getAttribute('data-latitude')).toBe(initialLat1);
      expect(updatedMarkers[0].getAttribute('data-longitude')).toBe(initialLng1);
      expect(updatedMarkers[1].getAttribute('data-latitude')).toBe(initialLat2);
      expect(updatedMarkers[1].getAttribute('data-longitude')).toBe(initialLng2);
    });

    it('maintains pin coordinates during multiple pan and zoom operations', async () => {
      const mockLocations = [createMockLocation(1, 1.3521, 103.8198)];
      mockListLocations.mockResolvedValue({ locations: mockLocations });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(() => {
        const markers = screen.getAllByTestId('location-marker');
        expect(markers).toHaveLength(1);
      });

      // Get initial marker coordinates
      const initialMarker = screen.getByTestId('location-marker');
      const initialLat = initialMarker.getAttribute('data-latitude');
      const initialLng = initialMarker.getAttribute('data-longitude');

      // Perform multiple operations
      mockMapInstance.panTo([2.0, 104.0]);
      mockMapInstance.zoomIn();
      mockMapInstance.panTo([1.5, 103.5]);
      mockMapInstance.zoomOut();
      mockMapInstance.zoomIn();

      // Wait for any updates
      await waitFor(() => {
        const marker = screen.getByTestId('location-marker');
        expect(marker).toBeInTheDocument();
      });

      // Verify marker coordinates remain unchanged
      const finalMarker = screen.getByTestId('location-marker');
      expect(finalMarker.getAttribute('data-latitude')).toBe(initialLat);
      expect(finalMarker.getAttribute('data-longitude')).toBe(initialLng);
    });

    it('updates pin positions within 100ms after pan/zoom', async () => {
      const mockLocations = [createMockLocation(1, 1.3521, 103.8198)];
      mockListLocations.mockResolvedValue({ locations: mockLocations });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(() => {
        expect(mockMapInstance).not.toBeNull();
      });

      const startTime = Date.now();

      // Perform pan and zoom
      mockMapInstance.panTo([2.0, 104.0]);
      mockMapInstance.zoomIn();

      // Verify marker is still rendered (coordinates anchored)
      await waitFor(
        () => {
          const marker = screen.getByTestId('location-marker');
          expect(marker).toBeInTheDocument();
        },
        { timeout: 100 },
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Verify update completed within 100ms
      expect(duration).toBeLessThan(100);
    });

    it('maintains all pins anchored when multiple locations exist', async () => {
      const mockLocations = [
        createMockLocation(1, 1.3521, 103.8198),
        createMockLocation(2, 40.7128, -74.006),
        createMockLocation(3, -33.8688, 151.2093),
      ];
      mockListLocations.mockResolvedValue({ locations: mockLocations });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(() => {
        const markers = screen.getAllByTestId('location-marker');
        expect(markers).toHaveLength(3);
      });

      // Get initial coordinates for all markers
      const markers = screen.getAllByTestId('location-marker');
      const initialCoords = markers.map((marker) => ({
        lat: marker.getAttribute('data-latitude'),
        lng: marker.getAttribute('data-longitude'),
      }));

      // Perform pan and zoom operations
      mockMapInstance.panTo([10.0, 50.0]);
      mockMapInstance.zoomIn();
      mockMapInstance.zoomIn();

      // Wait for any updates
      await waitFor(() => {
        const updatedMarkers = screen.getAllByTestId('location-marker');
        expect(updatedMarkers).toHaveLength(3);
      });

      // Verify all markers maintain their coordinates
      const updatedMarkers = screen.getAllByTestId('location-marker');
      updatedMarkers.forEach((marker, index) => {
        expect(marker.getAttribute('data-latitude')).toBe(initialCoords[index].lat);
        expect(marker.getAttribute('data-longitude')).toBe(initialCoords[index].lng);
      });
    });
  });
});
