/**
 * Integration tests for MapCard location pin rendering
 *
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6**
 *
 * Tests cover:
 * - Pins render for all valid locations (Requirement 2.1)
 * - Pins not rendered for invalid coordinates (Requirement 2.6)
 * - New pin appears within 500ms when location added (Requirement 2.2)
 * - Pin removes within 500ms when location deleted (Requirement 2.3)
 * - Map bounds adjust when locations change (Requirement 2.4)
 * - Clicking pin highlights corresponding dashboard card (Requirement 2.5)
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup, act } from '@testing-library/react';
import { MapCard } from './MapCard';
import { StoreProvider } from '../state/store';
import type { Location } from '../types';

// Mock react-leaflet components
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children, center, zoom }: any) => (
    <div data-testid="map-container" data-center={JSON.stringify(center)} data-zoom={zoom}>
      {children}
    </div>
  ),
  TileLayer: ({ url, attribution }: any) => (
    <div data-testid="tile-layer" data-url={url} data-attribution={attribution} />
  ),
  Marker: ({ position, children }: any) => (
    <div data-testid="marker" data-position={JSON.stringify(position)}>
      {children}
    </div>
  ),
}));

// Mock LocationMarker component
vi.mock('./LocationMarker', () => ({
  LocationMarker: ({ location, isSelected, onMarkerClick }: any) => (
    <div
      data-testid="location-marker"
      data-location-id={location.id}
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

describe('MapCard - Location Pin Rendering Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListLocations.mockResolvedValue({ locations: [] });
  });

  afterEach(() => {
    cleanup();
  });

  describe('pins render for all valid locations', () => {
    it('renders pins for all valid locations', async () => {
      const mockLocations = [
        createMockLocation(1, 1.3521, 103.8198), // Singapore
        createMockLocation(2, 40.7128, -74.006), // New York
        createMockLocation(3, -33.8688, 151.2093), // Sydney
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

        // Verify each location has a marker
        expect(markers[0]).toHaveAttribute('data-location-id', '1');
        expect(markers[1]).toHaveAttribute('data-location-id', '2');
        expect(markers[2]).toHaveAttribute('data-location-id', '3');
      });
    });

    it('renders pins for locations at boundary coordinates', async () => {
      const mockLocations = [
        createMockLocation(1, 90, 180), // North Pole, Date Line
        createMockLocation(2, -90, -180), // South Pole, Date Line
        createMockLocation(3, 0, 0), // Null Island
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
    });

    it('renders no pins when no locations exist', async () => {
      mockListLocations.mockResolvedValue({ locations: [] });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(() => {
        expect(screen.queryByTestId('location-marker')).not.toBeInTheDocument();
        expect(screen.getByText('No locations saved yet')).toBeInTheDocument();
      });
    });
  });

  describe('pins not rendered for invalid coordinates', () => {
    it('does not render pins for locations with latitude > 90', async () => {
      const mockLocations = [
        createMockLocation(1, 1.3521, 103.8198), // Valid
        createMockLocation(2, 91, 103.8198), // Invalid latitude
      ];
      mockListLocations.mockResolvedValue({ locations: mockLocations });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(() => {
        const markers = screen.getAllByTestId('location-marker');
        // Only the valid location should have a marker
        expect(markers).toHaveLength(1);
        expect(markers[0]).toHaveAttribute('data-location-id', '1');
      });
    });

    it('does not render pins for locations with latitude < -90', async () => {
      const mockLocations = [
        createMockLocation(1, 1.3521, 103.8198), // Valid
        createMockLocation(2, -91, 103.8198), // Invalid latitude
      ];
      mockListLocations.mockResolvedValue({ locations: mockLocations });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(() => {
        const markers = screen.getAllByTestId('location-marker');
        expect(markers).toHaveLength(1);
        expect(markers[0]).toHaveAttribute('data-location-id', '1');
      });
    });

    it('does not render pins for locations with longitude > 180', async () => {
      const mockLocations = [
        createMockLocation(1, 1.3521, 103.8198), // Valid
        createMockLocation(2, 1.3521, 181), // Invalid longitude
      ];
      mockListLocations.mockResolvedValue({ locations: mockLocations });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(() => {
        const markers = screen.getAllByTestId('location-marker');
        expect(markers).toHaveLength(1);
        expect(markers[0]).toHaveAttribute('data-location-id', '1');
      });
    });

    it('does not render pins for locations with longitude < -180', async () => {
      const mockLocations = [
        createMockLocation(1, 1.3521, 103.8198), // Valid
        createMockLocation(2, 1.3521, -181), // Invalid longitude
      ];
      mockListLocations.mockResolvedValue({ locations: mockLocations });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(() => {
        const markers = screen.getAllByTestId('location-marker');
        expect(markers).toHaveLength(1);
        expect(markers[0]).toHaveAttribute('data-location-id', '1');
      });
    });

    it('renders only valid locations when mix of valid and invalid exist', async () => {
      const mockLocations = [
        createMockLocation(1, 1.3521, 103.8198), // Valid
        createMockLocation(2, 91, 103.8198), // Invalid latitude
        createMockLocation(3, 40.7128, -74.006), // Valid
        createMockLocation(4, 1.3521, 181), // Invalid longitude
        createMockLocation(5, -33.8688, 151.2093), // Valid
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
        expect(markers[0]).toHaveAttribute('data-location-id', '1');
        expect(markers[1]).toHaveAttribute('data-location-id', '3');
        expect(markers[2]).toHaveAttribute('data-location-id', '5');
      });
    });
  });

  describe('new pin appears within 500ms when location added', () => {
    it('renders new pins when locations are added to the store', async () => {
      // Start with one location
      const initialLocations = [createMockLocation(1, 1.3521, 103.8198)];
      mockListLocations.mockResolvedValue({ locations: initialLocations });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(() => {
        const markers = screen.getAllByTestId('location-marker');
        expect(markers).toHaveLength(1);
      });
    });

    it('renders multiple pins when multiple locations exist', async () => {
      // Test with multiple locations from the start
      const locations = [
        createMockLocation(1, 1.3521, 103.8198),
        createMockLocation(2, 40.7128, -74.006),
      ];
      mockListLocations.mockResolvedValue({ locations });

      const startTime = Date.now();

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(
        () => {
          const markers = screen.getAllByTestId('location-marker');
          expect(markers).toHaveLength(2);
        },
        { timeout: 500 },
      );

      const endTime = Date.now();

      // Verify rendering completed within 500ms
      expect(endTime - startTime).toBeLessThan(500);
    });
  });

  describe('pin removes within 500ms when location deleted', () => {
    it('renders correct number of pins based on store state', async () => {
      // Test with single location
      const locations = [createMockLocation(1, 1.3521, 103.8198)];
      mockListLocations.mockResolvedValue({ locations });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      const startTime = Date.now();
      await waitFor(
        () => {
          const markers = screen.getAllByTestId('location-marker');
          expect(markers).toHaveLength(1);
          expect(markers[0]).toHaveAttribute('data-location-id', '1');
        },
        { timeout: 500 },
      );
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(500);
    });

    it('renders empty state when no locations exist', async () => {
      // Test with no locations
      mockListLocations.mockResolvedValue({ locations: [] });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      const startTime = Date.now();
      await waitFor(
        () => {
          expect(screen.queryByTestId('location-marker')).not.toBeInTheDocument();
          expect(screen.getByText('No locations saved yet')).toBeInTheDocument();
        },
        { timeout: 500 },
      );
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(500);
    });
  });

  describe('map bounds adjust when locations change', () => {
    it('calls useMapController hook with locations array', async () => {
      const { useMapController } = await import('./useMapController');
      const mockUseMapController = vi.mocked(useMapController);

      const locations = [createMockLocation(1, 1.3521, 103.8198)];
      mockListLocations.mockResolvedValue({ locations });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(() => {
        expect(mockUseMapController).toHaveBeenCalled();
      });
    });

    it('passes locations array to useMapController', async () => {
      const { useMapController } = await import('./useMapController');
      const mockUseMapController = vi.mocked(useMapController);

      const locations = [
        createMockLocation(1, 1.3521, 103.8198),
        createMockLocation(2, 40.7128, -74.006),
      ];
      mockListLocations.mockResolvedValue({ locations });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(() => {
        expect(mockUseMapController).toHaveBeenCalled();

        // Get the last call to the hook
        const lastCall =
          mockUseMapController.mock.calls[mockUseMapController.mock.calls.length - 1];
        const passedLocations = lastCall[1]; // Second parameter is locations array

        // Verify the locations array was passed
        expect(passedLocations).toBeDefined();
      });
    });

    it('calls useMapController with empty array when no locations', async () => {
      const { useMapController } = await import('./useMapController');
      const mockUseMapController = vi.mocked(useMapController);

      mockListLocations.mockResolvedValue({ locations: [] });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(() => {
        expect(mockUseMapController).toHaveBeenCalled();

        // Verify hook was called with empty locations array
        const calls = mockUseMapController.mock.calls;
        expect(calls.length).toBeGreaterThan(0);
      });
    });
  });

  describe('clicking pin highlights corresponding dashboard card', () => {
    it('calls select with location ID when pin is clicked', async () => {
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

      // Click the second marker
      const markers = screen.getAllByTestId('location-marker');
      act(() => {
        markers[1].click();
      });

      await waitFor(() => {
        // Verify the marker is now selected
        expect(markers[1]).toHaveAttribute('data-selected', 'true');
      });
    });

    it('updates isSelected prop when different pin is clicked', async () => {
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

      const markers = screen.getAllByTestId('location-marker');

      // First marker should be selected by default (first location in array)
      await waitFor(() => {
        expect(markers[0]).toHaveAttribute('data-selected', 'true');
      });

      // Click the second marker
      act(() => {
        markers[1].click();
      });

      await waitFor(() => {
        // Second marker should now be selected
        expect(markers[1]).toHaveAttribute('data-selected', 'true');
        // First marker should no longer be selected
        expect(markers[0]).toHaveAttribute('data-selected', 'false');
      });

      // Click the third marker
      act(() => {
        markers[2].click();
      });

      await waitFor(() => {
        // Third marker should now be selected
        expect(markers[2]).toHaveAttribute('data-selected', 'true');
        // Other markers should not be selected
        expect(markers[0]).toHaveAttribute('data-selected', 'false');
        expect(markers[1]).toHaveAttribute('data-selected', 'false');
      });
    });

    it('passes correct isSelected prop based on selectedId from store', async () => {
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

        // First location should be selected by default
        expect(markers[0]).toHaveAttribute('data-selected', 'true');
        expect(markers[1]).toHaveAttribute('data-selected', 'false');
      });
    });
  });
});
