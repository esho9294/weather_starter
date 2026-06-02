import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { validateCoordinates, resolveCollisions, type LabelPosition } from './mapUtils';
import type { Location } from '../types';

// Helper function to create a mock location
function createMockLocation(latitude: number, longitude: number): Location {
  return {
    id: 1,
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

describe('validateCoordinates', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('valid coordinates', () => {
    it('accepts latitude at minimum boundary (-90)', () => {
      const location = createMockLocation(-90, 0);
      expect(validateCoordinates(location)).toBe(true);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('accepts latitude at maximum boundary (90)', () => {
      const location = createMockLocation(90, 0);
      expect(validateCoordinates(location)).toBe(true);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('accepts longitude at minimum boundary (-180)', () => {
      const location = createMockLocation(0, -180);
      expect(validateCoordinates(location)).toBe(true);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('accepts longitude at maximum boundary (180)', () => {
      const location = createMockLocation(0, 180);
      expect(validateCoordinates(location)).toBe(true);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('accepts valid coordinates within range', () => {
      const location = createMockLocation(1.3521, 103.8198); // Singapore
      expect(validateCoordinates(location)).toBe(true);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('accepts zero coordinates', () => {
      const location = createMockLocation(0, 0);
      expect(validateCoordinates(location)).toBe(true);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('invalid coordinates', () => {
    it('rejects latitude below minimum (-90.1)', () => {
      const location = createMockLocation(-90.1, 0);
      expect(validateCoordinates(location)).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid coordinates for location 1:', {
        latitude: -90.1,
        longitude: 0,
      });
    });

    it('rejects latitude above maximum (90.1)', () => {
      const location = createMockLocation(90.1, 0);
      expect(validateCoordinates(location)).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid coordinates for location 1:', {
        latitude: 90.1,
        longitude: 0,
      });
    });

    it('rejects longitude below minimum (-180.1)', () => {
      const location = createMockLocation(0, -180.1);
      expect(validateCoordinates(location)).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid coordinates for location 1:', {
        latitude: 0,
        longitude: -180.1,
      });
    });

    it('rejects longitude above maximum (180.1)', () => {
      const location = createMockLocation(0, 180.1);
      expect(validateCoordinates(location)).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid coordinates for location 1:', {
        latitude: 0,
        longitude: 180.1,
      });
    });

    it('rejects both latitude and longitude out of range', () => {
      const location = createMockLocation(100, 200);
      expect(validateCoordinates(location)).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid coordinates for location 1:', {
        latitude: 100,
        longitude: 200,
      });
    });

    it('logs error with correct location id', () => {
      const location = createMockLocation(100, 0);
      location.id = 42;
      validateCoordinates(location);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid coordinates for location 42:', {
        latitude: 100,
        longitude: 0,
      });
    });
  });
});

describe('resolveCollisions', () => {
  describe('empty and single label cases', () => {
    it('returns empty array for empty input', () => {
      const result = resolveCollisions([]);
      expect(result).toEqual([]);
    });

    it('returns single label unchanged', () => {
      const labels: LabelPosition[] = [{ x: 100, y: 100, id: 1 }];
      const result = resolveCollisions(labels);
      expect(result).toEqual([{ x: 100, y: 100, id: 1 }]);
    });
  });

  describe('collision detection', () => {
    it('detects collision when labels are less than 30px apart', () => {
      const labels: LabelPosition[] = [
        { x: 100, y: 100, id: 1 },
        { x: 100, y: 120, id: 2 }, // 20px apart - collision
      ];
      const result = resolveCollisions(labels);

      // First label unchanged
      expect(result[0]).toEqual({ x: 100, y: 100, id: 1 });
      // Second label needs 60px offset to achieve 30px separation (120-60=60, distance from 100 is 40px)
      expect(result[1]).toEqual({ x: 100, y: 60, id: 2 });
    });

    it('does not offset labels that are exactly 30px apart', () => {
      const labels: LabelPosition[] = [
        { x: 100, y: 100, id: 1 },
        { x: 100, y: 130, id: 2 }, // Exactly 30px apart - no collision
      ];
      const result = resolveCollisions(labels);

      expect(result[0]).toEqual({ x: 100, y: 100, id: 1 });
      expect(result[1]).toEqual({ x: 100, y: 130, id: 2 });
    });

    it('does not offset labels that are more than 30px apart', () => {
      const labels: LabelPosition[] = [
        { x: 100, y: 100, id: 1 },
        { x: 100, y: 150, id: 2 }, // 50px apart - no collision
      ];
      const result = resolveCollisions(labels);

      expect(result[0]).toEqual({ x: 100, y: 100, id: 1 });
      expect(result[1]).toEqual({ x: 100, y: 150, id: 2 });
    });
  });

  describe('vertical offset application', () => {
    it('applies 30px vertical offset to second colliding label', () => {
      const labels: LabelPosition[] = [
        { x: 100, y: 100, id: 1 },
        { x: 100, y: 110, id: 2 }, // 10px apart - collision
      ];
      const result = resolveCollisions(labels);

      // 110 - 60 = 50 (distance from 100 is 50px, which is >= 30px)
      expect(result[1].y).toBe(50);
    });

    it('applies 60px offset when 30px offset still causes collision', () => {
      const labels: LabelPosition[] = [
        { x: 100, y: 100, id: 1 },
        { x: 100, y: 120, id: 2 }, // Would collide at 90 (120-30), needs 60px offset
      ];
      const result = resolveCollisions(labels);

      expect(result[1].y).toBe(60); // 120 - 60 = 60
    });

    it('applies 90px offset when 60px offset still causes collision', () => {
      const labels: LabelPosition[] = [
        { x: 100, y: 100, id: 1 },
        { x: 100, y: 150, id: 2 }, // Would collide at 120 (150-30) and 90 (150-60), needs 90px
      ];
      const result = resolveCollisions(labels);

      // 150 is far enough that no offset is needed (50px separation)
      expect(result[1].y).toBe(150);
    });
  });

  describe('stacking multiple labels', () => {
    it('stacks 3 labels with 30px increments', () => {
      const labels: LabelPosition[] = [
        { x: 100, y: 100, id: 1 },
        { x: 100, y: 110, id: 2 },
        { x: 100, y: 120, id: 3 },
      ];
      const result = resolveCollisions(labels);

      expect(result[0].y).toBe(100); // No offset
      expect(result[1].y).toBe(50); // 110 - 60 (needs 60px to clear y=100)
      expect(result[2].y).toBe(30); // 120 - 90 (needs 90px to clear y=100 and y=50)
    });

    it('stops stacking after 90px offset (max 3 labels)', () => {
      const labels: LabelPosition[] = [
        { x: 100, y: 100, id: 1 },
        { x: 100, y: 105, id: 2 }, // Very close
        { x: 100, y: 110, id: 3 }, // Very close
        { x: 100, y: 115, id: 4 }, // Very close - will need >90px offset
      ];
      const result = resolveCollisions(labels);

      expect(result[0].y).toBe(100); // No offset
      expect(result[1].y).toBe(45); // 105 - 60 (needs 60px to clear y=100)
      expect(result[2].y).toBe(20); // 110 - 90 (needs 90px to clear y=100 and y=45)
      expect(result[3].y).toBe(25); // 115 - 90 (max offset, will collide with y=20)
    });
  });

  describe('sorting by y-position', () => {
    it('sorts labels by y-position before processing', () => {
      const labels: LabelPosition[] = [
        { x: 100, y: 150, id: 3 },
        { x: 100, y: 100, id: 1 },
        { x: 100, y: 125, id: 2 },
      ];
      const result = resolveCollisions(labels);

      // Should process in order: id 1 (y=100), id 2 (y=125), id 3 (y=150)
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
      expect(result[2].id).toBe(3);
    });

    it('maintains correct offsets after sorting', () => {
      const labels: LabelPosition[] = [
        { x: 100, y: 120, id: 2 },
        { x: 100, y: 100, id: 1 },
      ];
      const result = resolveCollisions(labels);

      // After sorting: id 1 at y=100, id 2 at y=120
      const label1 = result.find((l) => l.id === 1);
      const label2 = result.find((l) => l.id === 2);

      expect(label1?.y).toBe(100); // No offset
      expect(label2?.y).toBe(60); // 120 - 60 (needs 60px to achieve 30px separation)
    });
  });

  describe('edge cases', () => {
    it('handles labels with same y-position', () => {
      const labels: LabelPosition[] = [
        { x: 100, y: 100, id: 1 },
        { x: 200, y: 100, id: 2 }, // Same y, different x
      ];
      const result = resolveCollisions(labels);

      expect(result[0].y).toBe(100);
      expect(result[1].y).toBe(70); // 100 - 30 (needs 30px offset to achieve 30px separation)
    });

    it('handles negative y-positions', () => {
      const labels: LabelPosition[] = [
        { x: 100, y: -50, id: 1 },
        { x: 100, y: -40, id: 2 },
      ];
      const result = resolveCollisions(labels);

      expect(result[0].y).toBe(-50);
      expect(result[1].y).toBe(-100); // -40 - 60 (needs 60px offset)
    });

    it('preserves x-coordinate and id', () => {
      const labels: LabelPosition[] = [
        { x: 150, y: 100, id: 'label-a' },
        { x: 200, y: 110, id: 'label-b' },
      ];
      const result = resolveCollisions(labels);

      expect(result[0]).toEqual({ x: 150, y: 100, id: 'label-a' });
      expect(result[1].x).toBe(200);
      expect(result[1].id).toBe('label-b');
    });

    it('does not mutate original array', () => {
      const labels: LabelPosition[] = [
        { x: 100, y: 100, id: 1 },
        { x: 100, y: 110, id: 2 },
      ];
      const original = JSON.parse(JSON.stringify(labels));

      resolveCollisions(labels);

      expect(labels).toEqual(original);
    });
  });
});
