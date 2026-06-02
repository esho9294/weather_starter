import type { AreaMetadata } from './types';

const EARTH_RADIUS_KM = 6371;

/**
 * Haversine distance between two lat/lng points in km.
 */
export function haversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export interface NearestAreaResult {
  area: AreaMetadata;
  distanceKm: number;
}

/**
 * Finds the nearest area to the given user coordinates using Haversine formula.
 * Returns null if the areas list is empty.
 */
export function findNearestArea(
  userLat: number,
  userLng: number,
  areas: AreaMetadata[],
): NearestAreaResult | null {
  if (areas.length === 0) return null;

  let nearest: NearestAreaResult | null = null;

  for (const area of areas) {
    const distanceKm = haversineDistanceKm(userLat, userLng, area.latitude, area.longitude);
    if (!nearest || distanceKm < nearest.distanceKm) {
      nearest = { area, distanceKm };
    }
  }

  return nearest;
}

/** Maximum distance (km) to consider the user within Singapore coverage. */
export const MAX_DISTANCE_KM = 15;

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

const DEFAULT_OPTIONS: GeolocationOptions = {
  enableHighAccuracy: false,
  timeout: 10_000,
  maximumAge: 60_000,
};

/**
 * Wraps navigator.geolocation.getCurrentPosition in a Promise.
 */
export function getUserPosition(
  options: GeolocationOptions = DEFAULT_OPTIONS,
): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}
