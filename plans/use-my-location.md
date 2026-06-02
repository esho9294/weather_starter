# Plan: Use My Location

> Source PRD: `docs/prd-use-my-location.md`

## Architectural decisions

Durable decisions that apply across all phases:

- **Routes**: `GET /api/areas` — returns forecast area metadata (name + coordinates) from data.gov.sg
- **Schema**: No DB changes — reuses existing `locations` table as-is
- **Key models**: `AreaMetadata` type — `{ name: string; latitude: number; longitude: number }`
- **Third-party boundary**: data.gov.sg 2-hour forecast API, `area_metadata` field
- **Geolocation config**: `enableHighAccuracy: false`, timeout `10000ms`, maxAge `60000ms`
- **Distance threshold**: 15 km max distance from any area centroid (Haversine)
- **Duplicate matching**: Compare matched area `name` against `location.area` in store (case-insensitive)

---

## Phase 1: Area Metadata Endpoint + Nearest Matching

**User stories**: US-1 (partial — backend plumbing + matching logic)

### What to build

A backend endpoint that proxies the `area_metadata` array from the data.gov.sg 2-hour forecast response, returning a flat list of area names with their centroid coordinates. On the frontend, a utility function that accepts user coordinates and the area list, then uses the Haversine formula to return the nearest area and its distance in km.

### Acceptance criteria

- [ ] `GET /api/areas` returns JSON array of `{ name, latitude, longitude }` objects (~47 areas)
- [ ] Frontend `fetchAreas()` API client function can retrieve the list
- [ ] `findNearestArea(userLat, userLng, areas)` returns `{ area, distanceKm }` using Haversine
- [ ] Haversine produces correct distance (e.g., Ang Mo Kio centroid to Bishan centroid ≈ 2km)

---

## Phase 2: Happy-Path Geolocation → Auto-Add

**User stories**: US-1, US-2

### What to build

A "Use my location" button inside the Add Location form that triggers browser geolocation, fetches area metadata, computes the nearest area, and calls the existing `store.create()` with the area's centroid coordinates. The button shows a "Locating..." spinner while the operation is in flight and is disabled to prevent double-clicks.

### Acceptance criteria

- [ ] "Use my location" button appears in the expanded Add Location form below the coordinate inputs
- [ ] Clicking the button requests geolocation with `enableHighAccuracy: false`, timeout 10s
- [ ] Button transitions to disabled "Locating..." state with spinner during the operation
- [ ] On success, the nearest area's coordinates are passed to `store.create()` and the location appears in the list
- [ ] The newly added location is auto-selected

---

## Phase 3: Duplicate Detection + Selection

**User stories**: US-3

### What to build

Before calling `store.create()`, check whether the matched area name already exists in the current locations list. If it does, skip the creation, select the existing location, and display an informational message indicating the area is already tracked.

### Acceptance criteria

- [ ] If matched area name matches an existing `location.area` (case-insensitive), no POST is made
- [ ] The existing location is selected in the UI
- [ ] An informational message appears: "You're nearest to [Area] — already in your list!"
- [ ] The message dismisses after a few seconds or on user interaction

---

## Phase 4: Error Handling + Boundary Check

**User stories**: US-4, US-5

### What to build

Handle all geolocation failure modes and the out-of-Singapore boundary case. Each scenario shows a specific, actionable error message below the button. The button returns to its idle state after an error so the user can retry.

### Acceptance criteria

- [ ] Permission denied → "Location access denied. You can allow it in your browser settings."
- [ ] Position unavailable → "Couldn't determine your position. Try again or add manually."
- [ ] Timeout → "Location request timed out. Try again or add manually."
- [ ] Nearest area >15km away → "You don't appear to be in Singapore. This app covers Singapore forecast areas only."
- [ ] Area metadata fetch failure → "Forecast areas unavailable. Try again shortly."
- [ ] After any error, button returns to idle state and can be clicked again

---

## Phase 5: Logging + Progressive Enhancement

**User stories**: All (cross-cutting)

### What to build

Add interaction logging for every step of the geolocation flow using the existing `logInteraction()` utility. Implement progressive enhancement so the button is only rendered when `navigator.geolocation` is available. Add accessibility attributes to the button and error messages.

### Acceptance criteria

- [ ] `logInteraction` called for: `geolocation_requested`, `geolocation_succeeded`, `geolocation_failed`, `geolocation_area_matched`, `geolocation_duplicate_detected`, `geolocation_outside_singapore`
- [ ] Button not rendered when `navigator.geolocation` is undefined
- [ ] Button has `aria-label="Detect my location"` and `aria-busy="true"` during loading
- [ ] Error messages associated with the button via `aria-describedby`
