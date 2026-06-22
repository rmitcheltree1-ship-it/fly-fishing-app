# NEXT_FEATURE.md

# Feature: Catch-Level Tracking

## Goal

Add individual catch tracking so the app can move beyond trip-level fish counts and eventually support meaningful fly, water, condition, and AI analytics.

The user should be able to log each fish caught during a trip and connect that fish to:

* Trip
* Water
* Fly used
* Time caught
* Species
* Length
* Photo
* Notes

---

## Why This Matters

Current trip logging tracks total fish landed and biggest fish.

That is useful, but it limits future insights.

Catch-level data unlocks:

* Best fly analytics
* Best fly by water
* Best fly by season
* Average fish size by fly
* Species trends
* Flow-based performance
* Weather-based performance
* AI fishing recommendations

This feature is the foundation for future intelligence.

---

## Primary User Story

As an angler, I want to quickly log each fish I catch during a trip so that I can later understand what worked, where it worked, and under what conditions.

---

## Requirements

## 1. Add Catch Data Model

Create a new catch entity linked to a trip.

Each catch should include:

* `id`
* `uid`
* `tripId`
* `tripUid`
* `riverId`
* `riverUid`
* `species`
* `lengthIn`
* `flyId`
* `flyUid`
* `caughtAt`
* `photoDataUrl`
* `notes`
* `createdAt`
* `updatedAt`
* `deleted`

Optional but useful:

* `waterTempF`
* `flowCFS`
* `airTempF`
* `weatherSummary`
* `lat`
* `lon`

---

## 2. IndexedDB

Add a new IndexedDB store:

```js
"catches"
```

The catches store should be included in synced stores if cloud sync is supported.

---

## 3. Supabase Sync

If cloud sync is active, catches should sync like trips, flies, rivers, leaders, and gear.

Rules:

* Each catch must have a stable `uid`
* Soft delete using `deleted: true`
* Use `updatedAt` for conflict resolution
* Keep local IndexedDB as the primary offline store

---

## 4. Trip Detail Screen

On each trip detail screen, add a new section:

```text
Catches
```

Display:

* Species
* Length
* Fly used
* Time caught
* Photo thumbnail if available

Example:

```text
Rainbow Trout · 14 in
Chubby Chernobyl · 11:42 AM
```

---

## 5. Add Catch Flow

From a trip detail screen, user can tap:

```text
Add Catch
```

Fields:

* Species
* Length
* Fly used
* Time caught
* Photo
* Notes

Defaults:

* Time caught defaults to now
* Fly selector should use existing Fly Box records
* Water should inherit from the trip
* Conditions should inherit from the trip if available

---

## 6. Fast Logging Mode

During an active fishing session, the user should be able to quickly add a catch.

Minimum fast-log interaction:

* Tap `+`
* Increment fish count
* Optionally open quick catch form

Quick catch form should prioritize speed:

* Species
* Length
* Fly
* Save

Success criteria:

The user can log a basic catch in under 10 seconds.

---

## 7. Backward Compatibility

Existing trips currently have trip-level fields like:

* fish landed
* biggest fish
* flies used

Do not break existing trips.

For now:

* Keep existing trip-level fish count fields
* Add catch-level records as a new capability
* Reports can continue using trip totals if no catch records exist

Future migration can optionally create placeholder catch records from old trip totals, but do not do that yet.

---

## 8. Insights Update

Update Insights to use catch records when available.

Initial metrics:

* Total catches
* Average length
* Biggest fish
* Top fly by catch count
* Top water by catch count

Fallback:

If no catch records exist, continue using trip-level totals.

---

## 9. Fly Box Update

Each fly detail page should eventually show catch history.

For this feature, add only the foundation:

* Catch records should link to fly records by `flyUid`
* Do not build full fly analytics yet unless simple and low-risk

---

## Out of Scope

Do not build these yet:

* AI recommendations
* Hatch prediction
* Public sharing
* Social features
* Complex charts
* GPS trip tracks
* Full fly analytics dashboard
* Species-specific prediction engine

---

## Acceptance Criteria

This feature is complete when:

* A user can add individual catches to a trip
* A catch can be linked to a fly
* A catch can include species, length, time, photo, and notes
* Catches display on the trip detail screen
* Catch data persists locally in IndexedDB
* Catch data syncs through Supabase if the user is logged in
* Existing trips still work
* Insights can count catches when catch records exist
* The app remains usable offline

---

## Implementation Guidance

Prioritize minimal, stable architecture over visual polish.

Recommended order:

1. Add catches store
2. Add catch CRUD helpers
3. Add catch sync support
4. Add trip detail catch list
5. Add add/edit catch modal
6. Add fast catch logging from active session
7. Update Insights to read catches
8. Test with existing trip data

---

## Important Principle

Do not overbuild this feature.

The goal is not to create perfect analytics immediately.

The goal is to create clean catch-level data so future analytics and AI recommendations have something meaningful to reason over.
