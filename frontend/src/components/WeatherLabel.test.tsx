import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { WeatherLabel } from './WeatherLabel';
import type { WeatherSnapshot } from '../types';

/**
 * Unit tests for WeatherLabel component
 * 
 * **Validates: Requirements 3.2, 3.3, 3.6, 3.7**
 * 
 * Test Coverage:
 * - Temperature display when available (Requirement 3.2)
 * - Condition display when temperature unavailable (Requirement 3.3)
 * - Placeholder display when no weather data (Requirement 3.6)
 * - Styling and positioning (Requirements 3.7, 3.1)
 */

describe('WeatherLabel', () => {
  // Clean up after each test to avoid DOM pollution
  afterEach(() => {
    cleanup();
  });

  // Helper to create a base weather snapshot
  const createWeatherSnapshot = (overrides?: Partial<WeatherSnapshot>): WeatherSnapshot => ({
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
  });

  describe('Temperature Display (Requirement 3.2)', () => {
    it('displays temperature in "{temp}°C" format when temperature is available', () => {
      const weather = createWeatherSnapshot({ temperature_c: 28.5 });
      render(<WeatherLabel weather={weather} />);
      
      expect(screen.getByText('29°C')).toBeInTheDocument();
    });

    it('rounds temperature correctly (down)', () => {
      const weather = createWeatherSnapshot({ temperature_c: 28.4 });
      render(<WeatherLabel weather={weather} />);
      
      expect(screen.getByText('28°C')).toBeInTheDocument();
    });

    it('rounds temperature correctly (up)', () => {
      const weather = createWeatherSnapshot({ temperature_c: 28.6 });
      render(<WeatherLabel weather={weather} />);
      
      expect(screen.getByText('29°C')).toBeInTheDocument();
    });

    it('handles zero temperature correctly', () => {
      const weather = createWeatherSnapshot({ temperature_c: 0 });
      render(<WeatherLabel weather={weather} />);
      
      expect(screen.getByText('0°C')).toBeInTheDocument();
    });

    it('handles negative temperature correctly', () => {
      const weather = createWeatherSnapshot({ temperature_c: -5 });
      render(<WeatherLabel weather={weather} />);
      
      expect(screen.getByText('-5°C')).toBeInTheDocument();
    });

    it('handles very high temperature', () => {
      const weather = createWeatherSnapshot({ temperature_c: 45.7 });
      render(<WeatherLabel weather={weather} />);
      
      expect(screen.getByText('46°C')).toBeInTheDocument();
    });

    it('handles very low temperature', () => {
      const weather = createWeatherSnapshot({ temperature_c: -40.3 });
      render(<WeatherLabel weather={weather} />);
      
      expect(screen.getByText('-40°C')).toBeInTheDocument();
    });
  });

  describe('Condition Display (Requirement 3.3)', () => {
    it('displays weather condition text when temperature is unavailable', () => {
      const weather = createWeatherSnapshot({
        temperature_c: null,
        condition: 'Partly Cloudy',
      });
      render(<WeatherLabel weather={weather} />);
      
      expect(screen.getByText('Partly Cloudy')).toBeInTheDocument();
    });

    it('handles various condition texts', () => {
      const weather = createWeatherSnapshot({
        temperature_c: null,
        condition: 'Heavy Thunderstorms',
      });
      render(<WeatherLabel weather={weather} />);
      
      expect(screen.getByText('Heavy Thunderstorms')).toBeInTheDocument();
    });

    it('handles empty string condition as falsy', () => {
      const weather = createWeatherSnapshot({
        temperature_c: null,
        condition: '',
      });
      render(<WeatherLabel weather={weather} />);
      
      // Empty string is falsy, should show placeholder
      expect(screen.getByText('--')).toBeInTheDocument();
    });
  });

  describe('Placeholder Display (Requirement 3.6)', () => {
    it('displays "--" placeholder when no weather data is available', () => {
      const weather = createWeatherSnapshot({
        temperature_c: null,
        condition: null,
      });
      render(<WeatherLabel weather={weather} />);
      
      expect(screen.getByText('--')).toBeInTheDocument();
    });

    it('displays "--" when condition is empty string', () => {
      const weather = createWeatherSnapshot({
        temperature_c: null,
        condition: '',
      });
      render(<WeatherLabel weather={weather} />);
      
      expect(screen.getByText('--')).toBeInTheDocument();
    });
  });

  describe('Priority Logic', () => {
    it('prioritizes temperature over condition when both are available', () => {
      const weather = createWeatherSnapshot({
        temperature_c: 25,
        condition: 'Sunny',
      });
      render(<WeatherLabel weather={weather} />);
      
      // Should show temperature, not condition
      expect(screen.getByText('25°C')).toBeInTheDocument();
      expect(screen.queryByText('Sunny')).not.toBeInTheDocument();
    });

    it('uses condition when temperature is null', () => {
      const weather = createWeatherSnapshot({
        temperature_c: null,
        condition: 'Rainy',
      });
      render(<WeatherLabel weather={weather} />);
      
      expect(screen.getByText('Rainy')).toBeInTheDocument();
    });

    it('uses condition when temperature is undefined', () => {
      const weather = createWeatherSnapshot({
        temperature_c: undefined,
        condition: 'Cloudy',
      });
      render(<WeatherLabel weather={weather} />);
      
      expect(screen.getByText('Cloudy')).toBeInTheDocument();
    });
  });

  describe('Styling and Positioning (Requirements 3.1, 3.7)', () => {
    it('renders with correct positioning styles for "above" position', () => {
      const weather = createWeatherSnapshot({ temperature_c: 25 });
      const { container } = render(<WeatherLabel weather={weather} position="above" />);
      
      const outerDiv = container.firstChild as HTMLElement;
      expect(outerDiv).toHaveClass('absolute');
      expect(outerDiv).toHaveClass('left-1/2');
      expect(outerDiv).toHaveClass('-translate-x-1/2');
      expect(outerDiv.style.bottom).toBe('20px');
    });

    it('renders with correct positioning styles for "below" position', () => {
      const weather = createWeatherSnapshot({ temperature_c: 25 });
      const { container } = render(<WeatherLabel weather={weather} position="below" />);
      
      const outerDiv = container.firstChild as HTMLElement;
      expect(outerDiv.style.top).toBe('20px');
    });

    it('defaults to "above" position when position prop is not provided', () => {
      const weather = createWeatherSnapshot({ temperature_c: 25 });
      const { container } = render(<WeatherLabel weather={weather} />);
      
      const outerDiv = container.firstChild as HTMLElement;
      expect(outerDiv.style.bottom).toBe('20px');
    });

    it('renders with semi-transparent background (Requirement 3.7)', () => {
      const weather = createWeatherSnapshot({ temperature_c: 25 });
      const { container } = render(<WeatherLabel weather={weather} />);
      
      const innerDiv = container.querySelector('.rounded-md') as HTMLElement;
      expect(innerDiv.style.backgroundColor).toBe('rgba(0, 0, 0, 0.8)');
    });

    it('renders with correct font size (Requirement 3.7)', () => {
      const weather = createWeatherSnapshot({ temperature_c: 25 });
      const { container } = render(<WeatherLabel weather={weather} />);
      
      const innerDiv = container.querySelector('.rounded-md') as HTMLElement;
      expect(innerDiv.style.fontSize).toBe('12px');
    });

    it('renders with correct padding (Requirement 3.7)', () => {
      const weather = createWeatherSnapshot({ temperature_c: 25 });
      const { container } = render(<WeatherLabel weather={weather} />);
      
      const innerDiv = container.querySelector('.rounded-md') as HTMLElement;
      expect(innerDiv.style.padding).toBe('4px 8px');
    });

    it('renders with correct border radius (Requirement 3.7)', () => {
      const weather = createWeatherSnapshot({ temperature_c: 25 });
      const { container } = render(<WeatherLabel weather={weather} />);
      
      const innerDiv = container.querySelector('.rounded-md') as HTMLElement;
      expect(innerDiv.style.borderRadius).toBe('6px');
    });

    it('renders with white text color', () => {
      const weather = createWeatherSnapshot({ temperature_c: 25 });
      const { container } = render(<WeatherLabel weather={weather} />);
      
      const innerDiv = container.querySelector('.rounded-md') as HTMLElement;
      expect(innerDiv).toHaveClass('text-white');
    });

    it('renders with pointer-events-none to allow click-through', () => {
      const weather = createWeatherSnapshot({ temperature_c: 25 });
      const { container } = render(<WeatherLabel weather={weather} />);
      
      const outerDiv = container.firstChild as HTMLElement;
      expect(outerDiv).toHaveClass('pointer-events-none');
    });

    it('renders with whitespace-nowrap to prevent text wrapping', () => {
      const weather = createWeatherSnapshot({
        temperature_c: null,
        condition: 'Very Long Weather Condition Text',
      });
      const { container } = render(<WeatherLabel weather={weather} />);
      
      const outerDiv = container.firstChild as HTMLElement;
      expect(outerDiv).toHaveClass('whitespace-nowrap');
    });
  });

  describe('Edge Cases', () => {
    it('handles decimal temperature values correctly', () => {
      const weather = createWeatherSnapshot({ temperature_c: 23.7 });
      render(<WeatherLabel weather={weather} />);
      
      expect(screen.getByText('24°C')).toBeInTheDocument();
    });

    it('handles temperature exactly at 0.5 (rounds up)', () => {
      const weather = createWeatherSnapshot({ temperature_c: 0.5 });
      render(<WeatherLabel weather={weather} />);
      
      expect(screen.getByText('1°C')).toBeInTheDocument();
    });

    it('handles temperature exactly at -0.5 (rounds up to 0)', () => {
      const weather = createWeatherSnapshot({ temperature_c: -0.5 });
      render(<WeatherLabel weather={weather} />);
      
      expect(screen.getByText('0°C')).toBeInTheDocument();
    });

    it('handles null condition explicitly', () => {
      const weather = createWeatherSnapshot({
        temperature_c: null,
        condition: null,
      });
      render(<WeatherLabel weather={weather} />);
      
      expect(screen.getByText('--')).toBeInTheDocument();
    });

    it('handles undefined temperature explicitly', () => {
      const weather = createWeatherSnapshot({
        temperature_c: undefined,
        condition: 'Sunny',
      });
      render(<WeatherLabel weather={weather} />);
      
      expect(screen.getByText('Sunny')).toBeInTheDocument();
    });
  });
});
