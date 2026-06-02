import { useState, useId } from 'react';
import { useStore } from '../state/store';
import { fetchAreas, logInteraction } from '../api';
import { findNearestArea, getUserPosition, MAX_DISTANCE_KM } from '../geolocation';
import { CrosshairIcon, SpinnerIcon } from './icons';

type Status = 'idle' | 'locating' | 'success' | 'error' | 'duplicate';

export function UseMyLocationButton() {
  const { locations, create, select } = useStore();
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const errorId = useId();

  // Progressive enhancement: don't render if geolocation is unavailable
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return null;
  }

  const handleClick = async () => {
    setStatus('locating');
    setMessage(null);

    logInteraction('geolocation_requested');

    try {
      // Step 1: Get user position
      let position: GeolocationPosition;
      try {
        position = await getUserPosition();
      } catch (geoError) {
        const error = geoError as GeolocationPositionError;
        logInteraction('geolocation_failed', { code: error.code, message: error.message });

        if (error.code === error.PERMISSION_DENIED) {
          setMessage('Location access denied. You can allow it in your browser settings.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setMessage("Couldn't determine your position. Try again or add manually.");
        } else if (error.code === error.TIMEOUT) {
          setMessage('Location request timed out. Try again or add manually.');
        } else {
          setMessage("Couldn't determine your position. Try again or add manually.");
        }
        setStatus('error');
        return;
      }

      logInteraction('geolocation_succeeded', {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      // Step 2: Fetch area metadata
      let areas;
      try {
        areas = await fetchAreas();
      } catch {
        setMessage('Forecast areas unavailable. Try again shortly.');
        setStatus('error');
        return;
      }

      // Step 3: Find nearest area
      const result = findNearestArea(
        position.coords.latitude,
        position.coords.longitude,
        areas,
      );

      if (!result) {
        setMessage('Forecast areas unavailable. Try again shortly.');
        setStatus('error');
        return;
      }

      // Step 4: Boundary check (15 km threshold)
      if (result.distanceKm > MAX_DISTANCE_KM) {
        logInteraction('geolocation_outside_singapore', {
          distanceKm: result.distanceKm,
          nearestArea: result.area.name,
        });
        setMessage(
          "You don't appear to be in Singapore. This app covers Singapore forecast areas only.",
        );
        setStatus('error');
        return;
      }

      logInteraction('geolocation_area_matched', {
        area: result.area.name,
        distanceKm: result.distanceKm,
      });

      // Step 5: Duplicate detection (case-insensitive match on area name)
      const existingLocation = locations.find(
        (loc) =>
          loc.weather?.area?.toLowerCase() === result.area.name.toLowerCase(),
      );

      if (existingLocation) {
        logInteraction('geolocation_duplicate_detected', {
          area: result.area.name,
          existingLocationId: existingLocation.id,
        });
        select(existingLocation.id);
        setMessage(`You're nearest to ${result.area.name} — already in your list!`);
        setStatus('duplicate');
        // Auto-dismiss after 4 seconds
        setTimeout(() => {
          setMessage(null);
          setStatus('idle');
        }, 4000);
        return;
      }

      // Step 6: Create location with area centroid coordinates
      await create({ latitude: result.area.latitude, longitude: result.area.longitude });
      setStatus('success');
      setMessage(null);
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Couldn't determine your position. Try again or add manually.",
      );
      setStatus('error');
    }
  };

  const isLocating = status === 'locating';

  return (
    <div className="grid gap-1.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLocating}
        aria-label="Detect my location"
        aria-busy={isLocating}
        aria-describedby={message ? errorId : undefined}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-white/15 bg-white/[0.05] px-2.5 py-1.5 text-xs font-medium text-white/80 hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLocating ? <SpinnerIcon className="h-3.5 w-3.5 animate-spin" /> : <CrosshairIcon className="h-3.5 w-3.5" />}
        <span>{isLocating ? 'Locating…' : 'Use my location'}</span>
      </button>
      {message && (
        <p
          id={errorId}
          role={status === 'error' ? 'alert' : 'status'}
          className={`rounded-md border px-2.5 py-1.5 text-xs ${
            status === 'error'
              ? 'border-red-300/30 bg-red-500/15 text-red-100'
              : 'border-blue-300/30 bg-blue-500/15 text-blue-100'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
