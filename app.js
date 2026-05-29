/*
 * Fly Fishing — single-file web app.
 * Vanilla JS. No build step. Persists to IndexedDB.
 * Live data from USGS Water Services and Open-Meteo (both free, no key).
 */

// ---------- constants ----------

const CARD_GRADIENTS = [
  ["#0d3d2a", "#226b48"],  // teal
  ["#0d2240", "#1a4070"],  // blue
  ["#2d1810", "#5c3520"],  // warm brown
  ["#0d2d1a", "#1a5c36"],  // forest
  ["#1a0d30", "#3a1a60"],  // purple
  ["#2a1e08", "#56401a"],  // amber
];

// ---------- CO expansion rivers (migration v2) ----------
// Added after initial release — applied to existing DBs automatically in seedIfNeeded.

const CO_EXPANSION_RIVERS = [
  { name: "South Platte River", state: "CO", section: "11 Mile Canyon",         siteCode: "06701000", lat: 38.9244, lon: -105.5614 },
  { name: "South Platte River", state: "CO", section: "Dream Stream",            siteCode: "06695500", lat: 38.9133, lon: -105.6481 },
  { name: "Arkansas River",     state: "CO", section: "Parkdale / Royal Gorge",  siteCode: "07094500", lat: 38.5085, lon: -105.3617 },
  { name: "Arkansas River",     state: "CO", section: "Above Pueblo",            siteCode: "07096000", lat: 38.3378, lon: -104.6914 },
  { name: "Cache la Poudre",    state: "CO", section: "Poudre Canyon",           siteCode: "06752000", lat: 40.6761, lon: -105.1619 },
  { name: "Rio Grande",         state: "CO", section: "Wagon Wheel Gap",         siteCode: "08220000", lat: 37.7728, lon: -106.8058 },
  { name: "Dolores River",      state: "CO", section: "Below McPhee Dam",        siteCode: "09168500", lat: 37.6044, lon: -108.5011 },
  { name: "Clear Creek",        state: "CO", section: "Clear Creek Canyon",      siteCode: "06716500", lat: 39.7567, lon: -105.2236 },
];

// ---------- seed data ----------

const SEED_RIVERS = [
  // Colorado
  { name: "South Platte River", state: "CO", section: "Cheesman Canyon", siteCode: "06701900", lat: 39.2272, lon: -105.2825 },
  { name: "South Platte River", state: "CO", section: "Deckers",         siteCode: "06701900", lat: 39.2719, lon: -105.2167 },
  { name: "Arkansas River",     state: "CO", section: "Buena Vista to Salida", siteCode: "07091200", lat: 38.5380, lon: -106.0028 },
  { name: "Colorado River",     state: "CO", section: "Glenwood Canyon", siteCode: "09085000", lat: 39.5505, lon: -107.3242 },
  { name: "Frying Pan River",   state: "CO", section: "Below Ruedi Dam", siteCode: "09080400", lat: 39.3678, lon: -106.8214 },
  { name: "Roaring Fork River", state: "CO", section: "Aspen to Basalt", siteCode: "09073400", lat: 39.4006, lon: -107.0331 },
  { name: "Gunnison River",     state: "CO", section: "Gunnison Gorge",  siteCode: "09128000", lat: 38.5447, lon: -107.7064 },
  { name: "Eagle River",        state: "CO", section: "Avon to Wolcott", siteCode: "09067005", lat: 39.6464, lon: -106.7194 },
  { name: "North Platte River", state: "CO", section: "Northgate Canyon", siteCode: "06614800", lat: 40.9636, lon: -106.3303 },
  { name: "Blue River",         state: "CO", section: "Below Dillon Reservoir", siteCode: "09050700", lat: 39.6253, lon: -106.0731 },
  // Montana
  { name: "Madison River",      state: "MT", section: "Three Dollar Bridge", siteCode: "06041000", lat: 44.8181, lon: -111.5375 },
  { name: "Yellowstone River",  state: "MT", section: "Yankee Jim Canyon",   siteCode: "06191500", lat: 45.1117, lon: -110.7794 },
  { name: "Bighorn River",      state: "MT", section: "Below Afterbay",      siteCode: "06287000", lat: 45.3175, lon: -107.9447 },
  { name: "Big Hole River",     state: "MT", section: "Melrose to Glen",     siteCode: "06025500", lat: 45.6385, lon: -112.6840 },
  { name: "Missouri River",     state: "MT", section: "Below Holter Dam",    siteCode: "06066500", lat: 47.0264, lon: -111.9217 },
  { name: "Gallatin River",     state: "MT", section: "Gallatin Canyon",     siteCode: "06043500", lat: 45.4889, lon: -111.2839 },
  { name: "Beaverhead River",   state: "MT", section: "Below Clark Canyon",  siteCode: "06016000", lat: 45.0192, lon: -112.8633 },
  // Wyoming
  { name: "Snake River",        state: "WY", section: "Jackson Hole",        siteCode: "13013650", lat: 43.5417, lon: -110.7472 },
  { name: "North Fork Shoshone",state: "WY", section: "Wapiti to Cody",      siteCode: "06281000", lat: 44.4711, lon: -109.4225 },
  { name: "Green River",        state: "WY", section: "Below Fontenelle",    siteCode: "09211200", lat: 42.0292, lon: -110.0644 },
  { name: "North Platte River", state: "WY", section: "Miracle Mile",        siteCode: "06630000", lat: 42.2014, lon: -106.7497 },
  // Idaho
  { name: "Henrys Fork",        state: "ID", section: "Box Canyon to Last Chance", siteCode: "13042500", lat: 44.4925, lon: -111.3697 },
  { name: "South Fork Snake",   state: "ID", section: "Below Palisades",     siteCode: "13037500", lat: 43.4039, lon: -111.1939 },
  { name: "Silver Creek",       state: "ID", section: "Picabo",              siteCode: "13150430", lat: 43.3197, lon: -114.1158 },
  // Utah
  { name: "Green River",        state: "UT", section: "A Section — Flaming Gorge", siteCode: "09234500", lat: 40.9089, lon: -109.4225 },
  { name: "Provo River",        state: "UT", section: "Middle Provo",        siteCode: "10155500", lat: 40.5444, lon: -111.4031 },
  { name: "Weber River",        state: "UT", section: "Below Echo Reservoir",siteCode: "10128500", lat: 40.9461, lon: -111.4400 },
];

const SEED_FLIES = [
  // Dries
  { name: "Parachute Adams",     type: "Dry",        sizes: "12–22", imitates: "Mayflies (general), BWO, PMD", conditions: "Overcast, mayfly hatch in progress", notes: "The most versatile dry in the box. Match size to hatch." },
  { name: "Elk Hair Caddis",     type: "Dry",        sizes: "12–18", imitates: "Adult caddis", conditions: "Riffles, evening rises, summer caddis hatches", notes: "Skate or dead-drift. Olive, tan, and black work." },
  { name: "Royal Wulff",         type: "Dry",        sizes: "10–16", imitates: "Attractor — broad mayfly profile", conditions: "Pocket water, low light, fast water", notes: "Highly visible — great searcher in tumbling water." },
  { name: "Stimulator",          type: "Dry",        sizes: "8–14",  imitates: "Stoneflies, hoppers, caddis", conditions: "Summer freestone rivers", notes: "Floats high — good hopper-dropper anchor." },
  { name: "Griffith's Gnat",     type: "Dry",        sizes: "18–24", imitates: "Midge cluster", conditions: "Tailwater winters, midge hatches", notes: "Tiny and deadly when fish are sipping midges." },
  // Nymphs
  { name: "Pheasant Tail Nymph", type: "Nymph",      sizes: "14–22", imitates: "Mayfly nymph (BWO, PMD)", conditions: "Year-round, especially pre-hatch", notes: "Tungsten beadhead versions sink faster." },
  { name: "Hare's Ear",          type: "Nymph",      sizes: "10–18", imitates: "Generic mayfly / caddis nymph", conditions: "Almost always", notes: "Buggy and impressionistic. Carry beadhead + unweighted." },
  { name: "Copper John",         type: "Nymph",      sizes: "12–20", imitates: "Heavy attractor nymph", conditions: "Deep runs, point fly in a tandem rig", notes: "Use as your anchor — gets the dropper down." },
  { name: "Zebra Midge",         type: "Nymph",      sizes: "18–22", imitates: "Midge pupa", conditions: "Tailwaters, winter, slow runs", notes: "Black/silver and red/copper both crush it." },
  { name: "RS2",                 type: "Emerger",    sizes: "18–22", imitates: "Emerging BWO / midge", conditions: "Tailwater, slack water, pre-hatch", notes: "Fish in the film or as a dropper." },
  // Streamers
  { name: "Woolly Bugger",       type: "Streamer",   sizes: "6–12",  imitates: "Sculpin, leech, baitfish", conditions: "Stained water, low light, aggressive fish", notes: "Black, olive, and white. Strip-pause retrieve." },
  { name: "Sculpzilla",          type: "Streamer",   sizes: "4–8",   imitates: "Sculpin", conditions: "Big-fish water, off-color flows", notes: "Get it deep, swing or dead-drift then strip." },
  // Terrestrials
  { name: "Chubby Chernobyl",    type: "Terrestrial",sizes: "8–14",  imitates: "Hopper / stonefly hybrid", conditions: "Summer freestones, hopper-dropper rigs", notes: "Tan, purple, gold all reliable." },
  { name: "Foam Ant",            type: "Terrestrial",sizes: "14–18", imitates: "Black or cinnamon ant", conditions: "Warm afternoons, banks, summer", notes: "Don't underestimate — picky fish eat ants." },
];

const SEED_LEADERS = [
  { name: "Dry Fly — Technical", situation: "Spring creeks, tailwaters, picky risers on flat water",
    rod: "3–5 wt", length: "12 ft", taper: "5X tapered", tippet: "18–24 in of 5X or 6X",
    diagram: "Fly line ─── 9ft 5X leader ─── 18–24in 5X/6X tippet ─── dry",
    tips: "Long, fine tippet = drag-free drifts. Use floatant only on the fly, not the tippet." },
  { name: "Dry Fly — Freestone", situation: "Pocket water, riffles, attractors like Stimulators and Wulffs",
    rod: "4–6 wt", length: "9 ft", taper: "4X tapered", tippet: "12 in of 4X",
    diagram: "Fly line ─── 9ft 4X leader ─── 12in 4X tippet ─── dry",
    tips: "Short and stout. Easy to mend in fast water." },
  { name: "Two-Fly Nymph (Indicator)", situation: "Standard nymphing under a thingamabobber or yarn indicator",
    rod: "5–6 wt", length: "7.5–9 ft", taper: "3X tapered", tippet: "18 in 4X to anchor + 12–18 in 5X dropper",
    diagram: "Indicator\n  │\n  ├── 7.5–9ft 3X leader\n  ├── 18in 4X tippet ─ anchor (heavy)\n  └── 12–18in 5X tag ─ dropper (small)",
    tips: "Indicator at ~1.5× water depth from anchor fly. Add split shot above the knot if not getting down." },
  { name: "Euro / Tight-Line Nymph", situation: "High-stick contact nymphing in moderate-depth runs",
    rod: "3–4 wt euro rod", length: "20 ft + sighter", taper: "Level mono / fluoro", tippet: "Sighter → 4–5 ft of 5X tippet → anchor, dropper 12in above",
    diagram: "Long mono leader ─── sighter ─── 5X tippet\n                                    │\n                            12in tag ─ dropper\n                                    │\n                                  tungsten anchor",
    tips: "Tag knot is a tippet ring or triple surgeon's. Lead the flies — keep a tight line." },
  { name: "Hopper-Dropper", situation: "Summer freestones, banks, attractor + nymph",
    rod: "5–6 wt", length: "9 ft", taper: "3X tapered", tippet: "24–36 in of 4X off the hopper bend → nymph",
    diagram: "9ft 3X leader ─── big foam hopper\n                       │ (off hook bend)\n                       └── 24–36in 4X tippet ─ small nymph",
    tips: "Hopper hook bend, not the eye. Adjust dropper length to water depth." },
  { name: "Streamer — Floating Line", situation: "Shallow runs, banks, sight-fishing streamers",
    rod: "6–8 wt", length: "7.5 ft", taper: "1X or 0X tapered", tippet: "18 in of 0X–2X fluorocarbon",
    diagram: "Fly line ─── 7.5ft 1X leader ─── 18in 0X/1X fluoro ─── streamer (loop knot)",
    tips: "Loop knot for action. Vary strip cadence to find what they want." },
  { name: "Streamer — Sinking Tip", situation: "Deep runs, off-color water, big-fish hunting",
    rod: "6–8 wt", length: "4–5 ft (short)", taper: "Straight fluorocarbon", tippet: "4–5 ft of 0X–2X fluoro",
    diagram: "Sinking tip line ─── 4–5ft 0X/1X fluoro ─── big articulated streamer",
    tips: "Short leader keeps the fly down with the tip. Long pauses can trigger eats." },
];

const FLY_TYPES = ["Dry", "Nymph", "Streamer", "Emerger", "Terrestrial", "Wet"];

// ---------- Supabase cloud sync config ----------
// The anon key + project URL are designed to be public; security comes from
// Row Level Security (each user only ever sees their own rows). Safe to ship.

const SUPABASE_URL = "https://lauhleqlrzewxfdtxkyp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdWhsZXFscnpld3hmZHR4a3lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5OTgyOTQsImV4cCI6MjA5NTU3NDI5NH0.YH7mkcaab-iFTHFTz-z_0eRjEEFVe5kSx_UPsOax0M4";

// Stores that mirror to the cloud. (memos + meta stay device-local.)
const SYNCED_STORES = ["rivers", "trips", "flies", "leaders", "gear"];

// Gear categories tracked per the user's setup (rods, waders, boots).
const GEAR_TYPES = ["Rod", "Waders", "Boots", "Other"];

// Baseline timestamp stamped onto freshly-seeded default data, so that a genuine
// cloud edit (always newer) wins over a default that a new device just re-seeded.
const SEED_TS = Date.parse("2020-01-01T00:00:00Z");

// uid helpers — a stable, cross-device string id. Local IndexedDB keeps its own
// integer `id`; `uid` is what travels to the cloud and links records between devices.
function slug(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function randUid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
// Deterministic uids for seed/default records so two devices that both seed the
// defaults converge on the same id instead of duplicating them.
function seedRiverUid(r)  { return `seed-r-${r.siteCode}-${slug(r.section)}`; }
function seedFlyUid(f)    { return `seed-f-${slug(f.name)}`; }
function seedLeaderUid(l) { return `seed-l-${slug(l.name)}`; }

// ---------- IndexedDB ----------

const DB_NAME = "flyfish-db";
const DB_VERSION = 2; // v2 adds the "gear" store
const STORES = ["rivers", "trips", "memos", "flies", "leaders", "gear", "meta"];

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      for (const s of STORES) {
        if (!db.objectStoreNames.contains(s)) {
          db.createObjectStore(s, { keyPath: "id", autoIncrement: true });
        }
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx(db, store, mode = "readonly") {
  return db.transaction(store, mode).objectStore(store);
}

function dbGetAll(db, store) {
  return new Promise((res, rej) => {
    const r = tx(db, store).getAll();
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

function dbGet(db, store, id) {
  return new Promise((res, rej) => {
    const r = tx(db, store).get(id);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

function dbPut(db, store, value) {
  if (SYNCED_STORES.includes(store)) {
    // _fromSync marks writes that originate from a cloud pull — those must NOT
    // re-stamp updatedAt (keep the remote timestamp) and must NOT push back up.
    const fromSync = value._fromSync === true;
    delete value._fromSync;
    if (!value.uid) value.uid = randUid(store[0]);
    if (value.deleted === undefined) value.deleted = false;
    if (!fromSync) value.updatedAt = Date.now();
    return new Promise((res, rej) => {
      const r = tx(db, store, "readwrite").put(value);
      r.onsuccess = () => { if (!fromSync) pushRecord(store, value); res(r.result); };
      r.onerror = () => rej(r.error);
    });
  }
  return new Promise((res, rej) => {
    const r = tx(db, store, "readwrite").put(value);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

function dbDelete(db, store, id) {
  return new Promise((res, rej) => {
    const r = tx(db, store, "readwrite").delete(id);
    r.onsuccess = () => res();
    r.onerror = () => rej(r.error);
  });
}

async function seedIfNeeded(db) {
  // Initial seed
  const seeded = await dbGet(db, "meta", 1);
  if (!seeded) {
    for (const r of SEED_RIVERS) {
      await dbPut(db, "rivers", { ...r, favorite: false, custom: false, lastCFS: null, lastWaterTempF: null, lastReadingAt: null, uid: seedRiverUid(r), updatedAt: SEED_TS, deleted: false, _fromSync: true });
    }
    for (const f of SEED_FLIES) {
      await dbPut(db, "flies", { ...f, favorite: false, imageDataUrl: null, uid: seedFlyUid(f), updatedAt: SEED_TS, deleted: false, _fromSync: true });
    }
    for (const l of SEED_LEADERS) {
      await dbPut(db, "leaders", { ...l, uid: seedLeaderUid(l), updatedAt: SEED_TS, deleted: false, _fromSync: true });
    }
    await dbPut(db, "meta", { id: 1, value: true });
  }

  // Migration v2 — add CO expansion rivers to existing databases
  const v2 = await dbGet(db, "meta", 2);
  if (!v2) {
    const existing = await dbGetAll(db, "rivers");
    const existingSiteCodes = new Set(existing.map(r => r.siteCode));
    for (const r of CO_EXPANSION_RIVERS) {
      if (!existingSiteCodes.has(r.siteCode)) {
        await dbPut(db, "rivers", { ...r, favorite: false, custom: false, lastCFS: null, lastWaterTempF: null, lastReadingAt: null, uid: seedRiverUid(r), updatedAt: SEED_TS, deleted: false, _fromSync: true });
      }
    }
    await dbPut(db, "meta", { id: 2, value: true });
  }

  // Migration v3 — fix coordinates + add Clear Creek; update rivers already in DB by siteCode
  const v3 = await dbGet(db, "meta", 3);
  if (!v3) {
    const coordFixes = {
      "06701000": { lat: 38.9244, lon: -105.5614 },  // 11 Mile Canyon — was pointing at reservoir, not gauge
      "06695000": null,                                // remove bad Dream Stream entry (wrong gauge/location)
      "06695500": { lat: 38.9133, lon: -105.6481 },  // Dream Stream correct gauge
    };
    const newEntries = ["06695500", "06716500"];      // may need inserting if not present
    const all = await dbGetAll(db, "rivers");
    const bySiteCode = {};
    for (const r of all) bySiteCode[r.siteCode] = r;

    for (const [code, fix] of Object.entries(coordFixes)) {
      if (fix === null) {
        // Remove the bad entry
        if (bySiteCode[code]) await dbDelete(db, "rivers", bySiteCode[code].id);
      } else if (bySiteCode[code]) {
        // Update coordinates in place
        await dbPut(db, "rivers", { ...bySiteCode[code], lat: fix.lat, lon: fix.lon, _fromSync: true });
      }
    }
    // Add any new rivers not yet in DB
    const existingAfter = new Set((await dbGetAll(db, "rivers")).map(r => r.siteCode));
    for (const r of CO_EXPANSION_RIVERS) {
      if (newEntries.includes(r.siteCode) && !existingAfter.has(r.siteCode)) {
        await dbPut(db, "rivers", { ...r, favorite: false, custom: false, lastCFS: null, lastWaterTempF: null, lastReadingAt: null, uid: seedRiverUid(r), updatedAt: SEED_TS, deleted: false, _fromSync: true });
      }
    }
    await dbPut(db, "meta", { id: 3, value: true });
  }

  // Migration v4 — switch 11 Mile Canyon + Dream Stream from USGS to CO DWR source.
  // DWR stations (PLAGEOCO, PLAHARCO) are the authoritative gauges for these sections.
  const v4 = await dbGet(db, "meta", 4);
  if (!v4) {
    const all = await dbGetAll(db, "rivers");
    const bySiteCode = {};
    for (const r of all) bySiteCode[r.siteCode] = r;

    const dwrSwitches = [
      { oldCode: "06701000", abbrev: "PLAGEOCO", lat: 38.905278, lon: -105.473338, name: "South Platte River", section: "11 Mile Canyon" },
      { oldCode: "06695500", abbrev: "PLAHARCO", lat: 38.967805, lon: -105.581544, name: "South Platte River", section: "Dream Stream"   },
    ];
    for (const u of dwrSwitches) {
      if (bySiteCode[u.oldCode]) {
        await dbPut(db, "rivers", {
          ...bySiteCode[u.oldCode],
          name:           u.name,
          section:        u.section,
          siteCode:       u.abbrev,
          source:         "dwr",
          lat:            u.lat,
          lon:            u.lon,
          lastCFS:        null,
          prevCFS:        null,
          lastWaterTempF: null,
          lastReadingAt:  null,
          uid:            seedRiverUid({ siteCode: u.abbrev, section: u.section }),
          updatedAt:      SEED_TS,
          deleted:        false,
          _fromSync:      true,
        });
      }
    }
    await dbPut(db, "meta", { id: 4, value: true });
  }

  // Migration v5 — backfill cloud-sync fields (uid, updatedAt, deleted) on every
  // existing record, and stamp each trip with the uid of the river it references
  // so trips stay linked to the right river across devices. Existing records get
  // updatedAt = now so they are treated as the authoritative current state and
  // push up to the (empty) cloud on first sign-in.
  const v5 = await dbGet(db, "meta", 5);
  if (!v5) {
    const now = Date.now();

    const rivers = await dbGetAll(db, "rivers");
    for (const r of rivers) {
      const patch = { ...r };
      if (!patch.uid) patch.uid = patch.custom ? randUid("r") : seedRiverUid(patch);
      patch.updatedAt = patch.updatedAt || now;
      if (patch.deleted === undefined) patch.deleted = false;
      await dbPut(db, "rivers", { ...patch, _fromSync: true });
    }
    for (const f of await dbGetAll(db, "flies")) {
      const patch = { ...f };
      if (!patch.uid) patch.uid = patch.custom ? randUid("f") : seedFlyUid(patch);
      patch.updatedAt = patch.updatedAt || now;
      if (patch.deleted === undefined) patch.deleted = false;
      await dbPut(db, "flies", { ...patch, _fromSync: true });
    }
    for (const l of await dbGetAll(db, "leaders")) {
      const patch = { ...l };
      if (!patch.uid) patch.uid = seedLeaderUid(patch);
      patch.updatedAt = patch.updatedAt || now;
      if (patch.deleted === undefined) patch.deleted = false;
      await dbPut(db, "leaders", { ...patch, _fromSync: true });
    }

    // Trips: assign uid + link to river by uid.
    const riversNow = await dbGetAll(db, "rivers");
    const idToUid = new Map(riversNow.map(r => [r.id, r.uid]));
    for (const t of await dbGetAll(db, "trips")) {
      const patch = { ...t };
      if (!patch.uid) patch.uid = randUid("t");
      if (!patch.riverUid && patch.riverId != null) patch.riverUid = idToUid.get(patch.riverId) || null;
      patch.updatedAt = patch.updatedAt || now;
      if (patch.deleted === undefined) patch.deleted = false;
      await dbPut(db, "trips", { ...patch, _fromSync: true });
    }

    await dbPut(db, "meta", { id: 5, value: true });
  }
}

// ---------- API calls ----------

async function fetchUSGS(siteCode) {
  const url = `https://waterservices.usgs.gov/nwis/iv/?format=json&sites=${encodeURIComponent(siteCode)}&parameterCd=00060,00010,00065&siteStatus=all`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`USGS ${r.status}`);
  const data = await r.json();
  const out = { flowCFS: null, waterTempF: null, gaugeHeightFt: null, observedAt: null };
  const series = data?.value?.timeSeries ?? [];
  for (const s of series) {
    const code = s?.variable?.variableCode?.[0]?.value;
    const latest = s?.values?.[0]?.value?.slice(-1)?.[0];
    if (!latest) continue;
    const v = parseFloat(latest.value);
    if (!isFinite(v) || v < -100000) continue;
    if (code === "00060") out.flowCFS = v;
    else if (code === "00010") out.waterTempF = v * 9/5 + 32;
    else if (code === "00065") out.gaugeHeightFt = v;
    if (!out.observedAt) out.observedAt = latest.dateTime;
  }
  return out;
}

async function fetchDWR(abbrev) {
  // Colorado DWR telemetry station — returns current reading + stage
  // The station endpoint includes the most-recent measValue inline, so one call is enough.
  const url = `https://dwr.state.co.us/Rest/GET/api/v2/telemetrystations/telemetrystation/?format=json&abbrev=${encodeURIComponent(abbrev)}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`DWR ${r.status}`);
  const data = await r.json();
  const s = data.ResultList?.[0];
  if (!s) throw new Error("DWR station not found");
  const flow = s.measValue != null ? parseFloat(s.measValue) : null;
  return {
    flowCFS:       (isFinite(flow) && flow >= 0) ? flow : null,
    waterTempF:    null,                                          // available via TMPRT param — future
    gaugeHeightFt: s.stage != null ? parseFloat(s.stage) : null,
    observedAt:    s.measDateTime ?? null,
  };
}

function titleCase(str) {
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()).replace(/,\s*$/, "");
}

async function searchUSGSSites(stateCd, nameQuery) {
  // Site service returns compact RDB (tab-delimited) — ~50KB vs 2MB for the IV endpoint,
  // which is what was timing out on mobile. Omit siteName param (it doesn't exist on this
  // endpoint — that was causing the earlier 400). Fetch all sites, filter client-side.
  const url = `https://waterservices.usgs.gov/nwis/site/?format=rdb&stateCd=${encodeURIComponent(stateCd)}&siteType=ST&hasDataTypeCd=iv&siteStatus=active`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`USGS ${r.status}`);
  const text = await r.text();

  // RDB: comment lines start with #, then header row, then format-descriptor row, then data
  const dataLines = text.split("\n").filter(l => !l.startsWith("#") && l.trim());
  if (dataLines.length < 3) return [];
  const headers = dataLines[0].split("\t");
  const rows = dataLines.slice(2).filter(l => l.trim());

  const col = (name) => headers.indexOf(name);
  const si = col("site_no"), ni = col("station_nm"), lati = col("dec_lat_va"), loni = col("dec_long_va");
  if (si < 0 || ni < 0) throw new Error("unexpected USGS response format");

  const q = nameQuery.toLowerCase();
  return rows
    .map(line => {
      const c = line.split("\t");
      return {
        siteCode: c[si]?.trim(),
        name: titleCase(c[ni]?.trim() ?? ""),
        lat: parseFloat(c[lati]) || null,
        lon: parseFloat(c[loni]) || null,
      };
    })
    .filter(s => s.siteCode && s.name && s.lat && s.lon && s.name.toLowerCase().includes(q));
}

async function searchDWRStations(query) {
  // Fetch all active CO DWR stream gages and filter client-side.
  // (~200-400 stations, small JSON — fine on mobile.)
  const url = `https://dwr.state.co.us/Rest/GET/api/v2/telemetrystations/telemetrystation/?format=json&stationStatus=Active&stationType=Stream%20Gage`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`DWR ${r.status}`);
  const data = await r.json();
  const q = query.toLowerCase();
  return (data.ResultList ?? [])
    .filter(s => s.latitude && s.longitude && s.stationName?.toLowerCase().includes(q))
    .map(s => ({
      siteCode: s.abbrev,     // unified interface — abbrev acts as siteCode for DWR rivers
      abbrev:   s.abbrev,
      name:     titleCase(s.stationName),
      lat:      s.latitude,
      lon:      s.longitude,
      source:   "dwr",
    }))
    .slice(0, 20);
}

async function lookupUSGSSite(siteCode) {
  const url = `https://waterservices.usgs.gov/nwis/iv/?format=json&sites=${encodeURIComponent(siteCode)}&parameterCd=00060,00065,00010&siteStatus=all`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`USGS ${r.status}`);
  const data = await r.json();
  const ts = data?.value?.timeSeries;
  if (!ts?.length) throw new Error("site not found or has no active data");
  const info = ts[0].sourceInfo;
  const geo  = info?.geoLocation?.geogLocation;
  if (!geo) throw new Error("no coordinates returned");
  return { name: info.siteName, lat: geo.latitude, lon: geo.longitude };
}

async function fetchWeather(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat, longitude: lon,
    current: "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_direction_10m,surface_pressure,cloud_cover",
    temperature_unit: "fahrenheit",
    wind_speed_unit: "mph",
    precipitation_unit: "inch",
    timezone: "auto",
  });
  const r = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!r.ok) throw new Error(`Open-Meteo ${r.status}`);
  const data = await r.json();
  const c = data?.current ?? {};
  return {
    airTempF: c.temperature_2m,
    humidity: c.relative_humidity_2m,
    precipIn: c.precipitation,
    windMph: c.wind_speed_10m,
    windDir: c.wind_direction_10m,
    pressureHpa: c.surface_pressure,
    cloudPct: c.cloud_cover,
    observedAt: c.time,
  };
}

function compass(deg) {
  if (deg == null || !isFinite(deg)) return "";
  const dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  return dirs[Math.round((deg % 360) / 22.5) % 16];
}

function flowTrend(current, previous) {
  if (current == null || previous == null || previous === 0) return null;
  const delta = (current - previous) / previous;
  if (delta > 0.05) return "rising";
  if (delta < -0.05) return "falling";
  return "stable";
}

function fmtTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

// ---------- state ----------

const state = {
  db: null,
  tab: "rivers",
  rivers: [],
  trips: [],
  flies: [],
  leaders: [],
  gear: [],
  filters: {
    riverSearch: "",
    flyType: null,
    flySearch: "",
  },
  recording: null, // { mediaRecorder, chunks, startedAt, timerId, elapsed }
  playingMemoId: null,
  playingAudio: null,
  session: null,   // { startedAt, riverId, riverName, fishCount, lat, lon, usgs, weather, _timerId }
};

async function reload() {
  state.rivers = (await dbGetAll(state.db, "rivers")).filter(r => !r.deleted);
  state.trips = (await dbGetAll(state.db, "trips")).filter(t => !t.deleted).sort((a,b) => (b.date||0) - (a.date||0));
  state.flies = (await dbGetAll(state.db, "flies")).filter(f => !f.deleted);
  state.leaders = (await dbGetAll(state.db, "leaders")).filter(l => !l.deleted);
  state.gear = (await dbGetAll(state.db, "gear")).filter(g => !g.deleted);
}

// ---------- rendering ----------

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function el(tag, attrs = {}, children = []) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") e.className = v;
    else if (k === "html") e.innerHTML = v;
    else if (k === "text") e.textContent = v;
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
    else if (k === "dataset") Object.assign(e.dataset, v);
    else if (v !== null && v !== undefined) e.setAttribute(k, v);
  }
  for (const c of (Array.isArray(children) ? children : [children])) {
    if (c == null) continue;
    e.append(c instanceof Node ? c : document.createTextNode(c));
  }
  return e;
}

function icon(d, size = 18) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="currentColor"><path d="${d}"/></svg>`;
}

const ICONS = {
  drop: "M12 2s7 8.5 7 13a7 7 0 11-14 0c0-4.5 7-13 7-13z",
  thermo: "M12 3a3 3 0 013 3v8.17a4 4 0 11-6 0V6a3 3 0 013-3zm0 2a1 1 0 00-1 1v9.05A2 2 0 1014 16a2 2 0 00-1-1.73V6a1 1 0 00-1-1z",
  ruler: "M3 7v10h18V7H3zm2 2h2v3h2V9h2v3h2V9h2v3h2V9h2v6H5V9z",
  sun: "M12 6a6 6 0 100 12 6 6 0 000-12zm0-4v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41",
  wind: "M3 8h11a3 3 0 100-6 3 3 0 00-3 3M3 16h15a3 3 0 110 6 3 3 0 01-3-3M3 12h18",
  baro: "M12 2a10 10 0 100 20 10 10 0 000-20zm0 2a8 8 0 110 16 8 8 0 010-16zm0 2v6l4 4",
  rain: "M6 14a4 4 0 010-8 5 5 0 019.6-2A4 4 0 0118 14H6zm2 3l-1 3m4-3l-1 3m4-3l-1 3",
  cloud: "M6 14a4 4 0 010-8 5 5 0 019.6-2A4 4 0 0118 14H6z",
  humid: "M12 3l5 9a5 5 0 11-10 0l5-9z",
  star: "M12 2l3 7h7l-5.5 4.5L18 22l-6-4-6 4 1.5-8.5L2 9h7l3-7z",
  starOutline: "M12 5.5l1.9 4.4 4.8.4-3.6 3.1 1 4.6L12 15.5l-4.1 2.5 1-4.6-3.6-3.1 4.8-.4L12 5.5zM12 2L9 9H2l5.5 4.5L6 22l6-4 6 4-1.5-8.5L22 9h-7l-3-7z",
  plus: "M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2h6z",
  close: "M12 10.6L17 5.6 18.4 7l-5 5 5 5L17 18.4l-5-5-5 5L5.6 17l5-5-5-5L7 5.6l5 5z",
  trash: "M9 3v1H4v2h16V4h-5V3H9zm-3 5l1 13a2 2 0 002 2h6a2 2 0 002-2l1-13H6zm3 2h2v9H9v-9zm4 0h2v9h-2v-9z",
  play: "M8 5v14l11-7z",
  stop: "M6 6h12v12H6z",
  mic: "M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3zm-7-3a7 7 0 0014 0h-2a5 5 0 01-10 0H5zm6 8h2v3h-2v-3z",
  pin: "M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7zm0 9a2 2 0 110-4 2 2 0 010 4z",
  fish: "M3 12c3-4 9-6 14-3l3-2-1 4 1 4-3-2c-5 3-11 1-14-3zm14 0h.01",
  refresh: "M12 4V1L8 5l4 4V6a6 6 0 11-6 6H4a8 8 0 108-8z",
  search: "M10 4a6 6 0 014.6 9.9l5.4 5.4-1.4 1.4-5.4-5.4A6 6 0 1110 4zm0 2a4 4 0 100 8 4 4 0 000-8z",
  leaf: "M5 21c0-10 9-15 16-15-1 9-6 15-16 15zm2-2c8 0 13-5 14-12-6 1-13 4-14 12z",
  ant: "M12 2c1 0 2 1 2 2v2c1 0 2 1 2 2v3l4 1v2l-4 1v2c0 1-1 2-2 2v2c0 1-1 2-2 2s-2-1-2-2v-2c-1 0-2-1-2-2v-2l-4-1V12l4-1V8c0-1 1-2 2-2V4c0-1 1-2 2-2z",
  ladybug: "M12 4a8 8 0 100 16 8 8 0 000-16zm0 2a6 6 0 110 12V6zm-3 3a1 1 0 100 2 1 1 0 000-2zm0 5a1 1 0 100 2 1 1 0 000-2z",
  book: "M4 4a2 2 0 012-2h11a3 3 0 013 3v15a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1v14h11V5H7z",
  scissors: "M14.7 6.3l3 3-3 3 1.4 1.4 4.4-4.4-4.4-4.4-1.4 1.4zM9.3 6.3L7.9 4.9 3.5 9.3l4.4 4.4 1.4-1.4-3-3 3-3z",
  map: "M9 3L3 5v16l6-2 6 2 6-2V3l-6 2-6-2zm0 2.2l6 2v13.6l-6-2V5.2z",
  camera: "M9 3l-2 3H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-3l-2-3H9zm3 5a5 5 0 110 10 5 5 0 010-10z",
  timer: "M12 2a10 10 0 100 20A10 10 0 0012 2zm0 2a8 8 0 110 16A8 8 0 0112 4zm1 5v5.5l3.5 2-.9 1.7L11 16V9h2z",
  gear: "M12 8a4 4 0 100 8 4 4 0 000-8zm0 2a2 2 0 110 4 2 2 0 010-4zm7.4 3a7.6 7.6 0 000-2l2-1.5-2-3.4-2.3 1a7.5 7.5 0 00-1.7-1l-.4-2.5h-4l-.4 2.5a7.5 7.5 0 00-1.7 1l-2.3-1-2 3.4L4.6 11a7.6 7.6 0 000 2l-2 1.5 2 3.4 2.3-1c.5.4 1.1.7 1.7 1l.4 2.5h4l.4-2.5c.6-.3 1.2-.6 1.7-1l2.3 1 2-3.4-2-1.5z",
};

function flyTypeIcon(t) {
  switch (t) {
    case "Dry": return ICONS.leaf;
    case "Nymph": return ICONS.ant;
    case "Streamer": return ICONS.fish;
    case "Emerger": return ICONS.drop;
    case "Terrestrial": return ICONS.ladybug;
    default: return ICONS.humid;
  }
}

function setHeader(title, sub, actions = []) {
  $("#page-title").textContent = title;
  $("#page-sub").textContent = sub || "";
  const a = $("#page-actions");
  a.innerHTML = "";
  for (const btn of actions) a.append(btn);
}

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove("show"), 2200);
}

function openModal(node) {
  const m = $("#modal");
  m.innerHTML = "";
  m.append(el("div", { class: "modal-handle" }));
  m.append(node);
  $("#modal-bg").classList.add("open");

  // Clean up any previous swipe listeners before adding new ones
  if (m._swipeTouchStart) m.removeEventListener("touchstart", m._swipeTouchStart);
  if (m._swipeTouchEnd)   m.removeEventListener("touchend",   m._swipeTouchEnd);

  let startY = 0;
  m._swipeTouchStart = (e) => { startY = e.touches[0].clientY; };
  // Only dismiss when the modal is scrolled to the top — prevents accidental
  // close when the user is scrolling down through a long form
  m._swipeTouchEnd = (e) => {
    const dy = e.changedTouches[0].clientY - startY;
    if (dy > 100 && m.scrollTop < 10) closeModal();
  };
  m.addEventListener("touchstart", m._swipeTouchStart, { passive: true });
  m.addEventListener("touchend",   m._swipeTouchEnd,   { passive: true });
}
function closeModal() {
  $("#modal-bg").classList.remove("open");
}
$("#modal-bg").addEventListener("click", (e) => {
  if (e.target.id === "modal-bg") closeModal();
});

function modalShell(title, body, footer) {
  const wrap = el("div");
  const head = el("div", { class: "modal-head" }, [
    el("h2", { text: title }),
    el("button", { class: "close", "aria-label": "Close", onclick: closeModal, html: icon(ICONS.close, 22) }),
  ]);
  wrap.append(head, body);
  if (footer) wrap.append(footer);
  return wrap;
}

// ---------- tabs ----------

function switchTab(name) {
  state.tab = name;
  $$(".panel").forEach(p => p.classList.toggle("active", p.id === `panel-${name}`));
  $$("#tabs button").forEach(b => b.classList.toggle("active", b.dataset.tab === name));
  if (name === "rivers") renderRivers();
  else if (name === "trips") renderTrips();
  else if (name === "flies") renderFlies();
  else if (name === "leaders") renderLeaders();
  else if (name === "map") renderMap();
}

$("#tabs").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (b) switchTab(b.dataset.tab);
});

// ---------- rivers tab ----------

function buildHeroCard(r) {
  const [c1, c2] = CARD_GRADIENTS[r.id % CARD_GRADIENTS.length];
  const trend = flowTrend(r.lastCFS, r.prevCFS);
  const cfsStr = r.lastCFS != null ? Math.round(r.lastCFS).toLocaleString() : "—";
  const trendLabel = trend === "rising" ? "↑ rising" : trend === "falling" ? "↓ falling" : "";

  const topRow = el("div", { style: "display:flex; justify-content:space-between; align-items:flex-start;" }, [
    el("span", { class: "h-badge", text: r.state }),
    el("button", {
      style: "background:transparent; border:0; padding:0; color:rgba(255,255,255,0.85); line-height:1; flex-shrink:0;",
      html: icon(r.favorite ? ICONS.star : ICONS.starOutline, 22),
      onclick: async (e) => {
        e.stopPropagation();
        r.favorite = !r.favorite;
        await dbPut(state.db, "rivers", r);
        await reload();
        renderRivers();
      },
    }),
  ]);

  const nameBlock = el("div", {}, [
    el("div", { class: "h-name", text: r.name }),
    r.section ? el("div", { class: "h-section", text: r.section }) : null,
  ]);

  const cfsBlock = el("div", {}, [
    el("div", { class: "h-cfs-row" }, [
      el("span", { class: "h-cfs", text: cfsStr }),
      r.lastCFS != null ? el("span", { class: "h-cfs-unit", text: "CFS" }) : null,
    ]),
    trendLabel ? el("div", { class: "h-trend", text: trendLabel }) : null,
  ]);

  const condParts = [];
  if (r.lastWaterTempF != null) condParts.push(`💧 ${Math.round(r.lastWaterTempF)}°F`);
  if (r.lastReadingAt) condParts.push(`Updated ${fmtTime(r.lastReadingAt)}`);
  const bottomEl = el("div", { class: "h-bottom" },
    condParts.length ? condParts.map(t => el("span", { text: t })) : [el("span", { text: "Tap for live conditions" })]
  );

  const card = el("button", {
    class: "hero-card",
    style: `background: linear-gradient(145deg, ${c1}, ${c2});`,
    onclick: () => openRiver(r.id),
  });
  card.append(topRow, nameBlock, cfsBlock, bottomEl);
  return card;
}

function buildRiverHero() {
  const section = el("div", { id: "river-hero-section" });
  const favs = state.rivers.filter(r => r.favorite);

  if (!favs.length) {
    section.append(el("div", { class: "swiper-hint" }, [
      el("div", { html: icon(ICONS.starOutline, 28), style: "opacity:0.4; color:var(--teal);" }),
      el("div", { text: "Star a river to feature it here" }),
    ]));
    return section;
  }

  const track = el("div", { class: "swiper-track" });
  favs.forEach(r => track.append(buildHeroCard(r)));

  const dotEls = favs.map((_, i) => el("div", { class: "swiper-dot" + (i === 0 ? " active" : "") }));
  const dots = el("div", { class: "swiper-dots" });
  dotEls.forEach(d => dots.append(d));

  if (favs.length > 1) {
    track.addEventListener("scroll", () => {
      const w = (track.firstElementChild?.offsetWidth ?? 0) + 10;
      if (!w) return;
      const idx = Math.min(Math.round(track.scrollLeft / w), favs.length - 1);
      dotEls.forEach((d, i) => d.classList.toggle("active", i === idx));
    }, { passive: true });
  }

  section.append(el("div", { class: "swiper-section" }, [track, dots]));
  return section;
}

function renderRivers() {
  setHeader("Rivers", "Western US · tap for live conditions", [
    el("button", {
      class: "icon-btn",
      "aria-label": "Add river",
      html: icon(ICONS.plus, 18),
      onclick: () => addRiverModal(),
    }),
  ]);

  const panel = $("#panel-rivers");
  const existingHero = $("#river-hero-section");

  if (existingHero) {
    panel.replaceChild(buildRiverHero(), existingHero);
    const inp = $("#river-search-input");
    if (inp && inp.value !== state.filters.riverSearch) inp.value = state.filters.riverSearch;
  } else {
    panel.innerHTML = "";
    panel.append(
      buildRiverHero(),
      el("div", { class: "search" }, [
        el("span", { html: icon(ICONS.search, 18) }),
        el("input", {
          id: "river-search-input",
          type: "search",
          placeholder: "Search rivers, sections, states",
          value: state.filters.riverSearch,
          oninput: (e) => { state.filters.riverSearch = e.target.value; renderRiverList(); },
        }),
      ]),
      el("div", { id: "river-list" }),
    );
  }

  renderRiverList();

  // Background-refresh any starred river that has no CFS data yet
  const needData = state.rivers.filter(r => r.favorite && r.lastCFS == null);
  needData.forEach(r => {
    const fetcher = r.source === "dwr" ? fetchDWR(r.siteCode) : fetchUSGS(r.siteCode);
    fetcher.then(async usgs => {
      if (!usgs?.flowCFS) return;
      r.prevCFS = null;
      r.lastCFS = usgs.flowCFS;
      r.lastWaterTempF = usgs.waterTempF;
      r.lastReadingAt = usgs.observedAt;
      await dbPut(state.db, "rivers", r);
      await reload();
      renderRivers();
    }).catch(() => {});
  });
}

function renderRiverList() {
  const listEl = $("#river-list");
  if (!listEl) return;
  listEl.innerHTML = "";

  const q = state.filters.riverSearch.trim().toLowerCase();
  const filtered = state.rivers.filter(r => {
    if (!q) return true;
    return (r.name + " " + (r.state || "") + " " + (r.section || "")).toLowerCase().includes(q);
  }).sort((a, b) => {
    if (a.favorite !== b.favorite) return b.favorite ? 1 : -1;
    return a.name.localeCompare(b.name);
  });

  if (filtered.length) {
    filtered.forEach(r => listEl.append(riverRow(r)));
  } else {
    const rawQ = state.filters.riverSearch.trim();
    listEl.append(el("div", { class: "empty", html: `${icon(ICONS.drop, 52)}<h3>No rivers match</h3><p>${rawQ ? `No results for "${rawQ}".` : "No rivers yet."} Add one below.</p>` }));
    listEl.append(el("button", {
      class: "btn",
      style: "margin-top:8px;",
      html: `${icon(ICONS.plus, 18)} <span>Add ${rawQ ? `"${rawQ}"` : "a new river"}</span>`,
      onclick: () => addRiverModal(rawQ),
    }));
  }
}

function riverRow(r) {
  const trend = flowTrend(r.lastCFS, r.prevCFS);
  const subParts = [`${r.state}${r.section ? " · " + r.section : ""}`];

  const subEl = el("div", { class: "sub" }, [
    document.createTextNode(subParts[0]),
    ...(trend === "rising"  ? [el("span", { class: "trend-rising",  text: " ↑ rising"  })] : []),
    ...(trend === "falling" ? [el("span", { class: "trend-falling", text: " ↓ falling" })] : []),
  ]);

  const rightEl = el("div", { class: "river-right" }, [
    el("button", {
      class: "star",
      "aria-label": "Favorite",
      html: icon(r.favorite ? ICONS.star : ICONS.starOutline, 18),
      style: `color: ${r.favorite ? "var(--yellow)" : "var(--muted)"}`,
      onclick: async (e) => {
        e.stopPropagation();
        r.favorite = !r.favorite;
        await dbPut(state.db, "rivers", r);
        await reload();
        renderRivers();
      },
    }),
    r.lastCFS != null ? el("div", { class: "river-cfs" }, [
      el("div", { class: "cfs-v", text: Math.round(r.lastCFS).toString() }),
      el("div", { class: "cfs-u", text: "cfs" }),
    ]) : null,
  ]);

  return el("button", {
    class: "river-row",
    onclick: () => openRiver(r.id),
  }, [
    el("div", { class: "drop", html: icon(ICONS.drop, 18) }),
    el("div", { class: "meta" }, [
      el("div", { class: "name", text: r.name }),
      subEl,
    ]),
    rightEl,
  ]);
}

// ---------- river detail (modal) ----------

async function openRiver(id) {
  const r = await dbGet(state.db, "rivers", id);
  if (!r) return;
  const body = el("div");

  const sub = el("div", {
    style: "color:var(--muted); font-size:13px; margin-bottom:10px;",
    text: `${r.state}${r.section ? " · " + r.section : ""} · ${r.source === "dwr" ? "DWR" : "USGS"} ${r.siteCode}`,
  });
  body.append(sub);

  const metrics = el("div", { class: "card" }, [conditionsGridSkeleton()]);
  body.append(metrics);

  const mapDiv = el("div", { class: "card", style: "padding:0; overflow:hidden;" }, [
    el("div", { id: "river-mini-map", style: "height:200px;" })
  ]);
  body.append(mapDiv);

  const startBtn = el("button", {
    class: "btn",
    html: `${icon(ICONS.plus, 18)} <span>Start a Trip Here</span>`,
    onclick: () => { closeModal(); newTripModal(r); },
  });
  const refreshBtn = el("button", {
    class: "btn secondary",
    html: `${icon(ICONS.refresh, 18)} <span>Refresh</span>`,
    onclick: () => refreshRiverConditions(r, metrics),
    style: "margin-top:8px;",
  });
  const deleteBtn = el("button", {
    class: "btn danger",
    html: `${icon(ICONS.trash, 18)} <span>Delete River</span>`,
    style: "margin-top:8px;",
    onclick: async (e) => {
      e.preventDefault();
      const tripCount = state.trips.filter(t => t.riverId === r.id).length;
      const msg = `Delete ${r.name}${r.section ? " — " + r.section : ""}?` +
        (tripCount ? `\n\n${tripCount} trip(s) reference this river and will be kept.` : "");
      if (!confirm(msg)) return;
      await softDelete("rivers", r.id);
      await reload();
      renderRivers();
      closeModal();
      toast("River deleted");
    },
  });
  body.append(startBtn, refreshBtn, deleteBtn);

  if (r.notes) {
    body.append(el("div", { class: "card" }, [
      el("h3", { text: "Notes" }),
      el("div", { style: "color:var(--muted)", text: r.notes }),
    ]));
  }

  openModal(modalShell(r.name, body));

  // Init mini-map after modal is in DOM
  setTimeout(() => {
    const m = L.map("river-mini-map", { zoomControl: false, attributionControl: false })
      .setView([r.lat, r.lon], 11);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18 }).addTo(m);
    L.marker([r.lat, r.lon]).addTo(m).bindPopup(r.name);
  }, 50);

  refreshRiverConditions(r, metrics);
}

function conditionsGridSkeleton() {
  const skGrid = (n) => {
    const g = el("div", { class: "metrics-grid" });
    for (let i = 0; i < n; i++) {
      g.append(el("div", { class: "metric" }, [
        el("div", { class: "skeleton", style: "height:18px; width:60%; margin:6px 0;" }),
        el("div", { class: "skeleton", style: "height:10px; width:40%;" }),
      ]));
    }
    return g;
  };
  const wrap = el("div");
  wrap.append(
    el("div", { class: "skeleton", style: "height:11px; width:90px; margin-bottom:8px;" }),
    skGrid(3),
    el("div", { class: "skeleton", style: "height:11px; width:110px; margin:12px 0 8px;" }),
    skGrid(6),
  );
  return wrap;
}

function metric(label, value, unit, ic, color) {
  return el("div", { class: "metric" }, [
    el("div", { class: "ico", style: `color:${color}`, html: icon(ic, 18) }),
    el("div", { class: "v", text: value ?? "—" }),
    el("div", { class: "u", text: unit ?? "" }),
    el("div", { class: "l", text: label }),
  ]);
}

function buildConditionsGrid(u, w, source = "usgs") {
  const f = (n, d = 0) => (n == null || !isFinite(n)) ? "—" : (d === 0 ? Math.round(n).toString() : n.toFixed(d));

  const usgsGrid = el("div", { class: "metrics-grid" }, [
    metric("Flow",  f(u?.flowCFS),         "cfs", ICONS.drop,   "var(--teal)"),
    metric("Water", f(u?.waterTempF, 1),   "°F",  ICONS.thermo, "#2d6a8e"),
    metric("Gauge", f(u?.gaugeHeightFt,2), "ft",  ICONS.ruler,  "#6a5a9e"),
  ]);

  const wxGrid = el("div", { class: "metrics-grid" }, [
    metric("Air",      f(w?.airTempF),    "°F",                        ICONS.sun,   "var(--gold)"),
    metric("Wind",     f(w?.windMph),     compass(w?.windDir) || "mph", ICONS.wind,  "var(--teal)"),
    metric("Pressure", f(w?.pressureHpa), "hPa",                       ICONS.baro,  "#7a6aae"),
    metric("Precip",   f(w?.precipIn, 2), "in",                        ICONS.rain,  "#2d6a8e"),
    metric("Clouds",   f(w?.cloudPct),    "%",                         ICONS.cloud, "var(--muted)"),
    metric("Humidity", f(w?.humidity),    "%",                         ICONS.humid, "var(--teal)"),
  ]);

  const wrap = el("div");
  wrap.append(
    el("div", { class: "cond-header" }, [
      el("span", { class: "cond-src", text: source === "dwr" ? "CO DWR · River" : "USGS · River" }),
      u?.observedAt ? el("span", { class: "cond-time", text: fmtTime(u.observedAt) }) : null,
    ]),
    usgsGrid,
    el("div", { class: "cond-header" }, [
      el("span", { class: "cond-src", text: "Weather · Now" }),
      el("span", { class: "cond-time", text: "Open-Meteo" }),
    ]),
    wxGrid,
  );
  return wrap;
}

async function refreshRiverConditions(r, container) {
  let usgs = null, weather = null, errs = [];
  const isDWR = r.source === "dwr";
  try {
    usgs = isDWR ? await fetchDWR(r.siteCode) : await fetchUSGS(r.siteCode);
  } catch (e) { errs.push((isDWR ? "DWR" : "USGS") + ": " + e.message); }
  try { weather = await fetchWeather(r.lat, r.lon); } catch (e) { errs.push("Weather: " + e.message); }

  container.innerHTML = "";
  container.append(buildConditionsGrid(usgs, weather, r.source));
  if (errs.length) {
    container.append(el("div", { style: "color:var(--red); font-size:12px; margin-top:8px;", text: errs.join(" · ") }));
  }

  // Cache on the river record; preserve previous CFS for trend arrow
  if (usgs) {
    r.prevCFS = r.lastCFS ?? null;
    r.lastCFS = usgs.flowCFS;
    r.lastWaterTempF = usgs.waterTempF;
    r.lastReadingAt = usgs.observedAt;
    await dbPut(state.db, "rivers", r);
    await reload();
  }
}

function addRiverModal(prefillName = "") {
  const s = { name: prefillName, st: "CO", section: "", siteCode: "", lat: "", lon: "", source: "usgs" };

  // ── Detail fields (shared between search-fill and manual) ──
  const nameInput = el("input", { type: "text", placeholder: "e.g. Arkansas River", value: s.name,
    oninput: (e) => s.name = e.target.value });
  const secInput  = el("input", { type: "text", placeholder: "e.g. Parkdale",
    oninput: (e) => s.section = e.target.value });
  const codeInput = el("input", { type: "text", placeholder: "e.g. 07094500",
    oninput: (e) => s.siteCode = e.target.value });
  const latInput  = el("input", { type: "number", step: "any", placeholder: "38.5",
    oninput: (e) => s.lat = e.target.value });
  const lonInput  = el("input", { type: "number", step: "any", placeholder: "-105.4",
    oninput: (e) => s.lon = e.target.value });

  const fillFromResult = (result) => {
    s.name = result.name; nameInput.value = result.name;
    s.siteCode = result.siteCode; codeInput.value = result.siteCode;
    s.lat = String(result.lat); latInput.value = result.lat;
    s.lon = String(result.lon); lonInput.value = result.lon;
    s.source = result.source || "usgs";
    nameInput.focus();
  };

  // ── USGS name search ──
  const stateSelect = el("select", {
    style: "width:72px; flex-shrink:0; padding-left:8px; padding-right:4px;",
    onchange: (e) => s.st = e.target.value,
  });
  for (const st of ["CO","MT","WY","ID","UT","NM","AZ","NV","OR","WA","CA"]) {
    const o = el("option", { value: st, text: st });
    if (st === s.st) o.selected = true;
    stateSelect.append(o);
  }
  const searchQuery = el("input", { type: "search", placeholder: "e.g. Arkansas River",
    value: prefillName, style: "flex:1; min-width:0;" });
  const resultsEl = el("div");

  const searchBtn = el("button", {
    class: "btn secondary",
    html: `${icon(ICONS.search, 16)} <span>Search</span>`,
    style: "flex-shrink:0;",
    onclick: async (e) => {
      e.preventDefault();
      const q = searchQuery.value.trim();
      if (!q) { toast("Enter a river name"); return; }
      s.st = stateSelect.value;
      searchBtn.disabled = true;
      searchBtn.innerHTML = `${icon(ICONS.refresh, 16)} <span>Searching…</span>`;
      resultsEl.innerHTML = "";
      try {
        // Search USGS always; for CO also search DWR in parallel
        const tasks = [searchUSGSSites(s.st, q).catch(() => [])];
        if (s.st === "CO") tasks.push(searchDWRStations(q).catch(() => []));
        const [usgsResults, dwrResults = []] = await Promise.all(tasks);
        // DWR first for CO — they're the authoritative source for CO rivers
        const combined = [
          ...dwrResults,
          ...usgsResults.map(r => ({ ...r, source: "usgs" })),
        ];
        if (!combined.length) {
          resultsEl.append(el("div", { style: "padding:10px 12px; color:var(--muted); font-size:13px;",
            text: "No gauges found — try a shorter name or different state." }));
        } else {
          const box = el("div", { class: "gauge-results" });
          for (const res of combined.slice(0, 20)) {
            const isDWR = res.source === "dwr";
            const row = el("button", { class: "gauge-result-row",
              onclick: (ev) => { ev.preventDefault(); fillFromResult(res); resultsEl.innerHTML = ""; toast("Gauge selected — edit name/section then save"); }
            });
            row.append(
              el("div", { class: "gauge-result-name" }, [
                el("span", { class: `gauge-src-badge ${isDWR ? "dwr" : "usgs"}`, text: isDWR ? "DWR" : "USGS" }),
                document.createTextNode(" " + res.name),
              ]),
              el("div", { class: "gauge-result-meta", text: `${res.siteCode} · ${res.lat?.toFixed(4)}, ${res.lon?.toFixed(4)}` }),
            );
            box.append(row);
          }
          resultsEl.append(box);
        }
      } catch (err) {
        toast("Search failed — " + err.message);
      } finally {
        searchBtn.disabled = false;
        searchBtn.innerHTML = `${icon(ICONS.search, 16)} <span>Search</span>`;
      }
    },
  });

  const form = el("form");
  form.append(
    // Search section
    el("div", { class: "card", style: "margin-bottom:14px;" }, [
      el("div", { style: "font-size:12px; color:var(--muted); margin-bottom:8px; font-weight:600; text-transform:uppercase; letter-spacing:0.04em;", text: "Find gauge by name" }),
      el("div", { style: "display:flex; gap:8px; align-items:center;" }, [
        stateSelect,
        searchQuery,
      ]),
      el("div", { style: "margin-top:8px;" }, [searchBtn]),
      resultsEl,
    ]),
    // Detail fields
    el("div", { class: "form-group" }, [el("label", { text: "River name" }), nameInput]),
    el("div", { class: "form-group" }, [el("label", { text: "Section (optional)" }), secInput]),
    el("div", { class: "form-group" }, [el("label", { text: "Gauge / site code" }), codeInput]),
    el("div", { class: "form-row" }, [
      el("div", { class: "form-group" }, [el("label", { text: "Latitude" }), latInput]),
      el("div", { class: "form-group" }, [el("label", { text: "Longitude" }), lonInput]),
    ]),
  );

  const footer = el("div", { style: "display:flex; gap:8px; margin-top:8px;" }, [
    el("button", { class: "btn secondary", text: "Cancel",
      onclick: (e) => { e.preventDefault(); closeModal(); } }),
    el("button", {
      class: "btn", text: "Save River",
      onclick: async (e) => {
        e.preventDefault();
        if (!s.name.trim()) { toast("River name required"); return; }
        if (!s.siteCode.trim()) { toast("Gauge code required — search for a gauge first"); return; }
        await dbPut(state.db, "rivers", {
          name: s.name.trim(),
          state: s.st.trim().toUpperCase() || "—",
          section: s.section.trim(),
          siteCode: s.siteCode.trim(),
          source: s.source || "usgs",
          lat: parseFloat(s.lat) || 0,
          lon: parseFloat(s.lon) || 0,
          favorite: false, custom: true,
          lastCFS: null, lastWaterTempF: null, lastReadingAt: null,
        });
        await reload();
        state.filters.riverSearch = "";
        renderRivers();
        closeModal();
        toast("River added");
      },
    }),
  ]);

  openModal(modalShell("Add a river", form, footer));
}

// ---------- trips tab ----------

function renderTrips() {
  setHeader("Trips", `${state.trips.length} logged`, [
    el("button", {
      class: "icon-btn",
      "aria-label": "Gear",
      html: icon(ICONS.gear, 18),
      onclick: () => openGearSheet(),
    }),
    el("button", {
      class: "icon-btn",
      "aria-label": "New trip",
      html: icon(ICONS.plus, 18),
      onclick: () => newTripModal(),
    }),
  ]);
  const panel = $("#panel-trips");
  panel.innerHTML = "";

  if (!state.trips.length) {
    panel.append(el("div", { class: "empty", html: `${icon(ICONS.book, 52)}<h3>No trips logged yet</h3><p>Tap + to log your first outing. We'll snapshot flow + weather and let you record voice memos.</p>` }));
    return;
  }

  for (const t of state.trips) {
    const row = el("div", { class: "card trip-row", onclick: () => openTrip(t.id) }, [
      el("div", { class: "top" }, [
        el("div", { class: "where", text: t.riverName }),
        el("div", { class: "when", text: new Date(t.date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) }),
      ]),
      t.locationLabel ? el("div", { style: "color:var(--muted); font-size:12px;", text: t.locationLabel }) : null,
      el("div", { class: "stats", text: [
        t.flowCFS != null ? `${Math.round(t.flowCFS)} cfs` : null,
        t.waterTempF != null ? `${Math.round(t.waterTempF)}° water` : null,
        t.fishLanded ? `${t.fishLanded} fish` : null,
        t.memoCount ? `🎤 ${t.memoCount} memo${t.memoCount>1?"s":""}` : null,
      ].filter(Boolean).join(" · ") }),
    ]);
    panel.append(row);
  }
}

// ---------- gear ----------

// Usage is derived from trips (never a stored counter), so it can't drift.
function gearUsage(uid) {
  const used = state.trips.filter(t => (t.gearUids || []).includes(uid));
  const last = used.reduce((m, t) => Math.max(m, t.date || 0), 0);
  return { count: used.length, last };
}

function gearNames(t) {
  return (t.gearUids || [])
    .map(uid => state.gear.find(g => g.uid === uid)?.name)
    .filter(Boolean)
    .join(", ");
}

function openGearSheet() {
  const body = el("div");

  body.append(el("button", {
    class: "btn", style: "margin-bottom:10px;",
    html: `${icon(ICONS.plus, 18)} <span>Add gear</span>`,
    onclick: (e) => { e.preventDefault(); openGearEdit(); },
  }));

  const active = state.gear.filter(g => !g.retired);
  const retired = state.gear.filter(g => g.retired);

  if (!state.gear.length) {
    body.append(el("div", { class: "empty", html: `${icon(ICONS.gear, 52)}<h3>No gear yet</h3><p>Add your rods, waders, and boots. We'll track how many trips you've used each one and when you last took it out.</p>` }));
    openModal(modalShell("Gear", body));
    return;
  }

  const card = el("div", { class: "card" });
  const order = { Rod: 0, Waders: 1, Boots: 2, Other: 3 };
  const sorted = [...active].sort((a, b) => (order[a.type] ?? 9) - (order[b.type] ?? 9) || a.name.localeCompare(b.name));
  sorted.forEach((g, i) => {
    const u = gearUsage(g.uid);
    const meta = `${g.type}${g.brand ? " · " + g.brand : ""} · ${u.count} trip${u.count === 1 ? "" : "s"}${u.last ? " · last " + new Date(u.last).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : ""}`;
    const row = el("div", {
      class: "row", style: `cursor:pointer; align-items:flex-start;${i ? " border-top:1px solid var(--line);" : ""} padding:10px 0;`,
      onclick: () => openGearEdit(g),
    }, [
      el("div", {}, [
        el("div", { style: "font-weight:600;", text: g.name }),
        el("div", { style: "color:var(--muted); font-size:12px; margin-top:2px;", text: meta }),
      ]),
      el("span", { style: "color:var(--muted);", html: icon(ICONS.scissors, 16) }),
    ]);
    card.append(row);
  });
  body.append(card);

  if (retired.length) {
    body.append(el("div", { style: "color:var(--muted); font-size:12px; margin:14px 0 6px; text-transform:uppercase; letter-spacing:0.05em;", text: "Retired" }));
    const rcard = el("div", { class: "card", style: "opacity:0.6;" });
    retired.forEach((g, i) => {
      const u = gearUsage(g.uid);
      rcard.append(el("div", {
        class: "row", style: `cursor:pointer;${i ? " border-top:1px solid var(--line);" : ""} padding:10px 0;`,
        onclick: () => openGearEdit(g),
      }, [
        el("span", { text: g.name }),
        el("span", { class: "value", text: `${g.type} · ${u.count} trips` }),
      ]));
    });
    body.append(rcard);
  }

  openModal(modalShell("Gear", body));
}

function openGearEdit(existing = null) {
  const s = {
    name: existing?.name ?? "",
    type: existing?.type ?? "Rod",
    brand: existing?.brand ?? "",
    notes: existing?.notes ?? "",
    retired: existing?.retired ?? false,
  };
  const body = el("div");

  const typeSel = el("select", { onchange: (e) => s.type = e.target.value });
  for (const t of GEAR_TYPES) {
    const o = el("option", { value: t, text: t });
    if (t === s.type) o.selected = true;
    typeSel.append(o);
  }

  body.append(
    el("div", { class: "form-group" }, [
      el("label", { text: "Name" }),
      el("input", { type: "text", value: s.name, placeholder: "e.g. Sage R8 5wt", oninput: (e) => s.name = e.target.value }),
    ]),
    el("div", { class: "form-group" }, [el("label", { text: "Type" }), typeSel]),
    el("div", { class: "form-group" }, [
      el("label", { text: "Brand / model (optional)" }),
      el("input", { type: "text", value: s.brand, placeholder: "e.g. Simms G3", oninput: (e) => s.brand = e.target.value }),
    ]),
    el("div", { class: "form-group" }, [
      el("label", { text: "Notes (optional)" }),
      el("textarea", { rows: 3, oninput: (e) => s.notes = e.target.value }, s.notes),
    ]),
  );

  if (existing) {
    const retireWrap = el("label", { style: "display:flex; align-items:center; gap:8px; margin:4px 0 8px; color:var(--muted);" });
    const cb = el("input", { type: "checkbox" });
    cb.checked = s.retired;
    cb.onchange = (e) => s.retired = e.target.checked;
    retireWrap.append(cb, el("span", { text: "Retired (hide from trip picker, keep history)" }));
    body.append(retireWrap);

    if (gearUsage(existing.uid).count) {
      const u = gearUsage(existing.uid);
      body.append(el("div", { class: "card", style: "margin-bottom:8px;" }, [
        el("div", { class: "row" }, [el("span", { class: "label", text: "Trips" }), el("span", { class: "value", text: String(u.count) })]),
        el("div", { class: "row" }, [el("span", { class: "label", text: "Last used" }), el("span", { class: "value", text: u.last ? new Date(u.last).toLocaleDateString() : "—" })]),
      ]));
    }
  }

  const footer = el("div", { style: "display:flex; gap:8px; margin-top:8px;" }, [
    existing
      ? el("button", { class: "btn danger", text: "Delete", onclick: async (e) => {
          e.preventDefault();
          if (!confirm(`Delete ${existing.name}? Past trips keep their record of it.`)) return;
          await softDelete("gear", existing.id);
          await reload();
          closeModal();
          openGearSheet();
          toast("Gear deleted");
        }})
      : el("button", { class: "btn secondary", text: "Cancel", onclick: (e) => { e.preventDefault(); closeModal(); openGearSheet(); } }),
    el("button", { class: "btn", text: existing ? "Save" : "Add gear", onclick: async (e) => {
      e.preventDefault();
      if (!s.name.trim()) { toast("Name required"); return; }
      await dbPut(state.db, "gear", {
        ...(existing || {}),
        name: s.name.trim(),
        type: s.type,
        brand: s.brand.trim(),
        notes: s.notes.trim(),
        retired: !!s.retired,
      });
      await reload();
      closeModal();
      openGearSheet();
      toast(existing ? "Gear saved" : "Gear added");
    }}),
  ]);

  openModal(modalShell(existing ? "Edit gear" : "Add gear", body, footer));
}

// Local datetime-local string (YYYY-MM-DDTHH:mm) for an epoch-ms value.
function toLocalInput(ms) {
  const d = new Date(ms);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

async function newTripModal(prefRiver, editTrip = null) {
  const formState = {
    riverId: editTrip?.riverId ?? prefRiver?.id ?? state.rivers[0]?.id ?? null,
    date: editTrip ? toLocalInput(editTrip.date) : new Date().toISOString().slice(0,16),
    locationLabel: editTrip?.locationLabel ?? "",
    fliesUsed: editTrip?.fliesUsed ?? "",
    leaderSetup: editTrip?.leaderSetup ?? "",
    fishLanded: editTrip?.fishLanded ?? 0,
    biggest: editTrip?.biggest != null ? String(editTrip.biggest) : "",
    notes: editTrip?.notes ?? "",
    // In edit mode, seed the snapshot from the saved trip so conditions are
    // preserved on save unless the user re-snapshots.
    usgs: editTrip ? { flowCFS: editTrip.flowCFS, waterTempF: editTrip.waterTempF, gaugeHeightFt: editTrip.gaugeHeightFt } : null,
    weather: editTrip ? { airTempF: editTrip.airTempF, windMph: editTrip.windMph, windDir: editTrip.windDir, pressureHpa: editTrip.pressureHpa, precipIn: editTrip.precipIn, cloudPct: editTrip.cloudPct, humidity: editTrip.humidity } : null,
    coords: editTrip ? { lat: editTrip.lat, lon: editTrip.lon } : null,
    dataSource: editTrip?.dataSource ?? "usgs",
    pendingMemos: [], // { blob, mime, duration, label, name }
  };
  const selectedGear = new Set(editTrip?.gearUids ?? []);

  const body = el("div");

  // Form
  const riverSel = el("select", {
    onchange: (e) => { formState.riverId = Number(e.target.value); }
  });
  for (const r of state.rivers) {
    const o = el("option", { value: r.id, text: r.section ? `${r.name} — ${r.section}` : r.name });
    if (r.id === formState.riverId) o.selected = true;
    riverSel.append(o);
  }

  body.append(
    el("div", { class: "form-group" }, [
      el("label", { text: "When" }),
      el("input", { type: "datetime-local", value: formState.date, oninput: (e) => formState.date = e.target.value }),
    ]),
    el("div", { class: "form-group" }, [el("label", { text: "River" }), riverSel]),
    el("div", { class: "form-group" }, [
      el("label", { text: "Spot / access (optional)" }),
      el("input", { type: "text", value: formState.locationLabel, placeholder: "e.g. Below Cheesman Dam", oninput: (e) => formState.locationLabel = e.target.value }),
    ]),
  );

  // Conditions snapshot
  const condCard = el("div", { class: "card" });
  if (editTrip) condCard.append(buildConditionsGrid(formState.usgs, formState.weather, formState.dataSource));
  const snapBtn = el("button", {
    class: "btn secondary",
    html: `${icon(ICONS.refresh, 18)} <span>${editTrip ? "Re-snapshot conditions" : "Snapshot current conditions"}</span>`,
    onclick: async (e) => {
      e.preventDefault();
      snapBtn.disabled = true;
      condCard.innerHTML = "";
      condCard.append(conditionsGridSkeleton());
      const river = state.rivers.find(r => r.id === formState.riverId);
      if (!river) { snapBtn.disabled = false; return; }
      // Try geolocation first
      try {
        formState.coords = await new Promise((res, rej) => {
          navigator.geolocation.getCurrentPosition(
            p => res({ lat: p.coords.latitude, lon: p.coords.longitude }),
            rej, { timeout: 8000, maximumAge: 600000 }
          );
        });
      } catch (_) { formState.coords = { lat: river.lat, lon: river.lon }; }
      try { formState.usgs = river.source === "dwr" ? await fetchDWR(river.siteCode) : await fetchUSGS(river.siteCode); } catch (_) {}
      try { formState.weather = await fetchWeather(formState.coords.lat, formState.coords.lon); } catch (_) {}
      formState.dataSource = river.source || "usgs";
      condCard.innerHTML = "";
      condCard.append(buildConditionsGrid(formState.usgs, formState.weather, formState.dataSource));
      snapBtn.disabled = false;
    }
  });
  body.append(snapBtn, condCard);

  // Catch details
  const stepperRow = el("div", { class: "form-row" }, [
    el("div", { class: "form-group" }, [
      el("label", { text: "Fish landed" }),
      el("input", { type: "number", min: 0, value: String(formState.fishLanded), oninput: (e) => formState.fishLanded = parseInt(e.target.value) || 0 }),
    ]),
    el("div", { class: "form-group" }, [
      el("label", { text: "Biggest (in)" }),
      el("input", { type: "number", step: "0.1", value: formState.biggest, oninput: (e) => formState.biggest = e.target.value }),
    ]),
  ]);
  body.append(
    stepperRow,
    el("div", { class: "form-group" }, [
      el("label", { text: "Flies used" }),
      el("input", { type: "text", value: formState.fliesUsed, placeholder: "e.g. PT #18, Zebra #20", oninput: (e) => formState.fliesUsed = e.target.value }),
    ]),
    el("div", { class: "form-group" }, [
      el("label", { text: "Leader / tippet" }),
      el("input", { type: "text", value: formState.leaderSetup, placeholder: "e.g. 9ft 3X + 18in 5X", oninput: (e) => formState.leaderSetup = e.target.value }),
    ]),
  );

  // Gear used — tappable chips (rods, waders, boots…)
  const gearCard = el("div", { class: "card" });
  gearCard.append(el("h3", { text: "Gear used" }));
  const activeGear = state.gear.filter(g => !g.retired);
  if (!activeGear.length) {
    gearCard.append(el("div", { style: "color:var(--muted); font-size:13px;", text: "No gear yet — add rods, waders, and boots with the Gear button on the Trips screen." }));
  } else {
    const gearChips = el("div", { class: "chips", style: "flex-wrap:wrap; padding-bottom:0;" });
    for (const g of activeGear) {
      const chip = el("button", {
        class: "chip" + (selectedGear.has(g.uid) ? " active" : ""),
        text: g.name,
        onclick: (e) => {
          e.preventDefault();
          if (selectedGear.has(g.uid)) { selectedGear.delete(g.uid); chip.classList.remove("active"); }
          else { selectedGear.add(g.uid); chip.classList.add("active"); }
        },
      });
      gearChips.append(chip);
    }
    gearCard.append(gearChips);
  }
  body.append(gearCard);

  // Voice memos
  const memoCard = el("div", { class: "card" });
  memoCard.append(el("h3", { text: "Voice memos" }));
  const memoList = el("div");
  const recBtn = el("button", { class: "record-btn", html: `${icon(ICONS.mic, 18)} <span>Record memo</span>` });
  recBtn.onclick = (e) => { e.preventDefault(); toggleRecord(recBtn, memoList, formState); };
  memoCard.append(recBtn, memoList);
  body.append(memoCard);

  // Notes
  body.append(
    el("div", { class: "form-group" }, [
      el("label", { text: "Notes" }),
      el("textarea", { rows: 4, oninput: (e) => formState.notes = e.target.value }, editTrip?.notes || ""),
    ])
  );

  const footer = el("div", { style: "display:flex; gap:8px; margin-top:8px;" }, [
    el("button", { class: "btn secondary", text: "Cancel", onclick: (e) => { e.preventDefault(); stopRecordingIfAny(); closeModal(); } }),
    el("button", {
      class: "btn", text: editTrip ? "Save changes" : "Save trip",
      onclick: async (e) => {
        e.preventDefault();
        stopRecordingIfAny();
        const river = state.rivers.find(r => r.id === formState.riverId);
        if (!river) { toast("Pick a river"); return; }
        const record = {
          ...(editTrip || {}),  // preserve id/uid + any fields we don't touch
          date: new Date(formState.date).getTime(),
          riverId: river.id,
          riverUid: river.uid ?? null,
          riverName: river.section ? `${river.name} — ${river.section}` : river.name,
          locationLabel: formState.locationLabel,
          lat: formState.coords?.lat ?? river.lat,
          lon: formState.coords?.lon ?? river.lon,
          flowCFS: formState.usgs?.flowCFS ?? null,
          waterTempF: formState.usgs?.waterTempF ?? null,
          gaugeHeightFt: formState.usgs?.gaugeHeightFt ?? null,
          airTempF: formState.weather?.airTempF ?? null,
          windMph: formState.weather?.windMph ?? null,
          windDir: formState.weather?.windDir ?? null,
          pressureHpa: formState.weather?.pressureHpa ?? null,
          precipIn: formState.weather?.precipIn ?? null,
          cloudPct: formState.weather?.cloudPct ?? null,
          humidity: formState.weather?.humidity ?? null,
          fliesUsed: formState.fliesUsed,
          leaderSetup: formState.leaderSetup,
          fishLanded: formState.fishLanded,
          biggest: parseFloat(formState.biggest) || null,
          notes: formState.notes,
          gearUids: [...selectedGear],
          memoCount: (editTrip?.memoCount || 0) + formState.pendingMemos.length,
          dataSource: formState.dataSource || "usgs",
        };
        const tripId = await dbPut(state.db, "trips", record);
        for (const m of formState.pendingMemos) {
          await dbPut(state.db, "memos", { tripId, blob: m.blob, mime: m.mime, duration: m.duration, label: m.label, createdAt: Date.now() });
        }
        await reload();
        renderTrips();
        closeModal();
        toast(editTrip ? "Trip updated" : "Trip saved");
      }
    })
  ]);

  openModal(modalShell(editTrip ? "Edit trip" : "New trip", body, footer));
}

// ---------- recording ----------

async function toggleRecord(btn, listEl, formState) {
  if (state.recording) {
    await finishRecording(btn, listEl, formState);
  } else {
    await startRecording(btn);
  }
}

async function startRecording(btn) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    const chunks = [];
    mr.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    mr.start();
    const startedAt = Date.now();
    btn.classList.add("recording");
    btn.innerHTML = `<span class="dot"></span> <span>Stop · 00:00</span>`;
    const timerId = setInterval(() => {
      const s = Math.floor((Date.now() - startedAt) / 1000);
      btn.innerHTML = `<span class="dot"></span> <span>Stop · ${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}</span>`;
    }, 250);
    state.recording = { mr, chunks, startedAt, timerId, stream };
  } catch (err) {
    toast("Mic permission needed");
    console.error(err);
  }
}

async function finishRecording(btn, listEl, formState) {
  const rec = state.recording;
  if (!rec) return;
  clearInterval(rec.timerId);
  await new Promise(res => {
    rec.mr.onstop = res;
    rec.mr.stop();
  });
  const blob = new Blob(rec.chunks, { type: rec.mr.mimeType || "audio/webm" });
  const duration = (Date.now() - rec.startedAt) / 1000;
  rec.stream.getTracks().forEach(t => t.stop());
  state.recording = null;
  btn.classList.remove("recording");
  btn.innerHTML = `${icon(ICONS.mic, 18)} <span>Record memo</span>`;
  if (formState) {
    formState.pendingMemos.push({ blob, mime: blob.type, duration, label: "", name: `memo_${Date.now()}.webm` });
    renderPendingMemos(listEl, formState.pendingMemos);
  } else {
    return { blob, mime: blob.type, duration };
  }
}

function stopRecordingIfAny() {
  if (state.recording) {
    try {
      state.recording.mr.stop();
      state.recording.stream.getTracks().forEach(t => t.stop());
      clearInterval(state.recording.timerId);
    } catch(e){}
    state.recording = null;
  }
}

function renderPendingMemos(listEl, memos) {
  listEl.innerHTML = "";
  memos.forEach((m, idx) => {
    const row = el("div", { class: "memo-row" }, [
      el("div", { class: "play", html: icon(ICONS.mic, 16) }),
      el("div", { class: "meta" }, [
        el("input", { type: "text", placeholder: "Label (optional)", value: m.label, oninput: (e) => m.label = e.target.value, style: "background:transparent; border:0; padding:0; font-size:14px;" }),
        el("div", { class: "dur", text: `${m.duration.toFixed(1)}s` }),
      ]),
      el("button", { class: "del", html: icon(ICONS.trash, 18), onclick: () => { memos.splice(idx, 1); renderPendingMemos(listEl, memos); } }),
    ]);
    listEl.append(row);
  });
}

// ---------- trip detail (modal) ----------

async function openTrip(id) {
  const t = await dbGet(state.db, "trips", id);
  if (!t) return;
  const allMemos = await dbGetAll(state.db, "memos");
  const memos = allMemos.filter(m => m.tripId === id).sort((a,b) => b.createdAt - a.createdAt);

  const body = el("div");

  body.append(el("div", {
    style: "color:var(--muted); font-size:13px; margin-bottom:8px;",
    text: `${new Date(t.date).toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}${t.locationLabel ? " · " + t.locationLabel : ""}`,
  }));

  if (t.lat != null && t.lon != null) {
    body.append(el("div", { class: "card", style: "padding:0; overflow:hidden;" }, [
      el("div", { id: "trip-mini-map", style: "height:200px;" })
    ]));
  }

  const condCard = el("div", { class: "card" }, [
    el("h3", { text: "Conditions" }),
    buildConditionsGrid(
      { flowCFS: t.flowCFS, waterTempF: t.waterTempF, gaugeHeightFt: t.gaugeHeightFt },
      { airTempF: t.airTempF, windMph: t.windMph, windDir: t.windDir, pressureHpa: t.pressureHpa, precipIn: t.precipIn, cloudPct: t.cloudPct, humidity: t.humidity },
      t.dataSource,
    ),
  ]);
  body.append(condCard);

  body.append(el("div", { class: "card" }, [
    el("h3", { text: "On the water" }),
    rowKV("Flies used", t.fliesUsed || "—"),
    rowKV("Leader", t.leaderSetup || "—"),
    rowKV("Gear", gearNames(t) || "—"),
    rowKV("Fish landed", String(t.fishLanded || 0)),
    rowKV("Biggest", t.biggest ? `${t.biggest} in` : "—"),
  ]));

  // Memos
  const memoCard = el("div", { class: "card" });
  memoCard.append(el("h3", { text: "Voice memos" }));
  if (memos.length === 0) {
    memoCard.append(el("div", { style: "color:var(--muted); font-size:13px;", text: "No memos for this trip." }));
  }
  for (const m of memos) {
    memoCard.append(memoRow(m, t.id));
  }
  body.append(memoCard);

  if (t.notes) {
    body.append(el("div", { class: "card" }, [
      el("h3", { text: "Notes" }),
      el("div", { style: "white-space: pre-wrap; color:var(--muted)", text: t.notes }),
    ]));
  }

  const footer = el("div", { style: "display:flex; gap:8px; margin-top:8px;" }, [
    el("button", { class: "btn secondary", text: "Edit trip", onclick: (e) => {
      e.preventDefault();
      closeModal();
      newTripModal(null, t);
    }}),
    el("button", { class: "btn danger", text: "Delete trip", onclick: async (e) => {
      e.preventDefault();
      if (!confirm("Delete this trip and its voice memos?")) return;
      for (const m of memos) await dbDelete(state.db, "memos", m.id);
      await softDelete("trips", t.id);
      await reload();
      renderTrips();
      closeModal();
      toast("Trip deleted");
    }})
  ]);

  openModal(modalShell(t.riverName, body, footer));

  if (t.lat != null && t.lon != null) {
    setTimeout(() => {
      const m = L.map("trip-mini-map", { zoomControl: false, attributionControl: false })
        .setView([t.lat, t.lon], 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18 }).addTo(m);
      L.marker([t.lat, t.lon]).addTo(m).bindPopup(t.riverName);
    }, 50);
  }
}

function rowKV(label, value) {
  return el("div", { class: "row" }, [
    el("div", { class: "label", text: label }),
    el("div", { class: "value", text: value }),
  ]);
}

function memoRow(m, tripId) {
  const wrap = el("div", { class: "memo-row" });
  const play = el("button", { class: "play", html: icon(ICONS.play, 16) });
  const meta = el("div", { class: "meta" }, [
    el("div", { class: "label", text: m.label || new Date(m.createdAt).toLocaleString() }),
    el("div", { class: "dur", text: `${m.duration?.toFixed?.(1) ?? "?"}s` }),
  ]);
  const del = el("button", { class: "del", html: icon(ICONS.trash, 18) });

  let url = null;
  play.onclick = () => {
    if (state.playingMemoId === m.id && state.playingAudio) {
      state.playingAudio.pause();
      state.playingAudio = null;
      state.playingMemoId = null;
      wrap.classList.remove("playing");
      play.innerHTML = icon(ICONS.play, 16);
      return;
    }
    if (state.playingAudio) state.playingAudio.pause();
    if (!url) url = URL.createObjectURL(m.blob);
    const audio = new Audio(url);
    audio.play();
    state.playingAudio = audio;
    state.playingMemoId = m.id;
    wrap.classList.add("playing");
    play.innerHTML = icon(ICONS.stop, 16);
    audio.onended = () => {
      wrap.classList.remove("playing");
      play.innerHTML = icon(ICONS.play, 16);
      state.playingAudio = null;
      state.playingMemoId = null;
    };
  };
  del.onclick = async () => {
    if (state.playingMemoId === m.id) { state.playingAudio?.pause(); }
    await dbDelete(state.db, "memos", m.id);
    const trip = await dbGet(state.db, "trips", tripId);
    if (trip) { trip.memoCount = Math.max(0, (trip.memoCount || 0) - 1); await dbPut(state.db, "trips", trip); }
    wrap.remove();
  };

  wrap.append(play, meta, del);
  return wrap;
}

// ---------- flies tab ----------

function renderFlies() {
  setHeader("Flies", `${state.flies.length} patterns`, [
    el("button", {
      class: "icon-btn",
      "aria-label": "Add fly",
      html: icon(ICONS.plus, 18),
      onclick: () => addFlyModal(),
    }),
  ]);
  const panel = $("#panel-flies");
  panel.innerHTML = "";

  // Search
  panel.append(el("div", { class: "search" }, [
    el("span", { html: icon(ICONS.search, 18) }),
    el("input", { type: "search", placeholder: "Search flies, hatches", value: state.filters.flySearch, oninput: (e) => { state.filters.flySearch = e.target.value; renderFlies(); } }),
  ]));

  // Chips
  const chips = el("div", { class: "chips" });
  const mkChip = (label, active, onclick) => el("button", { class: "chip" + (active ? " active" : ""), text: label, onclick });
  chips.append(mkChip("All", state.filters.flyType == null, () => { state.filters.flyType = null; renderFlies(); }));
  for (const t of FLY_TYPES) {
    chips.append(mkChip(t, state.filters.flyType === t, () => {
      state.filters.flyType = state.filters.flyType === t ? null : t;
      renderFlies();
    }));
  }
  panel.append(chips);

  const q = state.filters.flySearch.trim().toLowerCase();
  const filtered = state.flies.filter(f => {
    if (state.filters.flyType && f.type !== state.filters.flyType) return false;
    if (!q) return true;
    return f.name.toLowerCase().includes(q) || (f.imitates||"").toLowerCase().includes(q);
  });

  const grid = el("div", { class: "fly-grid" });
  for (const f of filtered) {
    grid.append(flyCard(f));
  }
  panel.append(grid);
  if (!filtered.length) {
    panel.append(el("div", { class: "empty", html: `${icon(ICONS.ant, 52)}<h3>No flies match</h3>` }));
  }
}

function flyCard(f) {
  const hero = el("div", { class: "hero" });
  if (f.imageDataUrl) {
    hero.append(el("img", { src: f.imageDataUrl, alt: f.name }));
  } else {
    hero.append(el("div", { html: icon(flyTypeIcon(f.type), 36) }));
  }
  if (f.favorite) hero.append(el("div", { class: "star", html: icon(ICONS.star, 18) }));

  return el("button", { class: "fly-card", onclick: () => openFly(f.id) }, [
    hero,
    el("div", { class: "body" }, [
      el("div", { class: "name", text: f.name }),
      el("div", { class: "desc", text: `${f.type} · #${f.sizes}` }),
    ]),
  ]);
}

async function openFly(id) {
  const f = await dbGet(state.db, "flies", id);
  if (!f) return;
  const body = el("div");

  const hero = el("div", { style: "height:220px; background:linear-gradient(135deg, rgba(46,125,92,0.18), rgba(45,106,142,0.1)); border-radius:14px; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden; margin-bottom:12px;" });
  if (f.imageDataUrl) hero.append(el("img", { src: f.imageDataUrl, alt: f.name, style: "width:100%; height:100%; object-fit:cover; border-radius:14px;" }));
  else hero.append(el("div", { html: icon(flyTypeIcon(f.type), 80), style: "color: var(--teal)" }));

  // Photo picker (file input)
  const fileInput = el("input", { type: "file", accept: "image/*", style: "display:none" });
  fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      f.imageDataUrl = reader.result;
      await dbPut(state.db, "flies", f);
      await reload();
      openFly(id); // re-render
    };
    reader.readAsDataURL(file);
  };
  const camBtn = el("button", {
    class: "icon-btn",
    style: "position:absolute; bottom:8px; right:8px;",
    html: `${icon(ICONS.camera, 18)} <span>Photo</span>`,
    onclick: (e) => { e.preventDefault(); fileInput.click(); },
  });
  hero.append(camBtn, fileInput);

  body.append(hero);

  body.append(el("div", { class: "card" }, [
    rowKV("Type", f.type),
    rowKV("Hook size", `#${f.sizes}`),
    rowKV("Imitates", f.imitates),
    rowKV("Best conditions", f.conditions),
  ]));

  if (f.notes) {
    body.append(el("div", { class: "card" }, [
      el("h3", { text: "Notes" }),
      el("div", { style: "color:var(--muted); white-space:pre-wrap;", text: f.notes }),
    ]));
  }

  const footer = el("div", { style: "display:flex; gap:8px; margin-top:8px;" }, [
    el("button", {
      class: "btn secondary",
      html: f.favorite ? `${icon(ICONS.star, 18)} Unfavorite` : `${icon(ICONS.starOutline, 18)} Favorite`,
      onclick: async (e) => {
        e.preventDefault();
        f.favorite = !f.favorite;
        await dbPut(state.db, "flies", f);
        await reload();
        openFly(id);
        renderFlies();
      }
    }),
  ]);

  openModal(modalShell(f.name, body, footer));
}

function addFlyModal() {
  const fs = { name: "", type: "Dry", sizes: "", imitates: "", conditions: "", notes: "" };
  const sel = el("select", { onchange: (e) => fs.type = e.target.value });
  for (const t of FLY_TYPES) sel.append(el("option", { value: t, text: t }));
  const form = el("div");
  form.append(
    el("div", { class: "form-group" }, [el("label", { text: "Name" }), el("input", { oninput: (e) => fs.name = e.target.value })]),
    el("div", { class: "form-group" }, [el("label", { text: "Type" }), sel]),
    el("div", { class: "form-group" }, [el("label", { text: "Hook sizes (e.g. 14–22)" }), el("input", { oninput: (e) => fs.sizes = e.target.value })]),
    el("div", { class: "form-group" }, [el("label", { text: "Imitates" }), el("input", { oninput: (e) => fs.imitates = e.target.value })]),
    el("div", { class: "form-group" }, [el("label", { text: "Best conditions" }), el("input", { oninput: (e) => fs.conditions = e.target.value })]),
    el("div", { class: "form-group" }, [el("label", { text: "Notes" }), el("textarea", { rows: 3, oninput: (e) => fs.notes = e.target.value })]),
  );
  const footer = el("div", { style: "display:flex; gap:8px; margin-top:8px;" }, [
    el("button", { class: "btn secondary", text: "Cancel", onclick: (e) => { e.preventDefault(); closeModal(); } }),
    el("button", {
      class: "btn", text: "Save",
      onclick: async (e) => {
        e.preventDefault();
        if (!fs.name) { toast("Name required"); return; }
        await dbPut(state.db, "flies", { ...fs, favorite: false, imageDataUrl: null });
        await reload();
        renderFlies();
        closeModal();
        toast("Fly added");
      }
    })
  ]);
  openModal(modalShell("Add a fly", form, footer));
}

// ---------- leaders tab ----------

function renderLeaders() {
  setHeader("Leaders", "Quick-start rigs", []);
  const panel = $("#panel-leaders");
  panel.innerHTML = "";
  for (const l of state.leaders) {
    panel.append(el("button", { class: "card", style: "width:100%; text-align:left;", onclick: () => openLeader(l.id) }, [
      el("div", { style: "font-weight:600; margin-bottom:2px;", text: l.name }),
      el("div", { style: "color:var(--muted); font-size:13px;", text: l.situation }),
      el("div", { style: "margin-top:6px; color:var(--muted); font-size:12px;", text: `${l.rod} · ${l.length} · ${l.taper}` }),
    ]));
  }
}

async function openLeader(id) {
  const l = await dbGet(state.db, "leaders", id);
  if (!l) return;
  const body = el("div");
  body.append(el("div", { class: "card" }, [
    el("h3", { text: "When to use it" }),
    el("div", { style: "color:var(--muted);", text: l.situation }),
    el("div", { style: "height:8px;" }),
    rowKV("Rod", l.rod),
    rowKV("Length", l.length),
    rowKV("Taper", l.taper),
    rowKV("Tippet", l.tippet),
  ]));
  body.append(el("div", { class: "card" }, [
    el("h3", { text: "Rig diagram" }),
    el("div", { class: "diagram", text: l.diagram }),
  ]));
  body.append(el("div", { class: "card" }, [
    el("h3", { text: "Tips" }),
    el("div", { style: "color:var(--muted); white-space:pre-wrap;", text: l.tips }),
  ]));
  openModal(modalShell(l.name, body));
}

// ---------- map tab ----------

let mainMap = null;
let mapLayer = null;
function renderMap() {
  setHeader("Map", "Rivers & trips", []);
  const panel = $("#panel-map");
  panel.innerHTML = "";
  panel.append(el("div", { id: "map" }));

  // Reset for safe re-init when revisiting tab
  setTimeout(() => {
    if (mainMap) { mainMap.remove(); mainMap = null; }
    mainMap = L.map("map").setView([42, -108.5], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "© OpenStreetMap"
    }).addTo(mainMap);

    const riverIcon = L.divIcon({
      className: "river-pin",
      html: `<div style="width:24px;height:24px;border-radius:12px;background:#29b8b2;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 2px white;color:white;font-size:14px;">●</div>`,
      iconSize: [24,24], iconAnchor: [12,12],
    });
    const tripIcon = L.divIcon({
      className: "trip-pin",
      html: `<div style="width:24px;height:24px;border-radius:12px;background:#e6b35a;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 2px white;color:white;font-size:14px;">★</div>`,
      iconSize: [24,24], iconAnchor: [12,12],
    });

    for (const r of state.rivers) {
      const mk = L.marker([r.lat, r.lon], { icon: riverIcon }).addTo(mainMap);
      mk.bindPopup(`<b>${r.name}</b><br/>${r.state}${r.section ? " · " + r.section : ""}<br/><a href="#" data-river="${r.id}">View conditions →</a>`);
      mk.on("popupopen", (e) => {
        const link = e.popup.getElement().querySelector("a[data-river]");
        if (link) link.onclick = (ev) => { ev.preventDefault(); mainMap.closePopup(); openRiver(r.id); };
      });
    }
    for (const t of state.trips.filter(t => t.lat != null)) {
      const mk = L.marker([t.lat, t.lon], { icon: tripIcon }).addTo(mainMap);
      mk.bindPopup(`<b>${t.riverName}</b><br/>${new Date(t.date).toLocaleDateString()}<br/><a href="#" data-trip="${t.id}">View trip →</a>`);
      mk.on("popupopen", (e) => {
        const link = e.popup.getElement().querySelector("a[data-trip]");
        if (link) link.onclick = (ev) => { ev.preventDefault(); mainMap.closePopup(); openTrip(t.id); };
      });
    }
  }, 50);
}

// ---------- quick session ----------

function sessionElapsed(startedAt) {
  const s = Math.floor((Date.now() - startedAt) / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  return `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
}

function saveSessionState() {
  if (!state.session) { localStorage.removeItem("flyfish_session"); return; }
  const { startedAt, riverId, riverName, fishCount, lat, lon, usgs, weather } = state.session;
  localStorage.setItem("flyfish_session", JSON.stringify({ startedAt, riverId, riverName, fishCount, lat, lon, usgs, weather }));
}

function loadSessionState() {
  try {
    const raw = localStorage.getItem("flyfish_session");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function renderSessionUI() {
  const fab    = $("#session-fab");
  const banner = $("#session-banner");
  if (!fab || !banner) return;

  if (!state.session) {
    fab.style.display = "";
    fab.innerHTML = icon(ICONS.fish, 26);
    banner.classList.remove("active");
    document.body.classList.remove("session-on");
    clearInterval(state._sessionTick);
    return;
  }

  fab.style.display = "none";
  banner.classList.add("active");
  document.body.classList.add("session-on");
  $("#s-river-name").textContent = state.session.riverName;
  $("#s-fish-count").textContent = state.session.fishCount;

  clearInterval(state._sessionTick);
  const tick = () => {
    const el = $("#s-timer-display");
    if (el && state.session) el.textContent = sessionElapsed(state.session.startedAt);
  };
  tick();
  state._sessionTick = setInterval(tick, 1000);

  $("#s-plus-btn").onclick = () => bumpFish();
  $("#s-end-btn").onclick  = () => endSessionSheet();
}

function bumpFish() {
  if (!state.session) return;
  state.session.fishCount++;
  const countEl = $("#s-fish-count");
  if (countEl) countEl.textContent = state.session.fishCount;
  saveSessionState();
  const btn = $("#s-plus-btn");
  if (btn) { btn.style.transform = "scale(1.35)"; setTimeout(() => { btn.style.transform = ""; }, 120); }
}

function startSessionSheet() {
  const body = el("div");
  body.append(el("p", {
    style: "color:var(--muted); font-size:14px; margin:0 0 14px;",
    text: "Pick a river. Conditions snapshot automatically in the background.",
  }));

  const searchInput = el("input", { type: "search", placeholder: "Search rivers…", style: "margin-bottom:10px;" });
  const listEl = el("div");

  const renderPicker = (q) => {
    listEl.innerHTML = "";
    const lq = q.toLowerCase();
    const filtered = state.rivers
      .filter(r => !q || `${r.name} ${r.section||""} ${r.state}`.toLowerCase().includes(lq))
      .sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0))
      .slice(0, 25);
    for (const r of filtered) {
      const row = el("button", {
        style: "display:flex; align-items:center; gap:10px; width:100%; text-align:left; padding:11px 10px; border-radius:10px; background:var(--bg-2); border:1px solid var(--line); margin-bottom:6px;",
        onclick: async () => { closeModal(); await beginSession(r); },
      });
      row.append(
        el("div", { html: icon(ICONS.drop, 18), style: "color:var(--teal); flex-shrink:0;" }),
        el("div", {}, [
          el("div", { style: "font-weight:600; font-size:14px;", text: r.section ? `${r.name} — ${r.section}` : r.name }),
          el("div", { style: "font-size:12px; color:var(--muted);", text: r.state }),
        ])
      );
      listEl.append(row);
    }
  };

  searchInput.addEventListener("input", (e) => renderPicker(e.target.value.trim()));
  renderPicker("");
  body.append(searchInput, listEl);
  openModal(modalShell("Start Session", body));
}

async function beginSession(river) {
  const startedAt = Date.now();
  state.session = {
    startedAt,
    riverId: river.id,
    riverName: river.section ? `${river.name} — ${river.section}` : river.name,
    fishCount: 0,
    lat: river.lat, lon: river.lon,
    usgs: null, weather: null,
    _timerId: null,
  };
  saveSessionState();
  renderSessionUI();
  toast(`Session started · ${state.session.riverName}`);

  // Background conditions snapshot — doesn't block UI
  (async () => {
    let lat = river.lat, lon = river.lon;
    try {
      const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(
          p => res({ lat: p.coords.latitude, lon: p.coords.longitude }),
          rej, { timeout: 8000, maximumAge: 600000 }
        )
      );
      lat = pos.lat; lon = pos.lon;
    } catch (_) {}
    let usgs = null, weather = null;
    try { usgs = river.source === "dwr" ? await fetchDWR(river.siteCode) : await fetchUSGS(river.siteCode); } catch (_) {}
    try { weather = await fetchWeather(lat, lon); } catch (_) {}
    if (state.session && state.session.riverId === river.id) {
      state.session.lat = lat; state.session.lon = lon;
      state.session.usgs = usgs; state.session.weather = weather;
      saveSessionState();
    }
  })();
}

function endSessionSheet() {
  if (!state.session) return;
  clearInterval(state._sessionTick);
  const sess = state.session;
  const duration = sessionElapsed(sess.startedAt);
  const body = el("div");

  // Summary
  body.append(el("div", { class: "card" }, [
    el("div", { class: "row" }, [el("span", { class: "label", text: "River" }),    el("span", { class: "value", text: sess.riverName })]),
    el("div", { class: "row" }, [el("span", { class: "label", text: "Duration" }), el("span", { class: "value", text: duration })]),
    el("div", { class: "row" }, [el("span", { class: "label", text: "Fish" }),     el("span", { class: "value", text: sess.fishCount })]),
  ]));

  // Adjust count
  const countInput = el("input", { type: "number", min: 0, value: String(sess.fishCount),
    oninput: (e) => { sess.fishCount = parseInt(e.target.value) || 0; } });
  body.append(el("div", { class: "form-group" }, [
    el("label", { text: "Adjust fish count" }), countInput,
  ]));

  // Biggest
  const biggestInput = el("input", { type: "number", step: "0.5", placeholder: "e.g. 18" });
  body.append(el("div", { class: "form-group" }, [
    el("label", { text: "Biggest fish (inches, optional)" }), biggestInput,
  ]));

  // Flies — tappable chips
  const selectedFlies = new Set();
  const flyChipsEl = el("div", { class: "chips", style: "flex-wrap:wrap; padding-bottom:0;" });
  for (const f of state.flies) {
    const chip = el("button", {
      class: "chip",
      text: f.name,
      onclick: (e) => {
        e.preventDefault();
        if (selectedFlies.has(f.id)) { selectedFlies.delete(f.id); chip.classList.remove("active"); }
        else { selectedFlies.add(f.id); chip.classList.add("active"); }
      },
    });
    flyChipsEl.append(chip);
  }
  body.append(el("div", { class: "form-group" }, [
    el("label", { text: "Flies used — tap to select" }),
    flyChipsEl,
  ]));

  // Gear — tappable chips (active gear only)
  const selectedGear = new Set();
  const activeGear = state.gear.filter(g => !g.retired);
  if (activeGear.length) {
    const gearChipsEl = el("div", { class: "chips", style: "flex-wrap:wrap; padding-bottom:0;" });
    for (const g of activeGear) {
      const chip = el("button", {
        class: "chip",
        text: g.name,
        onclick: (e) => {
          e.preventDefault();
          if (selectedGear.has(g.uid)) { selectedGear.delete(g.uid); chip.classList.remove("active"); }
          else { selectedGear.add(g.uid); chip.classList.add("active"); }
        },
      });
      gearChipsEl.append(chip);
    }
    body.append(el("div", { class: "form-group" }, [
      el("label", { text: "Gear used — tap to select" }),
      gearChipsEl,
    ]));
  }

  // Notes
  const notesInput = el("textarea", { rows: 3, placeholder: "Hatches, tactics, water clarity…" });
  body.append(el("div", { class: "form-group" }, [
    el("label", { text: "Notes" }), notesInput,
  ]));

  const footer = el("div", { style: "display:flex; gap:8px; margin-top:8px;" }, [
    el("button", { class: "btn secondary", text: "Keep fishing",
      onclick: (e) => { e.preventDefault(); closeModal(); renderSessionUI(); },
    }),
    el("button", { class: "btn", text: "Save trip",
      onclick: async (e) => {
        e.preventDefault();
        const fliesUsed = [...selectedFlies]
          .map(id => state.flies.find(f => f.id === id)?.name)
          .filter(Boolean).join(", ");
        await finishSession({
          fishCount: parseInt(countInput.value) || 0,
          biggest: parseFloat(biggestInput.value) || null,
          fliesUsed,
          gearUids: [...selectedGear],
          notes: notesInput.value.trim(),
        });
      },
    }),
  ]);

  openModal(modalShell("End Session", body, footer));
}

async function finishSession(picks) {
  if (!state.session) return;
  const sess = state.session;
  clearInterval(state._sessionTick);
  const river = state.rivers.find(r => r.id === sess.riverId);

  await dbPut(state.db, "trips", {
    date: sess.startedAt,
    riverId: sess.riverId,
    riverUid: river?.uid ?? null,
    riverName: sess.riverName,
    locationLabel: "",
    lat: sess.lat ?? river?.lat,
    lon: sess.lon ?? river?.lon,
    flowCFS:      sess.usgs?.flowCFS      ?? null,
    waterTempF:   sess.usgs?.waterTempF   ?? null,
    gaugeHeightFt:sess.usgs?.gaugeHeightFt?? null,
    airTempF:     sess.weather?.airTempF  ?? null,
    windMph:      sess.weather?.windMph   ?? null,
    windDir:      sess.weather?.windDir   ?? null,
    pressureHpa:  sess.weather?.pressureHpa?? null,
    precipIn:     sess.weather?.precipIn  ?? null,
    cloudPct:     sess.weather?.cloudPct  ?? null,
    humidity:     sess.weather?.humidity  ?? null,
    fliesUsed:    picks.fliesUsed,
    gearUids:     picks.gearUids || [],
    leaderSetup:  "",
    fishLanded:   picks.fishCount,
    biggest:      picks.biggest,
    notes:        picks.notes,
    memoCount:    0,
    dataSource:   river?.source || "usgs",
  });

  state.session = null;
  saveSessionState();
  clearInterval(state._sessionTick);
  renderSessionUI();
  await reload();
  renderTrips();
  closeModal();
  toast("Trip saved!");
}

// ========================================================================
//  Cloud sync + accounts (Supabase)
// ========================================================================

let supaClient = null;
let currentUser = null;
let lastSyncedAt = Number(localStorage.getItem("flyfish_last_sync")) || 0;
let syncStatus = "idle"; // idle | syncing | ok | error

// Map of remote (snake_case) column -> local (camelCase) field, per table.
// id / user_id / updated_at / deleted are handled separately in the converters.
const FIELD_MAP = {
  rivers: {
    name: "name", state: "state", section: "section", source: "source",
    site_code: "siteCode", lat: "lat", lon: "lon",
    favorite: "favorite", custom: "custom",
    last_cfs: "lastCFS", prev_cfs: "prevCFS",
    last_water_temp_f: "lastWaterTempF", last_reading_at: "lastReadingAt",
    notes: "notes",
  },
  trips: {
    date: "date", river_id: "riverUid", river_name: "riverName",
    location_label: "locationLabel", lat: "lat", lon: "lon",
    flow_cfs: "flowCFS", water_temp_f: "waterTempF", gauge_height_ft: "gaugeHeightFt",
    air_temp_f: "airTempF", wind_mph: "windMph", wind_dir: "windDir",
    pressure_hpa: "pressureHpa", precip_in: "precipIn", cloud_pct: "cloudPct",
    humidity: "humidity", flies_used: "fliesUsed", leader_setup: "leaderSetup",
    fish_landed: "fishLanded", biggest: "biggest", notes: "notes",
    memo_count: "memoCount", data_source: "dataSource",
  },
  flies: {
    name: "name", type: "type", sizes: "sizes", imitates: "imitates",
    conditions: "conditions", notes: "notes", favorite: "favorite",
    image_data_url: "imageDataUrl",
  },
  leaders: {
    name: "name", situation: "situation", rod: "rod", length: "length",
    taper: "taper", tippet: "tippet", diagram: "diagram", tips: "tips",
  },
  gear: {
    name: "name", type: "type", brand: "brand", notes: "notes", retired: "retired",
  },
};

function safeParseArr(s) {
  if (Array.isArray(s)) return s;
  if (!s) return [];
  try { const v = JSON.parse(s); return Array.isArray(v) ? v : []; } catch (_) { return []; }
}

function toRemote(store, rec, userId) {
  const map = FIELD_MAP[store];
  const out = {
    id: rec.uid,
    user_id: userId,
    updated_at: new Date(rec.updatedAt || Date.now()).toISOString(),
    deleted: !!rec.deleted,
  };
  for (const [col, key] of Object.entries(map)) out[col] = rec[key] ?? null;
  // trips carry a list of gear uids — stored remotely as JSON text.
  if (store === "trips") out.gear_uids = JSON.stringify(rec.gearUids || []);
  return out;
}

function fromRemote(store, row) {
  const map = FIELD_MAP[store];
  const out = {
    uid: row.id,
    updatedAt: row.updated_at ? Date.parse(row.updated_at) : Date.now(),
    deleted: !!row.deleted,
  };
  for (const [col, key] of Object.entries(map)) out[key] = row[col] ?? null;
  if (store === "trips") out.gearUids = safeParseArr(row.gear_uids);
  return out;
}

// ---- single-row push (debounced) — fired by dbPut on every local edit ----

const pendingPush = new Map(); // uid -> { store, rec }
let pushTimer = null;

function pushRecord(store, rec) {
  if (!currentUser || !supaClient || !SYNCED_STORES.includes(store) || !rec.uid) return;
  pendingPush.set(rec.uid, { store, rec: { ...rec } });
  clearTimeout(pushTimer);
  pushTimer = setTimeout(flushPush, 700);
}

async function flushPush() {
  if (!currentUser || !supaClient || !pendingPush.size) return;
  const items = [...pendingPush.values()];
  pendingPush.clear();
  const byStore = {};
  for (const { store, rec } of items) (byStore[store] ||= []).push(toRemote(store, rec, currentUser.id));
  setSyncStatus("syncing");
  let ok = true;
  for (const [store, rows] of Object.entries(byStore)) {
    try {
      const { error } = await supaClient.from(store).upsert(rows);
      if (error) { ok = false; console.warn("push failed", store, error); }
    } catch (e) { ok = false; console.warn("push error", store, e); }
  }
  if (ok) { lastSyncedAt = Date.now(); localStorage.setItem("flyfish_last_sync", String(lastSyncedAt)); }
  setSyncStatus(ok ? "ok" : "error");
}

// ---- soft delete (tombstone) so deletions propagate across devices ----

async function softDelete(store, id) {
  const rec = await dbGet(state.db, store, id);
  if (!rec) return;
  await dbPut(state.db, store, { ...rec, deleted: true }); // stamps updatedAt + pushes
}

// ---- full two-way sync (last-write-wins by updatedAt) ----

async function syncStore(store) {
  const userId = currentUser?.id;
  if (!userId || !supaClient) return;

  const { data: rows, error } = await supaClient.from(store).select("*");
  if (error) throw error;

  const local = await dbGetAll(state.db, store);
  const localByUid = new Map(local.filter(r => r.uid).map(r => [r.uid, r]));
  const remoteByUid = new Map((rows || []).map(r => [r.id, r]));

  // Pull: apply remote rows that are new or newer than local.
  for (const row of (rows || [])) {
    const rem = fromRemote(store, row);
    const loc = localByUid.get(rem.uid);
    if (!loc) {
      await dbPut(state.db, store, { ...rem, _fromSync: true });
    } else if ((rem.updatedAt || 0) > (loc.updatedAt || 0)) {
      await dbPut(state.db, store, { ...loc, ...rem, id: loc.id, _fromSync: true });
    }
  }

  // Push: send local rows that are missing remotely or newer than remote.
  const toPush = [];
  for (const loc of local) {
    if (!loc.uid) continue;
    const row = remoteByUid.get(loc.uid);
    const remoteTs = row?.updated_at ? Date.parse(row.updated_at) : 0;
    if (!row || (loc.updatedAt || 0) > remoteTs) toPush.push(toRemote(store, loc, userId));
  }
  if (toPush.length) {
    const { error: upErr } = await supaClient.from(store).upsert(toPush);
    if (upErr) throw upErr;
  }
}

// After syncing, re-point each local trip's integer riverId at the local river
// that carries its riverUid (ids differ per device; uids are stable).
async function relinkTripRivers() {
  const rivers = await dbGetAll(state.db, "rivers");
  const byUid = new Map(rivers.filter(r => r.uid).map(r => [r.uid, r.id]));
  for (const t of await dbGetAll(state.db, "trips")) {
    if (t.riverUid && byUid.has(t.riverUid) && t.riverId !== byUid.get(t.riverUid)) {
      await dbPut(state.db, "trips", { ...t, riverId: byUid.get(t.riverUid), _fromSync: true });
    }
  }
}

let syncing = false;
async function fullSync() {
  if (!currentUser || !supaClient || syncing) return;
  syncing = true;
  setSyncStatus("syncing");
  let ok = true;
  try {
    await syncStore("rivers");
    await syncStore("flies");
    await syncStore("leaders");
    await syncStore("trips");
    await relinkTripRivers();
  } catch (err) {
    ok = false;
    console.error("sync failed", err);
  }
  // Always refresh the UI from local data — even on a sync error the screen
  // must never be left blank.
  try { await reload(); rerenderCurrent(); } catch (e) { console.error("rerender failed", e); }
  if (ok) {
    lastSyncedAt = Date.now();
    localStorage.setItem("flyfish_last_sync", String(lastSyncedAt));
    setSyncStatus("ok");
  } else {
    setSyncStatus("error");
    toast("Sync failed — your data is safe on this device");
  }
  syncing = false;
}

function rerenderCurrent() {
  if (state.tab === "rivers") renderRivers();
  else if (state.tab === "trips") renderTrips();
  else if (state.tab === "flies") renderFlies();
  else if (state.tab === "leaders") renderLeaders();
  else if (state.tab === "map") renderMap();
}

// ---- account button + status ----

function setSyncStatus(s) {
  syncStatus = s;
  const btn = $("#account-btn");
  if (!btn) return;
  btn.classList.toggle("sync-syncing", s === "syncing");
  btn.classList.toggle("sync-error", s === "error");
}

function updateAccountButton() {
  const btn = $("#account-btn");
  if (!btn) return;
  const glyph = btn.querySelector(".acct-glyph");
  if (currentUser) {
    btn.classList.add("signed-in");
    const email = currentUser.email || "";
    if (glyph) glyph.textContent = (email[0] || "•").toUpperCase();
  } else {
    btn.classList.remove("signed-in");
    if (glyph) glyph.textContent = "○";
  }
}

function fmtLastSynced() {
  if (!lastSyncedAt) return "never";
  const mins = Math.round((Date.now() - lastSyncedAt) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return new Date(lastSyncedAt).toLocaleDateString();
}

function openAccountSheet() {
  const body = el("div");

  if (!supaClient) {
    body.append(el("div", { class: "card" }, [
      el("div", { style: "color:var(--muted)", text: "Cloud sync is unavailable — couldn't reach the sync library. Your data is still saved on this device." }),
    ]));
    openModal(modalShell("Account", body));
    return;
  }

  if (currentUser) {
    body.append(el("div", { class: "card" }, [
      el("div", { class: "row" }, [el("span", { class: "label", text: "Signed in" }), el("span", { class: "value", text: currentUser.email || "—" })]),
      el("div", { class: "row" }, [el("span", { class: "label", text: "Last synced" }), el("span", { class: "value", text: fmtLastSynced() })]),
    ]));
    body.append(el("button", {
      class: "btn", style: "margin-top:8px;",
      html: `${icon(ICONS.refresh, 18)} <span>Sync now</span>`,
      onclick: async (e) => { e.preventDefault(); await fullSync(); toast("Synced"); closeModal(); openAccountSheet(); },
    }));
    body.append(el("button", {
      class: "btn secondary", style: "margin-top:8px;", text: "Sign out",
      onclick: async (e) => {
        e.preventDefault();
        await supaClient.auth.signOut();
        closeModal();
      },
    }));
    openModal(modalShell("Account", body));
    return;
  }

  // Logged out — email + password sign-in / sign-up.
  body.append(el("div", { class: "card" }, [
    el("div", { style: "color:var(--muted); line-height:1.5;", text: "Sign in to back up your rivers, trips, flies, and leaders and sync them across devices. First time? Pick a password and tap Create account." }),
  ]));

  const emailInput = el("input", { type: "email", placeholder: "you@example.com", autocomplete: "email", inputmode: "email" });
  const passInput  = el("input", { type: "password", placeholder: "Password (min 6 chars)", autocomplete: "current-password" });
  body.append(
    el("div", { class: "form-group" }, [el("label", { text: "Email" }), emailInput]),
    el("div", { class: "form-group" }, [el("label", { text: "Password" }), passInput]),
  );

  const msg = el("div", { style: "color:var(--red); font-size:13px; margin:4px 0; min-height:16px;" });
  body.append(msg);

  const signInBtn = el("button", { class: "btn", style: "margin-top:4px;", text: "Sign in" });
  const signUpBtn = el("button", { class: "btn secondary", style: "margin-top:8px;", text: "Create account" });

  function creds() {
    const email = emailInput.value.trim();
    const password = passInput.value;
    if (!email || !email.includes("@")) { msg.textContent = "Enter a valid email."; return null; }
    if (!password || password.length < 6) { msg.textContent = "Password must be at least 6 characters."; return null; }
    return { email, password };
  }
  function busy(b, label) {
    signInBtn.disabled = signUpBtn.disabled = b;
    if (b) msg.textContent = "";
  }

  signInBtn.onclick = async (e) => {
    e.preventDefault();
    const c = creds(); if (!c) return;
    busy(true);
    try {
      const { error } = await supaClient.auth.signInWithPassword(c);
      if (error) throw error;
      closeModal(); // SIGNED_IN handler runs fullSync
    } catch (err) {
      console.error(err);
      busy(false);
      msg.textContent = /invalid login/i.test(err.message || "")
        ? "Wrong email or password. New here? Tap Create account."
        : (err.message || "Sign-in failed.");
    }
  };

  signUpBtn.onclick = async (e) => {
    e.preventDefault();
    const c = creds(); if (!c) return;
    busy(true);
    try {
      const { data, error } = await supaClient.auth.signUp(c);
      if (error) throw error;
      if (data.session) {
        closeModal(); // signed in immediately (email confirmation off)
      } else {
        // Email confirmation is ON in Supabase — sign-in won't work until confirmed.
        msg.style.color = "var(--muted)";
        msg.textContent = "Account created. Check your email to confirm, then Sign in. (Tip: disable 'Confirm email' in Supabase Auth settings to skip this.)";
        busy(false);
      }
    } catch (err) {
      console.error(err);
      busy(false);
      msg.style.color = "var(--red)";
      msg.textContent = /already registered/i.test(err.message || "")
        ? "That email already has an account — tap Sign in."
        : (err.message || "Could not create account.");
    }
  };

  body.append(signInBtn, signUpBtn);
  openModal(modalShell("Account", body));
}

async function initAuth() {
  const btn = $("#account-btn");
  if (btn) btn.addEventListener("click", () => openAccountSheet());

  if (!window.supabase) { console.warn("Supabase library not loaded"); return; }
  supaClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });

  try {
    const { data: { session } } = await supaClient.auth.getSession();
    currentUser = session?.user ?? null;
  } catch (e) { console.warn("getSession failed", e); }
  updateAccountButton();

  supaClient.auth.onAuthStateChange((event, session) => {
    const wasUser = currentUser?.id;
    currentUser = session?.user ?? null;
    updateAccountButton();
    if (event === "SIGNED_IN" && currentUser && currentUser.id !== wasUser) {
      toast("Signed in — syncing");
      fullSync();
    } else if (event === "SIGNED_OUT") {
      toast("Signed out");
      setSyncStatus("idle");
    }
  });

  if (currentUser) fullSync();

  // Re-sync when the app comes back to the foreground.
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && currentUser) fullSync();
  });
}

// ---------- boot ----------

(async function init() {
  try {
    state.db = await openDB();
    await seedIfNeeded(state.db);
    await reload();
    renderRivers();

    // Restore session that survived a page reload
    const saved = loadSessionState();
    if (saved) {
      state.session = { ...saved, _timerId: null };
    }
    renderSessionUI();

    $("#session-fab").addEventListener("click", () => startSessionSheet());

    // Cloud accounts + sync — additive layer; the app works fully offline without it.
    initAuth();
  } catch (err) {
    console.error(err);
    document.body.innerHTML = `<div style="padding:20px;color:#d8525a">Failed to load: ${err.message}</div>`;
  }
})();
