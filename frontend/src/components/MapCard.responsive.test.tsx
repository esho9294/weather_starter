/**
 * Integration tests for MapCard responsive behavior
 * 
 * **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**
 * 
 * Tests cover:
 * - Card dimensions at mobile width (< 768px) (Requirement 6.2)
 * - Card dimensions at desktop width (>= 768px) (Requirement 6.1)
 * - Fullscreen occupies full viewport (Requirement 6.3)
 * - Dimension adjustment on viewport resize (Requirements 6.4, 6.5)
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';
import { MapCard } from './MapCard';
import { StoreProvider } from '../state/store';
import type { Location } from '../types';

// Mock react-leaflet components with map instance support
const mockInvalidateSize = vi.fn();
let mockMapInstanceRef: any = null;

const createMockMapInstance = () => ({
  invalidateSize: mockInvalidateSize,
  latLngToContainerPoint: vi.fn(() => ({ x: 100, y: 100 })),
  fitBounds: vi.fn(),
  getCenter: vi.fn(() => ({ lat: 1.3521, lng: 103.8198 })),
  getZoom: vi.fn(() => 11),
  setView: vi.fn(),
});

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children, center, zoom, ref }: any) => {
    // Simulate ref callback to provide map instance
    if (ref && typeof ref === 'function' && !mockMapInstanceRef) {
      mockMapInstanceRef = createMockMapInstance();
      setTimeout(() => ref(mockMapInstanceRef), 0);
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

// Helper to set viewport size
function setViewportSize(width: number, height: number) {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
}

describe('MapCard - Responsive Behavior Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListLocations.mockResolvedValue({ locations: [] });
    mockInvalidateSize.mockClear();
    mockMapInstanceRef = null; // Reset map instance ref
    // Reset viewport to default desktop size
    setViewportSize(1024, 768);
  });

  afterEach(() => {
    cleanup();
  });

  describe('card dimensions at mobile width (< 768px)', () => {
    it('renders with minimum height 300px at mobile width', async () => {
      // Set viewport to mobile width
      setViewportSize(375, 667); // iPhone SE dimensions

      const mockLocations = [createMockLocation(1, 1.3521, 103.8198)];
      mockListLocations.mockResolvedValue({ locations: mockLocations });

      const { container } = render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>
      );

      await waitFor(() => {
        const cardSection = container.querySelector('section.rounded-2xl');
        expect(cardSection).toBeInTheDocument();
        
        // Check that the card has mobile minimum height class
        expect(cardSection).toHaveClass('min-h-[300px]');
      });
    });

    it('renders with 100% width at mobile width', async () => {
      // Set viewport to mobile width
      setViewportSize(375, 667);

      const mockLocations = [createMockLocation(1, 1.3521, 103.8198)];
      mockListLocations.mockResolvedValue({ locations: mockLocations });

      const { container } = render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>
      );

      await waitFor(() => {
        const cardSection = container.querySelector('section.rounded-2xl');
        expect(cardSection).toBeInTheDocument();
        
        // Check that the card has full width class
        expect(cardSection).toHaveClass('w-full');
      });
    });

    it('applies correct styling at various mobile widths', async () => {
      const mobileWidths = [320, 375, 414, 767]; // Various mobile widths

      for (const width of mobileWidths) {
        setViewportSize(width, 667);

        const { container, unmount } = render(
          <StoreProvider>
            <MapCard />
          </StoreProvider>
        );

        await waitFor(() => {
          const cardSection = container.querySelector('section.rounded-2xl');
          expect(cardSection).toBeInTheDocument();
          expect(cardSection).toHaveClass('min-h-[300px]');
          expect(cardSection).toHaveClass('w-full');
        });

        unmount();
      }
    });
  });

  describe('card dimensions at desktop width (>= 768px)', () => {
    it('renders with minimum height 400px at desktop width', async () => {
      // Set viewport to desktop width
      setViewportSize(1024, 768);

      const mockLocations = [createMockLocation(1, 1.3521, 103.8198)];
      mockListLocations.mockResolvedValue({ locations: mockLocations });

      const { container } = render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>
      );

      await waitFor(() => {
        const cardSection = container.querySelector('section.rounded-2xl');
        expect(cardSection).toBeInTheDocument();
        
        // Check that the card has desktop minimum height class
        expect(cardSection).toHaveClass('md:min-h-[400px]');
      });
    });

    it('renders at exactly 768px width (boundary)', async () => {
      // Set viewport to exactly 768px (desktop boundary)
      setViewportSize(768, 1024);

      const mockLocations = [createMockLocation(1, 1.3521, 103.8198)];
      mockListLocations.mockResolvedValue({ locations: mockLocations });

      const { container } = render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>
      );

      await waitFor(() => {
        const cardSection = container.querySelector('section.rounded-2xl');
        expect(cardSection).toBeInTheDocument();
        
        // At 768px, should have desktop height
        expect(cardSection).toHaveClass('md:min-h-[400px]');
      });
    });

    it('applies correct styling at various desktop widths', async () => {
      const desktopWidths = [768, 1024, 1280, 1920]; // Various desktop widths

      for (const width of desktopWidths) {
        setViewportSize(width, 768);

        const { container, unmount } = render(
          <StoreProvider>
            <MapCard />
          </StoreProvider>
        );

        await waitFor(() => {
          const cardSection = container.querySelector('section.rounded-2xl');
          expect(cardSection).toBeInTheDocument();
          expect(cardSection).toHaveClass('md:min-h-[400px]');
        });

        unmount();
      }
    });
  });

  describe('fullscreen occupies full viewport', () => {
    it('renders fullscreen view with 100% viewport width and height', async () => {
      setViewportSize(1024, 768);

      const mockLocations = [createMockLocation(1, 1.3521, 103.8198)];
      mockListLocations.mockResolvedValue({ locations: mockLocations });

      const { container } = render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>
      );

      // Wait for map to render
      await waitFor(() => {
        expect(screen.getByLabelText('Expand map')).toBeInTheDocument();
      });

      // Click expand button to enter fullscreen
      const expandButton = screen.getByLabelText('Expand map');
      fireEvent.click(expandButton);

      await waitFor(() => {
        // Check for fullscreen container - it's rendered to document.body via portal
        const fullscreenDiv = document.body.querySelector('.fixed.inset-0');
        expect(fullscreenDiv).toBeInTheDocument();
        
        // Verify fullscreen classes
        expect(fullscreenDiv).toHaveClass('fixed', 'inset-0', 'z-50', 'bg-black');
      });
    });

    it('fullscreen view occupies viewport at mobile width', async () => {
      setViewportSize(375, 667); // Mobile viewport

      const mockLocations = [createMockLocation(1, 1.3521, 103.8198)];
      mockListLocations.mockResolvedValue({ locations: mockLocations });

      const { container } = render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>
      );

      await waitFor(() => {
        expect(screen.getByLabelText('Expand map')).toBeInTheDocument();
      });

      // Enter fullscreen
      const expandButton = screen.getByLabelText('Expand map');
      fireEvent.click(expandButton);

      await waitFor(() => {
        const fullscreenDiv = document.body.querySelector('.fixed.inset-0');
        expect(fullscreenDiv).toBeInTheDocument();
        
        // inset-0 means top-0 right-0 bottom-0 left-0, which fills the viewport
        expect(fullscreenDiv).toHaveClass('inset-0');
      });
    });

    it('fullscreen view occupies viewport at desktop width', async () => {
      setViewportSize(1920, 1080); // Large desktop viewport

      const mockLocations = [createMockLocation(1, 1.3521, 103.8198)];
      mockListLocations.mockResolvedValue({ locations: mockLocations });

      const { container } = render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>
      );

      await waitFor(() => {
        expect(screen.getByLabelText('Expand map')).toBeInTheDocument();
      });

      // Enter fullscreen
      const expandButton = screen.getByLabelText('Expand map');
      fireEvent.click(expandButton);

      await waitFor(() => {
        const fullscreenDiv = document.body.querySelector('.fixed.inset-0');
        expect(fullscreenDiv).toBeInTheDocument();
        expect(fullscreenDiv).toHaveClass('fixed', 'inset-0');
      });
    });
  });

  describe('dimension adjustment on viewport resize', () => {
    it('verifies map container responds to viewport changes from desktop to mobile', async () => {
      // Start with desktop viewport
      setViewportSize(1024, 768);

      const mockLocations = [createMockLocation(1, 1.3521, 103.8198)];
      mockListLocations.mockResolvedValue({ locations: mockLocations });

      const { container } = render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>
      );

      // Wait for map to initialize
      await waitFor(() => {
        expect(screen.getByTestId('map-container')).toBeInTheDocument();
      });

      // Verify desktop styling
      const cardSection = container.querySelector('section.rounded-2xl');
      expect(cardSection).toHaveClass('md:min-h-[400px]');

      // Resize viewport to mobile
      setViewportSize(375, 667);
      
      // Trigger resize event
      fireEvent(window, new Event('resize'));

      // Wait for any resize handling to complete
      await new Promise(resolve => setTimeout(resolve, 600));

      // Card should still have responsive classes
      expect(cardSection).toHaveClass('min-h-[300px]', 'md:min-h-[400px]');
    });

    it('verifies map container responds to viewport changes from mobile to desktop', async () => {
      // Start with mobile viewport
      setViewportSize(375, 667);

      const mockLocations = [createMockLocation(1, 1.3521, 103.8198)];
      mockListLocations.mockResolvedValue({ locations: mockLocations });

      const { container } = render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('map-container')).toBeInTheDocument();
      });

      // Verify mobile styling
      const cardSection = container.querySelector('section.rounded-2xl');
      expect(cardSection).toHaveClass('min-h-[300px]');

      // Resize viewport to desktop
      setViewportSize(1024, 768);
      
      // Trigger resize event
      fireEvent(window, new Event('resize'));

      // Wait for any resize handling to complete
      await new Promise(resolve => setTimeout(resolve, 600));

      // Card should still have responsive classes
      expect(cardSection).toHaveClass('min-h-[300px]', 'md:min-h-[400px]');
    });

    it('verifies fullscreen map responds to viewport resize', async () => {
      // Start with desktop viewport
      setViewportSize(1024, 768);

      const mockLocations = [createMockLocation(1, 1.3521, 103.8198)];
      mockListLocations.mockResolvedValue({ locations: mockLocations });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>
      );

      // Wait for map and enter fullscreen
      await waitFor(() => {
        expect(screen.getByLabelText('Expand map')).toBeInTheDocument();
      });

      const expandButton = screen.getByLabelText('Expand map');
      fireEvent.click(expandButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Exit fullscreen')).toBeInTheDocument();
      });

      // Verify fullscreen is active
      const fullscreenDiv = document.body.querySelector('.fixed.inset-0');
      expect(fullscreenDiv).toBeInTheDocument();

      // Resize viewport while in fullscreen
      setViewportSize(1920, 1080);
      
      // Trigger resize event
      fireEvent(window, new Event('resize'));

      // Wait for any resize handling to complete
      await new Promise(resolve => setTimeout(resolve, 600));

      // Fullscreen should still be active with correct classes
      expect(fullscreenDiv).toHaveClass('fixed', 'inset-0');
    });

    it('handles multiple rapid resize events without errors', async () => {
      setViewportSize(1024, 768);

      const mockLocations = [createMockLocation(1, 1.3521, 103.8198)];
      mockListLocations.mockResolvedValue({ locations: mockLocations });

      render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('map-container')).toBeInTheDocument();
      });

      // Trigger multiple rapid resize events
      for (let i = 0; i < 10; i++) {
        setViewportSize(1024 + i * 10, 768);
        fireEvent(window, new Event('resize'));
      }

      // Wait for debounce period
      await new Promise(resolve => setTimeout(resolve, 600));

      // Map should still be rendered without errors
      expect(screen.getByTestId('map-container')).toBeInTheDocument();
    });

    it('handles resize events at viewport boundary (768px)', async () => {
      // Start just below boundary
      setViewportSize(767, 1024);

      const mockLocations = [createMockLocation(1, 1.3521, 103.8198)];
      mockListLocations.mockResolvedValue({ locations: mockLocations });

      const { container } = render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('map-container')).toBeInTheDocument();
      });

      // Resize to exactly at boundary
      setViewportSize(768, 1024);
      fireEvent(window, new Event('resize'));

      await new Promise(resolve => setTimeout(resolve, 600));

      // Verify card still has correct classes
      const cardSection = container.querySelector('section.rounded-2xl');
      expect(cardSection).toHaveClass('md:min-h-[400px]');
    });
  });

  describe('responsive styling consistency', () => {
    it('maintains card styling classes across viewport changes', async () => {
      setViewportSize(1024, 768);

      const mockLocations = [createMockLocation(1, 1.3521, 103.8198)];
      mockListLocations.mockResolvedValue({ locations: mockLocations });

      const { container } = render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>
      );

      await waitFor(() => {
        const cardSection = container.querySelector('section.rounded-2xl');
        expect(cardSection).toBeInTheDocument();
        
        // Verify all card styling classes are present
        expect(cardSection).toHaveClass(
          'rounded-2xl',
          'border',
          'border-white/15',
          'bg-white/[0.08]',
          'backdrop-blur-xl',
          'overflow-hidden'
        );
      });

      // Resize to mobile
      setViewportSize(375, 667);
      fireEvent(window, new Event('resize'));

      await waitFor(() => {
        const cardSection = container.querySelector('section.rounded-2xl');
        
        // Styling classes should remain consistent
        expect(cardSection).toHaveClass(
          'rounded-2xl',
          'border',
          'border-white/15',
          'bg-white/[0.08]',
          'backdrop-blur-xl',
          'overflow-hidden'
        );
      });
    });

    it('applies transition classes for smooth dimension changes', async () => {
      setViewportSize(1024, 768);

      const mockLocations = [createMockLocation(1, 1.3521, 103.8198)];
      mockListLocations.mockResolvedValue({ locations: mockLocations });

      const { container } = render(
        <StoreProvider>
          <MapCard />
        </StoreProvider>
      );

      await waitFor(() => {
        const cardSection = container.querySelector('section.rounded-2xl');
        expect(cardSection).toBeInTheDocument();
        
        // Check for transition classes
        expect(cardSection).toHaveClass('transition-all', 'duration-500');
      });
    });
  });
});
