# PRD: "Use My Location" — Auto-Detect Nearest Forecast Area

## 1. Overview

Add a "Use my location" button to the Add Location form that uses the browser Geolocation API to detect the user's position, finds the nearest Singapore forecast area, and automatically adds it to their location list. The goal is to reduce friction for the most common action: seeing weather for where you are right now.

## 2. Problem Statement

Currently, users must manually enter latitude/longitude coordinates to add a location. Most users don't know their coordinates off-hand, and the manual entry flow creates unnecessary friction for the simple intent of "show me weather for where I am."

## 3. User Stories

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| US-1 | As a user, I want to add my current location with one click so I can quickly see local weather. | Clicking "Use my location" triggers geolocation, matches the nearest forecast area, and adds it to my list. |
| US-2 | As a user, I want feedback while my location is being detected so I know something is happening. | Button shows "Locating..." with a spinner during the geolocation + add operation. |
| US-3 | As a user, I want to know if my location is already tracked so I don't get duplicates. | If the nearest area is already in the list, a toast says "You're nearest to [Area] — already in your list!" and highlights it. |
| US-4 | As a user, I want a clear message if location access fails so I know what to do next. | On permission denied or timeout, a descriptive error message appears with guidance. |
| US-5 | As a user outside Singapore, I want to understand why the feature didn't work. | If user is >15km from any forecast area, show "You don't appear to be in Singapore." |

## 4. Functional Requirements

### 4.1 Geolocation Acquisition

| Requirement | Decision |
|-------------|----------|
| API | `navigator.geolocation.getCurrentPosition()` |
| `enableHighAccuracy` | `false` — cell/WiFi precision (~100-300m) is sufficient for area matching |
| Timeout | 10,000 ms |
| Maximum age | 60,000 ms (accept cached position up to 1 minute old) |

### 4.2 Nearest Area Matching (Client-Side)

- Fetch forecast area metadata from the data.gov.sg 2-hour forecast API response (already available via the existing weather client).
- Expose area metadata from the backend's `GET /api/locations` response or add a lightweight `GET /api/areas` endpoint that proxies `area_metadata` from the forecast API.
- Use the **Haversine formula** to compute distance between user coordinates and each area centroid.
- Select the area with the minimum distance.
- **Boundary check:** If the minimum distance exceeds **15 km**, reject with an out-of-Singapore message.

### 4.3 Duplicate Detection

- Before calling `POST /api/locations`, compare the matched area name against existing locations in state (`store.locations`).
- Match on the `area` field (case-insensitive).
- If duplicate found: show informational toast, select the existing location, do not POST.

### 4.4 Auto-Add (No Confirmation)

- On successful match with no duplicate: immediately call `store.create()` with the area's centroid coordinates (`{ latitude, longitude }`).
- After creation, the new location is auto-selected (existing store behavior).

### 4.5 UI Placement & States

| State | Button Text | Visual |
|-------|-------------|--------|
| Idle | "Use my location" | Location pin icon + text, secondary style below manual inputs |
| In-flight | "Locating..." | Spinner icon, button disabled |
| Error | "Use my location" (re-enabled) | Error message in red below button |
| Not supported | *(button not rendered)* | — |

**Placement:** Inside `AddLocationForm`, rendered below the latitude/longitude inputs and above the Cancel/Add button row. Visible only when the form is expanded (`isAdding === true`).

### 4.6 Error Handling

| Scenario | User-Facing Message |
|----------|---------------------|
| Permission denied (`PERMISSION_DENIED`) | "Location access denied. You can allow it in your browser settings." |
| Position unavailable (`POSITION_UNAVAILABLE`) | "Couldn't determine your position. Try again or add manually." |
| Timeout (`TIMEOUT`) | "Location request timed out. Try again or add manually." |
| Outside Singapore (>15km) | "You don't appear to be in Singapore. This app covers Singapore forecast areas only." |
| Area metadata unavailable | "Forecast areas unavailable. Try again shortly." |
| `navigator.geolocation` undefined | Button not rendered (progressive enhancement) |

### 4.7 Logging

Log via existing `logInteraction()`:
- `geolocation_requested` — user clicked button
- `geolocation_succeeded` — coordinates obtained, includes `{ latitude, longitude, accuracy }`
- `geolocation_failed` — includes `{ errorCode, errorMessage }`
- `geolocation_area_matched` — includes `{ area, distanceKm }`
- `geolocation_duplicate_detected` — includes `{ area }`
- `geolocation_outside_singapore` — includes `{ distanceKm, nearestArea }`

## 5. Technical Design

### 5.1 New Files

| File | Purpose |
|------|---------|
| `frontend/src/utils/geolocation.ts` | Haversine function, `findNearestArea()`, geolocation wrapper |

### 5.2 Modified Files

| File | Changes |
|------|---------|
| `frontend/src/components/AddLocationForm.tsx` | Add "Use my location" button with geolocation flow |
| `backend/src/routes/locations.ts` | Add `GET /api/areas` endpoint returning area metadata from forecast API |
| `frontend/src/api.ts` | Add `fetchAreas()` client function |
| `frontend/src/types.ts` | Add `AreaMetadata` type |

### 5.3 Data Flow

```
User clicks "Use my location"
  → navigator.geolocation.getCurrentPosition()
  → GET /api/areas (fetches area_metadata from data.gov.sg)
  → findNearestArea(userCoords, areas) [Haversine, client-side]
  → Check distance < 15km
  → Check for duplicates in store.locations
  → store.create({ latitude: area.lat, longitude: area.lng })
  → Location added, auto-selected
```

### 5.4 Haversine Implementation

```typescript
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
```

## 6. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| Performance | Geolocation + area match + add completes within 12 seconds total (10s timeout + network) |
| Accessibility | Button has `aria-label="Detect my location"`. Loading state communicated via `aria-busy`. Error messages associated via `aria-describedby`. |
| Security | No coordinates are stored beyond what the existing location schema already captures. Works on localhost (secure context) without HTTPS. |
| Browser support | Progressive enhancement — button hidden if `navigator.geolocation` is unavailable. |
| Deployment | HTTPS required in production. Documented in code comment and README. |

## 7. Out of Scope

- Continuous location tracking / watch mode
- Background location updates
- Reverse geocoding to street address
- Custom area radius configuration
- Location permission prompt pre-check (`navigator.permissions.query`)
- Offline support for area matching

## 8. Success Metrics

| Metric | Target |
|--------|--------|
| Adoption rate | >30% of new locations added via geolocation within 2 weeks |
| Success rate | >90% of geolocation attempts result in a location being added or duplicate detected |
| Time to add | <5 seconds from button click to location visible (excluding permission prompt) |

## 9. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| User blocks geolocation permanently | Medium | Low | Clear error message with browser settings guidance; manual flow always available |
| data.gov.sg area metadata API down | Low | Medium | Cache area list for session; show "try again" on failure |
| GPS inaccuracy places user in wrong area | Low | Low | Low accuracy is still ~300m; areas are 2-5km apart — extremely unlikely to mismatch |
| Feature not discoverable | Medium | Medium | Button is prominent in the add-location form; consider onboarding tooltip in future |

## 10. Implementation Plan

### Phase 1 (MVP)
1. Create `GET /api/areas` backend endpoint
2. Create `frontend/src/utils/geolocation.ts` with Haversine + geolocation wrapper
3. Add `fetchAreas()` to `frontend/src/api.ts`
4. Add "Use my location" button to `AddLocationForm.tsx`
5. Implement full flow: detect → match → duplicate check → add
6. Add error handling for all failure modes
7. Add interaction logging

### Phase 2 (Polish, future)
- Onboarding tooltip on first visit
- Periodic re-detection suggestion ("Your weather might be stale")
- Visual indicator showing which location was auto-detected vs manually added
