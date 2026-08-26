# Riffle — River Guide & Journal

Riffle is a modern river guidebook and fishing journal for the Western US (CO, MT, WY, ID, UT). It runs in any browser, installs to your phone home screen, and uses live data from the U.S. Geological Survey and Open-Meteo.

There is no build step. IndexedDB remains the offline source of truth; optional Supabase accounts securely sync supported records between devices. Voice memos remain device-local.

## What's in the box

```
Riffle/
├── index.html       The app (HTML structure + styles)
├── app.js           All the logic — UI, IndexedDB, API calls, voice memos
├── manifest.json    PWA manifest so you can "Add to Home Screen"
├── sw.js            Service worker for offline use
├── icon.svg / .png  App icon
└── FlyFishingApp/   Old iOS project — ignore, it requires a Mac
```

The only files you need to host or open are the ones at the top level.

## Two ways to run it

### 1. Quickest: open it on your computer

Just double-click `index.html` and it opens in your default browser. Most things work (river search, trip log, fly cards), but three things require HTTPS hosting:

- **Live river conditions** — the USGS API returns 403 for requests from `file://` origins. Flow, water temp, and gauge height will show `—` until the app is hosted.
- "Add to Home Screen" on iPhone (PWA install)
- Voice memos on some mobile browsers (mic API often requires HTTPS)

### 2. Best experience: host it for free and install on your iPhone

If you want it on your phone, you need to put the files on the internet so iOS can load them over HTTPS. The easiest, no-account option:

1. Go to https://app.netlify.com/drop
2. Drag the **Riffle** project folder onto the page (just the top-level files, not the `FlyFishingApp/` iOS folder — but it'll work either way).
3. Netlify gives you a URL like `https://random-name-123.netlify.app`.
4. On your iPhone, open that URL in **Safari** (not Chrome — iOS only allows home-screen install from Safari).
5. Tap the share button → **Add to Home Screen**. Done — it now launches like a real app.

Free forever. No login required for the initial drop. If you want a permanent URL, sign in with email and you can claim the site.

Other free hosting options that work the same way: Cloudflare Pages, GitHub Pages, Vercel.

## What it does

**Rivers tab.** 27 preloaded Western US rivers seeded on first launch. Search by name, state, or section. Star your favorites — they pin to the top. Tap any river to see live flow (CFS), water temperature, gauge height, plus current air temp, wind speed + direction, surface pressure, precipitation, cloud cover, and humidity, with a mini-map of the gauge location. Pull-refresh updates everything from USGS + Open-Meteo.

**Trips tab.** Log a new fishing outing. The "Snapshot conditions" button captures everything at the moment you press it: your current GPS coordinates (with permission), live river flow, current weather. Add the flies you used, your leader setup, fish count, biggest fish, and notes. Record voice memos right from the form — they save into the trip and play back on the detail view. The conditions stay frozen with the trip even if the river changes.

**Flies tab.** Card grid of 14 starter patterns (Parachute Adams, Pheasant Tail, Woolly Bugger, Chubby Chernobyl, RS2, etc.) filtered by type (Dry / Nymph / Streamer / Emerger / Terrestrial). Each card shows hook sizes, what it imitates, and best conditions. Tap to see the full detail and attach a photo from your phone library.

**Leaders tab.** 7 quick-start rigs covering technical dries, freestone dries, two-fly indicator nymphing, Euro nymphing, hopper-dropper, floating-line streamers, and sinking-tip streamers. Each one shows the rod weight, leader length, taper, tippet, an ASCII rig diagram, and tactical tips.

**Map tab.** Every river + every logged trip on one map. River pins are teal, trips are gold. Tap a pin to open its detail.

## Adding your own rivers

Tap **+** on the Rivers tab. You'll need:
- River name + state
- USGS gauge **site code** — find one at https://waterdata.usgs.gov/nwis/rt. Pick a real-time site, copy the 8-15 digit "Site Number".
- Lat/lon for the gauge (visible on the USGS site page).

## Permissions

The app will ask for:
- **Location** — optional, only when you tap "Snapshot conditions" on a new trip. If denied, it uses the selected river's gauge coordinates instead.
- **Microphone** — only when you tap Record on a voice memo.

Conditions requests go to public river and weather providers. When you choose to sign in, supported journal records sync through Supabase under per-user row-level security. AI season summaries use an authenticated Supabase Edge Function.

## Data sources

- **USGS Water Services** → flow CFS (param 00060), water temp (00010, converted °C → °F), gauge height (00065). Endpoint: `waterservices.usgs.gov/nwis/iv/`
- **Open-Meteo** → current weather. Endpoint: `api.open-meteo.com/v1/forecast`. Returns Fahrenheit, mph, inches per request params.

Both have CORS enabled so the browser can call them directly.

## Where your data lives

Everything is stored first in IndexedDB and survives reloads and offline use. When signed in, waters, trips, flies, leaders, and gear sync through Supabase. Voice memos remain on the device where they were recorded.

To wipe everything and re-seed, open your browser's DevTools → Application → IndexedDB → delete `flyfish-db`. Reload.

## Tweaking it

| Want to change... | Edit |
|---|---|
| Preloaded rivers | `app.js` → `SEED_RIVERS` |
| Preloaded flies | `app.js` → `SEED_FLIES` |
| Preloaded leaders | `app.js` → `SEED_LEADERS` |
| Color theme | `index.html` → `:root` CSS variables |
| Default map view | `app.js` → `renderMap` → `setView(...)` |
