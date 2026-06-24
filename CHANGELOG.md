# CHANGELOG.md

All notable changes to the Fishing Intelligence App should be documented here.

---

# Unreleased

## Planned

### Catch-Level Tracking

* Add Catch entity
* Link catches to trips
* Link catches to flies
* Link catches to waters
* Add catch photos
* Add catch notes
* Update Insights to use catch data

---

# 2026-06-22

## Current State Snapshot

### Infrastructure

* IndexedDB local storage
* Supabase cloud sync
* Authentication support
* Progressive Web App support
* Service worker caching
* Offline-first architecture

### Waters

* River library
* Stillwater library
* Favorites
* Custom waters
* Maps
* Live USGS flow data
* Colorado DWR integration
* Weather integration
* Forecast integration

### Trip Logging

* Trip creation
* Gear tracking
* Fly tracking
* Leader tracking
* Photo support
* Notes
* Voice memos
* Fish landed totals
* Largest fish tracking

### Fly Box

* Fly catalog
* Favorites
* Search
* User-created flies

### Insights

* Seasonal statistics
* Water statistics
* AI-generated summaries

---

# Changelog Rules

When completing a feature:

1. Add date
2. Add feature summary
3. Add major technical changes
4. Add database changes
5. Add breaking changes (if any)

Example:

## 2026-07-15

### Catch Tracking

Added:

* Catch entity
* Catch CRUD
* Catch sync

Database:

* Added catches store
* Added catches table in Supabase

Notes:

* Existing trips remain compatible
