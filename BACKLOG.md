# Fly Fishing App — Feature Backlog

## In Progress / Done
- [x] Earth & Stone light theme
- [x] River cards — CFS displayed prominently on right
- [x] Flow trend arrows (↑ rising / ↓ falling) — activates after second refresh of same river
- [x] Conditions split into USGS · River and Weather · Now sections
- [x] USGS 403 fix (app must be hosted, not opened via file://)
- [x] Delete river button in river detail modal
- [x] Auto-populate Add River form from USGS site code lookup
- [x] Quick Session — one-tap start, live fish counter banner, end-session fly picker
- [x] Hero card swiper — starred rivers as large gradient cards above the river list

## Backlog

### High Priority
- [ ] **Hatch cycles** — per-river seasonal hatch table (insect, month, time of day, recommended fly). Static data, shown on river detail.
- [ ] **Audio file import** — pick an existing `.m4a`/`.mp3` from phone library into a trip memo, instead of recording live only.
- [ ] **Fly photos** — seed Wikimedia Commons images for the 14 stock patterns; add bulk import rather than one-at-a-time.

### Medium Priority
- [ ] **AI fly recommendations** — given current flow, water temp, season, and time of day, suggest 2–3 flies and tactics via Claude API.
- [ ] **Fly shop report scraping** — pull weekly river reports from shops (Ark Anglers, Duranglers, etc.), summarize with Claude, surface on river detail.
- [ ] **3-day weather forecast** — Open-Meteo already returns forecast data free; add a forecast strip to river detail.
- [ ] **Trip photo** — photo attachment on trip log (same pattern as fly card photos).
- [ ] **Edit / delete custom rivers** — currently custom rivers can be added but not modified or removed.

### Lower Priority
- [ ] **JSON export / import** — backup and restore all trips, rivers, and settings from a single file.
- [ ] **Cross-device sync** — requires a small backend; data currently lives in one browser's IndexedDB only.
- [ ] **Further UI polish** — complete Earth & Stone theme refinements, light/dark toggle.
- [ ] **DB migration strategy** — schema versioning so future changes don't require users to wipe their data.
- [ ] **Conditions-to-fly hint** — simple rule-based suggestion ("63°F + 450 CFS → try RS2 in the film") without AI.
