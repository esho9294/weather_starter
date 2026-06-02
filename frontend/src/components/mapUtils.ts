import type { Location } from '../types';

/**
 * Validates that a location's coordinates are within valid geographic ranges.
 * Latitude must be in range [-90, 90] and longitude must be in range [-180, 180].
 *
 * @param location - The location object to validate
 * @returns true if coordinates are valid, false otherwise
 */
export function validateCoordinates(location: Location): boolean {
  const { latitude, longitude, id } = location;

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    console.error(`Invalid coordinates for location ${id}:`, {
      latitude,
      longitude,
    });
    return false;
  }

  return true;
}

/**
 * Represents a label position on the map with pixel coordinates.
 */
export interface LabelPosition {
  x: number;
  y: number;
  id: number | string;
}

/**
 * Detects and resolves collisions between weather labels on the map.
 * Labels that are less than 30px apart vertically will be offset to maintain separation.
 * Up to 3 labels can be stacked with 30px increments (max 90px offset).
 *
 * @param labels - Array of label positions to check for collisions
 * @returns Array of label positions with collision offsets applied
 */
export function resolveCollisions(labels: LabelPosition[]): LabelPosition[] {
  if (labels.length === 0) {
    return [];
  }

  // Sort labels by y-position (top to bottom)
  const sorted = [...labels].sort((a, b) => a.y - b.y);
  const resolved: LabelPosition[] = [];

  for (const label of sorted) {
    let offset = 0;

    // Check for collisions with already resolved labels
    // Try offsets: 0, 30, 60, 90 (max 3 stacks)
    while (offset <= 90) {
      if (!hasCollision(label, resolved, offset)) {
        break;
      }
      offset += 30;
    }

    // Cap at 90px max offset
    if (offset > 90) {
      offset = 90;
    }

    // Apply the offset (negative because we move labels up)
    resolved.push({ ...label, y: label.y - offset });
  }

  return resolved;
}

/**
 * Checks if a label at a given position would collide with any already resolved labels.
 * A collision occurs when the vertical distance between labels is less than 30px.
 *
 * @param label - The label to check
 * @param resolvedLabels - Array of already positioned labels
 * @param offset - Current vertical offset being tested
 * @returns true if collision detected, false otherwise
 */
function hasCollision(
  label: LabelPosition,
  resolvedLabels: LabelPosition[],
  offset: number,
): boolean {
  const testY = label.y - offset;

  for (const resolved of resolvedLabels) {
    const distance = Math.abs(testY - resolved.y);
    if (distance < 30) {
      return true;
    }
  }

  return false;
}
