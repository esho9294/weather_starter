import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
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
  LocationMarker: ({ location, isSelected }: any) => (
    <div data-testid="location-marker" data-location-id={location.id} data-selected={isSelected} />
  ),
}));

// Mock mapUtils
vi.mock('./mapUtils', () => ({
  validateCoordinates: (location: any) => {
    return location.latitude >= -90 && location.latitude <= 90 &&
           location.longitude >= -180 && location.longitude <= 180;
  },
}));

// Mock the API module
vi.mock('../api', () => ({
  listLocations: vi.fn(() => Promise.resolve({ locations: [] })),
  createLocation: vi.fn(),
  refreshLocation: vi.fn(),
  deleteLocation: vi.fn(),
  logInteraction: vi.fn(),
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

describe('MapCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe('rendering with default center and zoom', () => {
    it('renders with default center (Singapore) and zoom level 11 when no locations exist', async () => {
      const { listLocations } = await import('../api');
      vi.mocked(listLocations).mockResolvedValue({ locations: [] });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>
      );

      await waitFor(() => {
        const mapContainer = screen.getByTestId('map-container');
        expect(mapContainer).toBeInTheDocument();
        
        // Check default center coordinates (Singapore: 1.3521°N, 103.8198°E)
        const centerData = mapContainer.getAttribute('data-center');
        expect(centerData).toBe('[1.3521,103.8198]');
        
        // Check default zoom level
        expect(mapContainer.getAttribute('data-zoom')).toBe('11');
      });
    });

    it('renders TileLayer with OpenStreetMap URL', async () => {
      const { listLocations } = await import('../api');
      vi.mocked(listLocations).mockResolvedValue({ locations: [] });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>
      );

      await waitFor(() => {
        const tileLayer = screen.getByTestId('tile-layer');
        expect(tileLayer).toBeInTheDocument();
        expect(tileLayer.getAttribute('data-url')).toBe(
          'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
        );
      });
    });
  });

  describe('empty state message', () => {
    it('displays "No locations saved yet" message when locations array is empty', async () => {
      const { listLocations } = await import('../api');
      vi.mocked(listLocations).mockResolvedValue({ locations: [] });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('No locations saved yet')).toBeInTheDocument();
      });
    });

    it('does not display empty state message when locations exist', async () => {
      const { listLocations } = await import('../api');
      const mockLocations = [createMockLocation(1, 1.3521, 103.8198)];
      vi.mocked(listLocations).mockResolvedValue({ locations: mockLocations });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText('No locations saved yet')).not.toBeInTheDocument();
      });
    });
  });

  describe('expand button functionality', () => {
    it('renders expand button with correct aria-label', async () => {
      const { listLocations } = await import('../api');
      vi.mocked(listLocations).mockResolvedValue({ locations: [] });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>
      );

      await waitFor(() => {
        const expandButton = screen.getByLabelText('Expand map');
        expect(expandButton).toBeInTheDocument();
      });
    });

    it('toggles to fullscreen state when expand button is clicked', async () => {
      const { listLocations } = await import('../api');
      vi.mocked(listLocations).mockResolvedValue({ locations: [] });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>
      );

      await waitFor(() => {
        const expandButton = screen.getByLabelText('Expand map');
        fireEvent.click(expandButton);
      });

      await waitFor(() => {
        // In fullscreen mode, the button should change to "Exit fullscreen"
        expect(screen.getByLabelText('Exit fullscreen')).toBeInTheDocument();
        expect(screen.queryByLabelText('Expand map')).not.toBeInTheDocument();
      });
    });

    it('exits fullscreen when close button is clicked', async () => {
      const { listLocations } = await import('../api');
      vi.mocked(listLocations).mockResolvedValue({ locations: [] });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>
      );

      // Enter fullscreen
      await waitFor(() => {
        const expandButton = screen.getByLabelText('Expand map');
        fireEvent.click(expandButton);
      });

      // Exit fullscreen
      await waitFor(() => {
        const closeButton = screen.getByLabelText('Exit fullscreen');
        fireEvent.click(closeButton);
      });

      await waitFor(() => {
        // Should be back to card view with expand button
        expect(screen.getByLabelText('Expand map')).toBeInTheDocument();
        expect(screen.queryByLabelText('Exit fullscreen')).not.toBeInTheDocument();
      });
    });
  });

  describe('Escape key functionality', () => {
    it('exits fullscreen mode when Escape key is pressed', async () => {
      const { listLocations } = await import('../api');
      vi.mocked(listLocations).mockResolvedValue({ locations: [] });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>
      );

      // Enter fullscreen
      await waitFor(() => {
        const expandButton = screen.getByLabelText('Expand map');
        fireEvent.click(expandButton);
      });

      // Verify we're in fullscreen
      await waitFor(() => {
        expect(screen.getByLabelText('Exit fullscreen')).toBeInTheDocument();
      });

      // Press Escape key
      fireEvent.keyDown(window, { key: 'Escape' });

      await waitFor(() => {
        // Should exit fullscreen
        expect(screen.getByLabelText('Expand map')).toBeInTheDocument();
        expect(screen.queryByLabelText('Exit fullscreen')).not.toBeInTheDocument();
      });
    });

    it('does not affect state when Escape is pressed in card view', async () => {
      const { listLocations } = await import('../api');
      vi.mocked(listLocations).mockResolvedValue({ locations: [] });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>
      );

      await waitFor(() => {
        expect(screen.getByLabelText('Expand map')).toBeInTheDocument();
      });

      // Press Escape key while in card view
      fireEvent.keyDown(window, { key: 'Escape' });

      // Should remain in card view
      expect(screen.getByLabelText('Expand map')).toBeInTheDocument();
    });
  });

  describe('fullscreen rendering', () => {
    it('renders fullscreen overlay with correct styling when in fullscreen mode', async () => {
      const { listLocations } = await import('../api');
      vi.mocked(listLocations).mockResolvedValue({ locations: [] });

      const { container } = render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>
      );

      // Enter fullscreen
      await waitFor(() => {
        const expandButton = screen.getByLabelText('Expand map');
        fireEvent.click(expandButton);
      });

      await waitFor(() => {
        // Check for fullscreen container with correct classes
        const fullscreenDiv = container.querySelector('.fixed.inset-0.z-50.bg-black');
        expect(fullscreenDiv).toBeInTheDocument();
      });
    });

    it('renders card view with correct styling when not in fullscreen mode', async () => {
      const { listLocations } = await import('../api');
      vi.mocked(listLocations).mockResolvedValue({ locations: [] });

      const { container } = render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>
      );

      await waitFor(() => {
        // Check for card container with correct classes
        const cardSection = container.querySelector('section.rounded-2xl');
        expect(cardSection).toBeInTheDocument();
        expect(cardSection).toHaveClass('border', 'border-white/15', 'bg-white/[0.08]');
      });
    });
  });

  describe('transition state handling', () => {
    it.skip('ignores button clicks during transitions (requires isTransitioning state - to be implemented in task 10.1)', async () => {
      // This test is skipped because the isTransitioning state hasn't been implemented yet
      // It will be implemented in task 10.1 "Add fullscreen state management to MapCard"
      // 
      // Expected behavior:
      // - When transitioning to fullscreen, isTransitioning should be true for 500ms
      // - When transitioning back to card view, isTransitioning should be true for 500ms
      // - Button clicks should be ignored when isTransitioning is true
      //
      // Requirements: 4.9, 4.10
    });
  });
});
