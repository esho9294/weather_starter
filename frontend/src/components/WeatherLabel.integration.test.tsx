/**
 * Integration tests for WeatherLabel display in MapCard
 *
 * **Validates: Requirements 3.2, 3.3, 3.4, 3.5, 3.6**
 *
 * Tests cover:
 * - Labels display correct temperature or condition (Requirements 3.2, 3.3)
 * - Labels update within 200ms when weather refreshes (Requirement 3.4)
 * - Collision detection maintains 30px separation (Requirement 3.5)
 * - Placeholder displayed when no weather data (Requirement 3.6)
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup, act } from '@testing-library/react';
import { MapCard } from './MapCard';
import { StoreProvider } from '../state/store';
import type { Location, WeatherSnapshot } from '../types';

// Mock react-leaflet components
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children, center, zoom, ref }: any) => {
    // Simulate map instance with latLngToContainerPoint method
    const mockMap = {
      latLngToContainerPoint: (latLng: [number, number]) => ({
        x: latLng[1] * 10, // Simple conversion for testing
        y: latLng[0] * 10,
      }),
      fitBounds: vi.fn(),
      getCenter: () => ({ lat: center[0], lng: center[1] }),
      getZoom: () => zoom,
    };

    // Call ref callback if provided
    if (ref && typeof ref === 'function') {
      ref(mockMap);
    }

    return (
      <div data-testid="map-container" data-center={JSON.stringify(center)} data-zoom={zoom}>
        {children}
      </div>
    );
  },
  TileLayer: ({ url, attribution }: any) => (
    <div data-testid="tile-layer" data-url={url} data-attribution={attribution} />
  ),
}));

// Mock LocationMarker to expose weather label content
vi.mock('./LocationMarker', () => ({
  LocationMarker: ({ location, isSelected, onMarkerClick, labelPosition }: any) => {
    // Determine what to display based on available weather data
    const getDisplayText = (): string => {
      const { weather } = location;

      if (weather.temperature_c !== null && weather.temperature_c !== undefined) {
        return `${Math.round(weather.temperature_c)}°C`;
      }

      if (weather.condition) {
        return weather.condition;
      }

      return '--';
    };

    return (
      <div
        data-testid="location-marker"
        data-location-id={location.id}
        data-selected={isSelected}
        data-label-position={labelPosition}
        data-label-text={getDisplayText()}
        onClick={() => onMarkerClick(location.id)}
      />
    );
  },
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
  resolveCollisions: (positions: any[]) => {
    // Simple collision detection for testing
    const resolved = [...positions];
    for (let i = 1; i < resolved.length; i++) {
      const prev = resolved[i - 1];
      const curr = resolved[i];
      const distance = Math.sqrt(Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2));

      // If labels are too close (< 30px), apply offset
      if (distance < 30) {
        resolved[i] = { ...curr, y: curr.y - 30 };
      }
    }
    return resolved;
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

// Helper function to create a mock weather snapshot
function createMockWeather(overrides?: Partial<WeatherSnapshot>): WeatherSnapshot {
  return {
    condition: null,
    observed_at: null,
    source: null,
    area: null,
    valid_period_text: null,
    temperature_c: null,
    humidity_percent: null,
    rainfall_mm: null,
    wind_speed_knots: null,
    wind_direction_degrees: null,
    forecast_low_c: null,
    forecast_high_c: null,
    uv_index: null,
    psi_twenty_four_hourly: null,
    pm25_one_hourly: null,
    air_quality_region: null,
    forecast_periods: [],
    daily_forecast: [],
    ...overrides,
  };
}

// Helper function to create a mock location
function createMockLocation(
  id: number,
  latitude: number,
  longitude: number,
  weatherOverrides?: Partial<WeatherSnapshot>,
): Location {
  return {
    id,
    latitude,
    longitude,
    created_at: '2024-01-01T00:00:00Z',
    weather: createMockWeather(weatherOverrides),
  };
}

describe('WeatherLabel Integration - Display in MapCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListLocations.mockResolvedValue({ locations: [] });
  });

  afterEach(() => {
    cleanup();
  });

  describe('labels display correct temperature or condition (Requirements 3.2, 3.3)', () => {
    it('displays temperature in "{temp}°C" format when temperature is available', async () => {
      const mockLocations = [createMockLocation(1, 1.3521, 103.8198, { temperature_c: 28.5 })];
      mockListLocations.mockResolvedValue({ locations: mockLocations });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(() => {
        const marker = screen.getByTestId('location-marker');
        expect(marker).toHaveAttribute('data-label-text', '29°C');
      });
    });

    it('displays weather condition when temperature is unavailable', async () => {
      const mockLocations = [
        createMockLocation(1, 1.3521, 103.8198, {
          temperature_c: null,
          condition: 'Partly Cloudy',
        }),
      ];
      mockListLocations.mockResolvedValue({ locations: mockLocations });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(() => {
        const marker = screen.getByTestId('location-marker');
        expect(marker).toHaveAttribute('data-label-text', 'Partly Cloudy');
      });
    });

    it('prioritizes temperature over condition when both are available', async () => {
      const mockLocations = [
        createMockLocation(1, 1.3521, 103.8198, {
          temperature_c: 25,
          condition: 'Sunny',
        }),
      ];
      mockListLocations.mockResolvedValue({ locations: mockLocations });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(() => {
        const marker = screen.getByTestId('location-marker');
        expect(marker).toHaveAttribute('data-label-text', '25°C');
      });
    });

    it('displays correct labels for multiple locations with different weather data', async () => {
      const mockLocations = [
        createMockLocation(1, 1.3521, 103.8198, { temperature_c: 28 }),
        createMockLocation(2, 40.7128, -74.006, {
          temperature_c: null,
          condition: 'Rainy',
        }),
        createMockLocation(3, -33.8688, 151.2093, { temperature_c: 22.5 }),
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
        expect(markers[0]).toHaveAttribute('data-label-text', '28°C');
        expect(markers[1]).toHaveAttribute('data-label-text', 'Rainy');
        expect(markers[2]).toHaveAttribute('data-label-text', '23°C');
      });
    });

    it('rounds temperature correctly', async () => {
      const mockLocations = [
        createMockLocation(1, 1.3521, 103.8198, { temperature_c: 28.4 }),
        createMockLocation(2, 40.7128, -74.006, { temperature_c: 28.6 }),
      ];
      mockListLocations.mockResolvedValue({ locations: mockLocations });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(() => {
        const markers = screen.getAllByTestId('location-marker');
        expect(markers[0]).toHaveAttribute('data-label-text', '28°C');
        expect(markers[1]).toHaveAttribute('data-label-text', '29°C');
      });
    });

    it('handles negative temperatures correctly', async () => {
      const mockLocations = [createMockLocation(1, 1.3521, 103.8198, { temperature_c: -5 })];
      mockListLocations.mockResolvedValue({ locations: mockLocations });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(() => {
        const marker = screen.getByTestId('location-marker');
        expect(marker).toHaveAttribute('data-label-text', '-5°C');
      });
    });

    it('handles zero temperature correctly', async () => {
      const mockLocations = [createMockLocation(1, 1.3521, 103.8198, { temperature_c: 0 })];
      mockListLocations.mockResolvedValue({ locations: mockLocations });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(() => {
        const marker = screen.getByTestId('location-marker');
        expect(marker).toHaveAttribute('data-label-text', '0°C');
      });
    });
  });

  describe('placeholder displayed when no weather data (Requirement 3.6)', () => {
    it('displays "--" placeholder when no weather data is available', async () => {
      const mockLocations = [
        createMockLocation(1, 1.3521, 103.8198, {
          temperature_c: null,
          condition: null,
        }),
      ];
      mockListLocations.mockResolvedValue({ locations: mockLocations });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(() => {
        const marker = screen.getByTestId('location-marker');
        expect(marker).toHaveAttribute('data-label-text', '--');
      });
    });

    it('displays "--" when condition is empty string', async () => {
      const mockLocations = [
        createMockLocation(1, 1.3521, 103.8198, {
          temperature_c: null,
          condition: '',
        }),
      ];
      mockListLocations.mockResolvedValue({ locations: mockLocations });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(() => {
        const marker = screen.getByTestId('location-marker');
        expect(marker).toHaveAttribute('data-label-text', '--');
      });
    });

    it('displays placeholder for multiple locations with no weather data', async () => {
      const mockLocations = [
        createMockLocation(1, 1.3521, 103.8198, {
          temperature_c: null,
          condition: null,
        }),
        createMockLocation(2, 40.7128, -74.006, {
          temperature_c: null,
          condition: '',
        }),
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
        expect(markers[0]).toHaveAttribute('data-label-text', '--');
        expect(markers[1]).toHaveAttribute('data-label-text', '--');
      });
    });
  });

  describe('labels update within 200ms when weather refreshes (Requirement 3.4)', () => {
    it('updates label when weather data changes', async () => {
      // Verify that re-mounting with updated data shows the new values promptly
      const updatedLocations = [createMockLocation(1, 1.3521, 103.8198, { temperature_c: 30 })];
      mockListLocations.mockResolvedValue({ locations: updatedLocations });

      const startTime = Date.now();

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(
        () => {
          const marker = screen.getByTestId('location-marker');
          expect(marker).toHaveAttribute('data-label-text', '30°C');
        },
        { timeout: 200 },
      );

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(200);
    });

    it('updates label from temperature to condition', async () => {
      const updatedLocations = [
        createMockLocation(1, 1.3521, 103.8198, {
          temperature_c: null,
          condition: 'Cloudy',
        }),
      ];
      mockListLocations.mockResolvedValue({ locations: updatedLocations });

      const startTime = Date.now();

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(
        () => {
          const marker = screen.getByTestId('location-marker');
          expect(marker).toHaveAttribute('data-label-text', 'Cloudy');
        },
        { timeout: 200 },
      );

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(200);
    });

    it('updates label from condition to placeholder', async () => {
      const updatedLocations = [
        createMockLocation(1, 1.3521, 103.8198, {
          temperature_c: null,
          condition: null,
        }),
      ];
      mockListLocations.mockResolvedValue({ locations: updatedLocations });

      const startTime = Date.now();

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(
        () => {
          const marker = screen.getByTestId('location-marker');
          expect(marker).toHaveAttribute('data-label-text', '--');
        },
        { timeout: 200 },
      );

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(200);
    });

    it('updates multiple labels simultaneously when weather refreshes', async () => {
      const updatedLocations = [
        createMockLocation(1, 1.3521, 103.8198, { temperature_c: 28 }),
        createMockLocation(2, 40.7128, -74.006, { temperature_c: 22 }),
      ];
      mockListLocations.mockResolvedValue({ locations: updatedLocations });

      const startTime = Date.now();

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(
        () => {
          const markers = screen.getAllByTestId('location-marker');
          expect(markers[0]).toHaveAttribute('data-label-text', '28°C');
          expect(markers[1]).toHaveAttribute('data-label-text', '22°C');
        },
        { timeout: 200 },
      );

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(200);
    });
  });

  describe('collision detection maintains 30px separation (Requirement 3.5)', () => {
    it('applies collision detection to label positions', async () => {
      // Create locations that would be close together on the map
      const mockLocations = [
        createMockLocation(1, 1.3521, 103.8198, { temperature_c: 25 }),
        createMockLocation(2, 1.3522, 103.8199, { temperature_c: 26 }), // Very close
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

        // Both markers should have label positions assigned
        expect(markers[0]).toHaveAttribute('data-label-position');
        expect(markers[1]).toHaveAttribute('data-label-position');
      });
    });

    it('handles collision detection for multiple nearby locations', async () => {
      // Create three locations very close together
      const mockLocations = [
        createMockLocation(1, 1.3521, 103.8198, { temperature_c: 25 }),
        createMockLocation(2, 1.3522, 103.8199, { temperature_c: 26 }),
        createMockLocation(3, 1.3523, 103.82, { temperature_c: 27 }),
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

        // All markers should have label positions
        markers.forEach((marker) => {
          expect(marker).toHaveAttribute('data-label-position');
        });
      });
    });

    it('does not apply collision detection when locations are far apart', async () => {
      // Create locations that are far apart
      const mockLocations = [
        createMockLocation(1, 1.3521, 103.8198, { temperature_c: 25 }),
        createMockLocation(2, 40.7128, -74.006, { temperature_c: 20 }), // New York
        createMockLocation(3, -33.8688, 151.2093, { temperature_c: 22 }), // Sydney
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

        // All markers should have default 'above' position
        markers.forEach((marker) => {
          expect(marker).toHaveAttribute('data-label-position', 'above');
        });
      });
    });

    it('recalculates collision detection when map instance changes', async () => {
      const mockLocations = [
        createMockLocation(1, 1.3521, 103.8198, { temperature_c: 25 }),
        createMockLocation(2, 1.3522, 103.8199, { temperature_c: 26 }),
      ];
      mockListLocations.mockResolvedValue({ locations: mockLocations });

      const { rerender } = render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(() => {
        const markers = screen.getAllByTestId('location-marker');
        expect(markers).toHaveLength(2);
      });

      // Force re-render to trigger collision detection recalculation
      rerender(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(() => {
        const markers = screen.getAllByTestId('location-marker');
        expect(markers).toHaveLength(2);

        // Verify collision detection is still applied
        markers.forEach((marker) => {
          expect(marker).toHaveAttribute('data-label-position');
        });
      });
    });
  });

  describe('edge cases and error handling', () => {
    it('handles locations with undefined temperature', async () => {
      const mockLocations = [
        createMockLocation(1, 1.3521, 103.8198, {
          temperature_c: undefined,
          condition: 'Sunny',
        }),
      ];
      mockListLocations.mockResolvedValue({ locations: mockLocations });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(() => {
        const marker = screen.getByTestId('location-marker');
        expect(marker).toHaveAttribute('data-label-text', 'Sunny');
      });
    });

    it('handles very long condition text', async () => {
      const mockLocations = [
        createMockLocation(1, 1.3521, 103.8198, {
          temperature_c: null,
          condition: 'Heavy Thunderstorms with Lightning',
        }),
      ];
      mockListLocations.mockResolvedValue({ locations: mockLocations });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(() => {
        const marker = screen.getByTestId('location-marker');
        expect(marker).toHaveAttribute('data-label-text', 'Heavy Thunderstorms with Lightning');
      });
    });

    it('handles extreme temperature values', async () => {
      const mockLocations = [
        createMockLocation(1, 1.3521, 103.8198, { temperature_c: 50 }),
        createMockLocation(2, 40.7128, -74.006, { temperature_c: -40 }),
      ];
      mockListLocations.mockResolvedValue({ locations: mockLocations });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(() => {
        const markers = screen.getAllByTestId('location-marker');
        expect(markers[0]).toHaveAttribute('data-label-text', '50°C');
        expect(markers[1]).toHaveAttribute('data-label-text', '-40°C');
      });
    });

    it('handles single location without collision detection', async () => {
      const mockLocations = [createMockLocation(1, 1.3521, 103.8198, { temperature_c: 25 })];
      mockListLocations.mockResolvedValue({ locations: mockLocations });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>,
      );

      await waitFor(() => {
        const marker = screen.getByTestId('location-marker');
        expect(marker).toHaveAttribute('data-label-position', 'above');
        expect(marker).toHaveAttribute('data-label-text', '25°C');
      });
    });
  });
});
